define(["Tone/core/Tone", "Tone/signal/TimelineSignal", "Tone/core/TimelineState", "Tone/core/Emitter"], function (Tone) {

	"use strict";

	/**
	 *  @class  A sample accurate clock which provides a callback at the given rate. 
	 *          While the callback is not sample-accurate (it is still susceptible to
	 *          loose JS timing), the time passed in as the argument to the callback
	 *          is precise. For most applications, it is better to use Tone.Transport
	 *          instead of the Clock by itself since you can synchronize multiple callbacks.
	 *
	 * 	@constructor
	 *  @extends {Tone.Emitter}
	 * 	@param {function} callback The callback to be invoked with the time of the audio event
	 * 	@param {Frequency} frequency The rate of the callback
	 * 	@example
	 * //the callback will be invoked approximately once a second
	 * //and will print the time exactly once a second apart.
	 * var clock = new Tone.Clock(function(time){
	 * 	console.log(time);
	 * }, 1);
	 */
	Tone.Clock = function(){

		Tone.Emitter.call(this);

		var options = this.optionsObject(arguments, ["callback", "frequency"], Tone.Clock.defaults);

		/**
		 *  The callback function to invoke at the scheduled tick.
		 *  @type  {Function}
		 */
		this.callback = options.callback;

		/**
		 *  The internal lookahead value
		 *  @type {Number|String}
		 *  @private
		 */
		this._lookAhead = "auto";

		/**
		 *  The lookahead value which was automatically
		 *  computed using a time-based averaging.
		 *  @type {Number}
		 *  @private
		 */
		this._computedLookAhead = UPDATE_RATE/1000;

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
		this._lastUpdate = -1;

		/**
		 *  The rate the callback function should be invoked. 
		 *  @type  {BPM}
		 *  @signal
		 */
		this.frequency = new Tone.TimelineSignal(options.frequency, Tone.Type.Frequency);

		/**
		 *  The number of times the callback was invoked. Starts counting at 0
		 *  and increments after the callback was invoked. 
		 *  @type {Ticks}
		 *  @readOnly
		 */
		this.ticks = 0;

		/**
		 *  The state timeline
		 *  @type {Tone.TimelineState}
		 *  @private
		 */
		this._state = new Tone.TimelineState(Tone.State.Stopped);

		/**
		 *  The loop function bound to its context. 
		 *  This is necessary to remove the event in the end.
		 *  @type {Function}
		 *  @private
		 */
		this._boundLoop = this._loop.bind(this);

		//bind a callback to the worker thread
    	Tone.Clock._worker.addEventListener("message", this._boundLoop);

		this._readOnly("frequency");
	};

	Tone.extend(Tone.Clock, Tone.Emitter);

	/**
	 *  The defaults
	 *  @const
	 *  @type  {Object}
	 */
	Tone.Clock.defaults = {
		"callback" : Tone.noOp,
		"frequency" : 1,
		"lookAhead" : "auto",
	};

	/**
	 *  Returns the playback state of the source, either "started", "stopped" or "paused".
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
	 *  rate of the update (~0.02 seconds). Larger values
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


	/**
	 *  Start the clock at the given time. Optionally pass in an offset
	 *  of where to start the tick counter from.
	 *  @param  {Time}  time    The time the clock should start
	 *  @param  {Ticks=}  offset  Where the tick counter starts counting from.
	 *  @return  {Tone.Clock}  this
	 */
	Tone.Clock.prototype.start = function(time, offset){
		time = this.toSeconds(time);
		if (this._state.getStateAtTime(time) !== Tone.State.Started){
			this._state.addEvent({
				"state" : Tone.State.Started, 
				"time" : time,
				"offset" : offset
			});
		}
		return this;	
	};

	/**
	 *  Stop the clock. Stopping the clock resets the tick counter to 0.
	 *  @param {Time} [time=now] The time when the clock should stop.
	 *  @returns {Tone.Clock} this
	 *  @example
	 * clock.stop();
	 */
	Tone.Clock.prototype.stop = function(time){
		time = this.toSeconds(time);
		this._state.cancel(time);
		this._state.setStateAtTime(Tone.State.Stopped, time);
		return this;	
	};


	/**
	 *  Pause the clock. Pausing does not reset the tick counter.
	 *  @param {Time} [time=now] The time when the clock should stop.
	 *  @returns {Tone.Clock} this
	 */
	Tone.Clock.prototype.pause = function(time){
		time = this.toSeconds(time);
		if (this._state.getStateAtTime(time) === Tone.State.Started){
			this._state.setStateAtTime(Tone.State.Paused, time);
		}
		return this;	
	};

	/**
	 *  The scheduling loop.
	 *  @param  {Number}  time  The current page time starting from 0
	 *                          when the page was loaded.
	 *  @private
	 */
	Tone.Clock.prototype._loop = function(){
		//compute the look ahead
		if (this._lookAhead === "auto"){
			var time = this.now();
			if (this._lastUpdate !== -1){
				var diff = (time - this._lastUpdate);
				//max size on the diff
				diff = Math.min(10 * UPDATE_RATE/1000, diff);
				//averaging
				this._computedLookAhead = (9 * this._computedLookAhead + diff) / 10;
			}
			this._lastUpdate = time;
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
				if (!this.isUndef(event.offset)){
					this.ticks = event.offset;
				}
				this.emit("start", event.time, this.ticks);
			}
		}
		if (state === Tone.State.Started){
			while (now + lookAhead > this._nextTick){
				var tickTime = this._nextTick;
				this._nextTick += 1 / this.frequency.getValueAtTime(this._nextTick);
				this.callback(tickTime);
				this.ticks++;
			}
		} else if (state === Tone.State.Stopped){
			if (event && this.ticks !== 0){
				this.emit("stop", event.time);
			}
			this._nextTick = -1;
			this.ticks = 0;
		} else if (state === Tone.State.Paused){
			if (this._nextTick !== -1){
				this.emit("pause", event.time);
			}
			this._nextTick = -1;
		}
	};

	/**
	 *  Returns the scheduled state at the given time.
	 *  @param  {Time}  time  The time to query.
	 *  @return  {String}  The name of the state input in setStateAtTime.
	 *  @example
	 * clock.start("+0.1");
	 * clock.getStateAtTime("+0.1"); //returns "started"
	 */
	Tone.Clock.prototype.getStateAtTime = function(time){
		time = this.toSeconds(time);
		return this._state.getStateAtTime(time);
	};

	/**
	 *  Clean up
	 *  @returns {Tone.Clock} this
	 */
	Tone.Clock.prototype.dispose = function(){
		Tone.Emitter.prototype.dispose.call(this);
		Tone.TimelineState.prototype.dispose.call(this);
		Tone.Clock._worker.removeEventListener("message", this._boundLoop);
		this._writable("frequency");
		this.frequency.dispose();
		this.frequency = null;
		this._boundLoop = null;
		this._nextTick = Infinity;
		this.callback = null;
		this._state.dispose();
		this._state = null;
	};

	//URL Shim
	window.URL = window.URL || window.webkitURL;

	/**
	 *  The update rate in Milliseconds
	 *  @const
	 *  @type  {Number}
	 *  @private
	 */
	var UPDATE_RATE = 20;

	/**
	 *  The script which runs in a web worker
	 *  @type {Blob}
	 *  @private
	 */
	var blob = new Blob(["setInterval(function(){self.postMessage('tick')}, "+UPDATE_RATE+")"]);

	/**
	 *  Create a blob url from the Blob
	 *  @type  {URL}
	 *  @private
	 */
  	var blobUrl = URL.createObjectURL(blob);

  	/**
	 *  The Worker which generates a regular callback
	 *  @type {Worker}
	 *  @private
	 *  @static
	 */
	Tone.Clock._worker = new Worker(blobUrl);

	return Tone.Clock;
});