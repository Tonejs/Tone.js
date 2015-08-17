define(["Tone/core/Tone", "Tone/signal/SchedulableSignal", "Tone/core/Schedulable"], function (Tone) {

	
	Tone.Clock = function(){

		Tone.Schedulable.call(this, 0, 0);

		var options = this.optionsObject(arguments, ["callback", "frequency"], Tone.Clock.defaults);

		/**
		 *  The callback function to invoke on the loop
		 *  @type  {Function}
		 *  @private
		 */
		this._callback = options.callback;

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
		this.lookAhead = "auto";

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
		 *  The time the next callback function is invoked
		 *  @type {Number}
		 *  @private
		 */
		this._nextTick = 0;

		/**
		 *  The last time the callback was invoked
		 *  @type  {Number}
		 */
		this._lastUpdate = 0;

		/**
		 *  The rate the callback function should be invoked. 
		 *  @type  {BPM}
		 *  @signal
		 */
		this.frequency = new Tone.SchedulableSignal(options.frequency, Tone.Type.Frequency).noGC();

		/**
		 *  A pre-binded loop function to save a tiny bit of overhead
		 *  of rebinding the function on every frame.
		 *  @type  {Function}
		 *  @private
		 */
		this._boundLoop = this._loop.bind(this);

		//start the loop
		this._loop();

		//initially it's stopped
		this.stop(0);
	};

	Tone.extend(Tone.Clock, Tone.Schedulable);

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
	 *  Returns the playback state of the source, either "started" or "stopped".
	 *  @type {Tone.State}
	 *  @readOnly
	 *  @memberOf Tone.Clock#
	 *  @name state
	 */
	Object.defineProperty(Tone.Clock.prototype, "state", {
		get : function(){
			return this._getStateAtTime(this.now());
		}
	});


	Tone.Clock.prototype.start = function(time){
		time = this.toSeconds(time);
		if (this._getStateAtTime(time) !== Tone.State.Started){
			this._setStateAtTime(Tone.State.Started, time);
		}
		return this;	
	};

	Tone.Clock.prototype.stop = function(time){
		time = this.toSeconds(time);
		if (this._getStateAtTime(time) !== Tone.State.Started || this.retrigger){
			this._setStateAtTime(Tone.State.Stopped, time);
		}
		return this;	
	};

	Tone.Clock.prototype._loop = function(time){
		requestAnimationFrame(this._boundLoop);
		//compute the look ahead
		if (this.lookAhead === "auto"){
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
			this._computedLookAhead = this.lookAhead;
		}
		//if it's started
		if (this.state === Tone.State.Started){
			//get the frequency value to compute the value of the next loop
			var now = this.now();
			while (now + this._computedLookAhead * 2 > this._nextTick){
				if (this._nextTick + this._threshold < now){
					this._nextTick = now;
				}
				this._callback(this._nextTick + this._computedLookAhead * 2);
				this._nextTick += 1 / this.frequency._getValueAtTime(this._nextTick);
			}
		}
	};

	return Tone.Clock;
});