define(["Tone/core/Tone", "Tone/signal/TimelineSignal", "Tone/core/TimelineState"], function (Tone) {

	/**
	 *  @class  A sample accurate clock which provides a callback at the given rate. 
	 *          While the callback is not sample-accurate (it is still susceptible to
	 *          loose JS timing), the time passed in as the argument to the callback
	 *          is precise. For most applications, it is better to use Tone.Transport
	 *          instead of the Clock by itself since you can synchronize multiple callbacks.
	 *
	 * 	@constructor
	 * 	@extends {Tone}
	 * 	@param {Frequency} frequency The rate of the callback
	 * 	@param {function} callback The callback to be invoked with the time of the audio event
	 * 	@example
	 * //the callback will be invoked approximately once a second
	 * //and will print the time exactly once a second apart.
	 * var clock = new Tone.Clock(function(time){
	 * 	console.log(time);
	 * }, 1);
	 */
	Tone.Clock = function(){

		var options = this.optionsObject(arguments, ["callback", "frequency"], Tone.Clock.defaults);

		/**
		 *  The callback function to invoke at the scheduled tick.
		 *  @type  {Function}
		 */
		this.callback = options.callback;

		/**
		 *  The time which the clock will schedule events in advance
		 *  of the current time. Scheduling notes in advance improves
		 *  performance and decreases the chance for clicks caused
		 *  by scheduling events in the past. If set to "auto",
		 *  this value will be automatically computed based on the 
		 *  rate of requestAnimationFrame (0.016 seconds). Larger values
		 *  will yeild better performance, but at the cost of latency. 
		 *  Values less than 0.016 are not recommended.
		 *  @type {Number|String}
		 */
		this._lookAhead = "auto";

		/**
		 *  The lookahead value which was automatically
		 *  computed using a time-based averaging.
		 *  @type {Number}
		 *  @private
		 */
		this._computedLookAhead = 1/60;

		/**
		 *  The value afterwhich events are thrown out
		 *  @type {Number}
		 *  @private
		 */
		this._threshold = 0.5;

		/**
		 *  The next time the callback is scheduled.
		 *  @type {Number}
		 *  @private
		 */
		this._nextTick = -1;

		/**
		 *  The last time the callback was invoked
		 *  @type  {Number}
		 *  @private
		 */
		this._lastUpdate = 0;

		/**
		 *  The id of the requestAnimationFrame
		 *  @type {Number}
		 *  @private
		 */
		this._loopID = -1;

		/**
		 *  The rate the callback function should be invoked. 
		 *  @type  {BPM}
		 *  @signal
		 */
		this.frequency = new Tone.TimelineSignal(options.frequency, Tone.Type.Frequency);

		/**
		 *  If the oneneded callback was called.
		 *  @type {Boolean}
		 *  @private
		 */
		this._calledEnded = true;

		/**
		 * Callback is invoked when the clock is stopped.
		 * @type {function}
		 * @example
		 * clock.onended = function(){
		 * 	console.log("the clock is stopped");
		 * }
		 */
		this.onended = options.onended;

		/**
		 *  Keeps track of the number of times the callback was invoked
		 *  @type {Ticks}
		 */
		this.ticks = 0;

		/**
		 *  The state timeline
		 *  @type {Tone.TimelineState}
		 *  @private
		 */
		this._state = new Tone.TimelineState(Tone.State.Stopped);

		/**
		 *  A pre-binded loop function to save a tiny bit of overhead
		 *  of rebinding the function on every frame.
		 *  @type  {Function}
		 *  @private
		 */
		this._boundLoop = this._loop.bind(this);

		this._readOnly("frequency");
		//start the loop
		this._loop();
	};

	Tone.extend(Tone.Clock);

	/**
	 *  The defaults
	 *  @const
	 *  @type  {Object}
	 */
	Tone.Clock.defaults = {
		"callback" : Tone.noOp,
		"frequency" : 1,
		"lookAhead" : "auto",
		"onended" : Tone.noOp
	};

	/**
	 *  Returns the playback state of the source, either "started" or "stopped".
	 *  @type {Tone.State}
	 *  @readOnly
	 *  @memberOf Tone.Clock#
	 *  @name state
	 */
	Object.defineProperty(Tone.Clock.prototype, "state", {
		get : function(){
			return this._state.getStateAtTime(this.now());
		}
	});

	/**
	 *  The time which the clock will schedule events in advance
	 *  of the current time. Scheduling notes in advance improves
	 *  performance and decreases the chance for clicks caused
	 *  by scheduling events in the past. If set to "auto",
	 *  this value will be automatically computed based on the 
	 *  rate of requestAnimationFrame (0.016 seconds). Larger values
	 *  will yeild better performance, but at the cost of latency. 
	 *  Values less than 0.016 are not recommended.
	 *  @type {Number|String}
	 *  @memberOf Tone.Clock#
	 *  @name lookAhead
	 */
	Object.defineProperty(Tone.Clock.prototype, "lookAhead", {
		get : function(){
			return this._lookAhead;
		},
		set : function(val){
			if (val === "auto"){
				this._lookAhead = "auto";
			} else {
				this._lookAhead = this.toSeconds(val);
			}
		}
	});


	Tone.Clock.prototype.start = function(time, offset){
		time = this.toSeconds(time);
		if (this._state.getStateAtTime(time) !== Tone.State.Started){
			offset = this.defaultArg(offset, 0);
			this._state.addEvent({
				"state" : Tone.State.Started, 
				"time" : time,
				"offset" : offset
			});
		}
		return this;	
	};

	Tone.Clock.prototype.stop = function(time){
		time = this.toSeconds(time);
		if (this._state.getStateAtTime(time) !== Tone.State.Stopped){
			this._state.setStateAtTime(Tone.State.Stopped, time);
		}
		return this;	
	};


	Tone.Clock.prototype.pause = function(time){
		time = this.toSeconds(time);
		if (this._state.getStateAtTime(time) === Tone.State.Started){
			this._state.setStateAtTime(Tone.State.Paused, time);
		}
		return this;	
	};

	Tone.Clock.prototype._loop = function(time){
		this._loopID = requestAnimationFrame(this._boundLoop);
		//compute the look ahead
		if (this._lookAhead === "auto"){
			if (!this.isUndef(time)){
				var diff = (time - this._lastUpdate) / 1000;
				this._lastUpdate = time;
				//throw away large differences
				if (diff < this._threshold){
					//averaging
					this._computedLookAhead = (9 * this._computedLookAhead + diff) / 10;
				}
			}
		} else {
			this._computedLookAhead = this._lookAhead;
		}
		//get the frequency value to compute the value of the next loop
		var now = this.now();
		//if it's started
		var lookAhead = this._computedLookAhead * 2;
		var event = this._state.getEvent(now + lookAhead);
		var state = Tone.State.Stopped;
		if (event){
			state = event.state;
			//if it was stopped and now started
			if (this._nextTick === -1 && state === Tone.State.Started){
				this._nextTick = event.time;
				this.ticks = event.offset;
			}
		}
		if (state === Tone.State.Started){
			while (now + lookAhead > this._nextTick){
				//catch up
				if (now > this._nextTick + this._threshold){
					this._nextTick = now;
				}
				var tickTime = this._nextTick;
				this._nextTick += 1 / this.frequency.getValueAtTime(this._nextTick);
				this.callback(tickTime);
				this.ticks++;
			}
		} else if (state === Tone.State.Stopped){
			this._nextTick = -1;
			this.ticks = 0;
		}
	};

	/**
	 *  Returns the scheduled state scheduled before or at
	 *  the given time.
	 *  @param  {Time}  time  The time to query.
	 *  @return  {String}  The name of the state input in setStateAtTime.
	 */
	Tone.Clock.prototype.getStateAtTime = function(time){
		return this._state.getStateAtTime(time);
	};

	/**
	 *  Clean up
	 *  @returns {Tone.Clock} this
	 */
	Tone.Clock.prototype.dispose = function(){
		cancelAnimationFrame(this._loopID);
		Tone.TimelineState.prototype.dispose.call(this);
		this._writable("frequency");
		this.frequency.dispose();
		this.frequency = null;
		this._boundLoop = Tone.noOp;
		this._nextTick = Infinity;
		this.callback = null;
		this._state.dispose();
		this._state = null;
	};

	return Tone.Clock;
});