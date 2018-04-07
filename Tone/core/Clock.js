define(["Tone/core/Tone", "Tone/source/TickSource", "Tone/core/TimelineState",
	"Tone/core/Emitter", "Tone/core/Context"], function(Tone){

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

		var options = Tone.defaults(arguments, ["callback", "frequency"], Tone.Clock);
		Tone.Emitter.call(this);

		/**
		 *  The callback function to invoke at the scheduled tick.
		 *  @type  {Function}
		 */
		this.callback = options.callback;

		/**
		 *  The next time the callback is scheduled.
		 *  @type {Number}
		 *  @private
		 */
		this._nextTick = 0;

		/**
		 *  The tick counter
		 *  @type  {Tone.TickSource}
		 *  @private
		 */
		this._tickSource = new Tone.TickSource(options.frequency);

		/**
		 *  The last time the loop callback was invoked
		 *  @private
		 *  @type {Number}
		 */
		this._lastUpdate = 0;

		/**
		 *  The rate the callback function should be invoked.
		 *  @type  {BPM}
		 *  @signal
		 */
		this.frequency = this._tickSource.frequency;
		this._readOnly("frequency");

		/**
		 *  The state timeline
		 *  @type {Tone.TimelineState}
		 *  @private
		 */
		this._state = new Tone.TimelineState(Tone.State.Stopped);
		//add an initial state
		this._state.setStateAtTime(Tone.State.Stopped, 0);

		/**
		 *  The loop function bound to its context.
		 *  This is necessary to remove the event in the end.
		 *  @type {Function}
		 *  @private
		 */
		this._boundLoop = this._loop.bind(this);

		//bind a callback to the worker thread
		this.context.on("tick", this._boundLoop);
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
			return this._state.getValueAtTime(this.now());
		}
	});

	/**
	 *  Start the clock at the given time. Optionally pass in an offset
	 *  of where to start the tick counter from.
	 *  @param  {Time=}  time    The time the clock should start
	 *  @param  {Ticks=}  offset  Where the tick counter starts counting from.
	 *  @return  {Tone.Clock}  this
	 */
	Tone.Clock.prototype.start = function(time, offset){
		time = this.toSeconds(time);
		if (this._state.getValueAtTime(time) !== Tone.State.Started){
			this._state.setStateAtTime(Tone.State.Started, time);
			this._tickSource.start(time, offset);
			if (time < this._lastUpdate){
				this.emit("start", time, offset);
			}
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
		this._tickSource.stop(time);
		if (time < this._lastUpdate){
			this.emit("stop", time);
		}
		return this;
	};

	/**
	 *  Pause the clock. Pausing does not reset the tick counter.
	 *  @param {Time} [time=now] The time when the clock should stop.
	 *  @returns {Tone.Clock} this
	 */
	Tone.Clock.prototype.pause = function(time){
		time = this.toSeconds(time);
		if (this._state.getValueAtTime(time) === Tone.State.Started){
			this._state.setStateAtTime(Tone.State.Paused, time);
			this._tickSource.pause(time);
			if (time < this._lastUpdate){
				this.emit("pause", time);
			}
		}
		return this;
	};

	/**
	 *  The number of times the callback was invoked. Starts counting at 0
	 *  and increments after the callback was invoked.
	 *  @type {Ticks}
	 */
	Object.defineProperty(Tone.Clock.prototype, "ticks", {
		get : function(){
			return Math.ceil(this.getTicksAtTime(this.now()));
		},
		set : function(t){
			this._tickSource.ticks = t;
		}
	});

	/**
	 *  The time since ticks=0 that the Clock has been running. Accounts
	 *  for tempo curves
	 *  @type {Seconds}
	 */
	Object.defineProperty(Tone.Clock.prototype, "seconds", {
		get : function(){
			return this._tickSource.seconds;
		},
		set : function(s){
			this._tickSource.seconds = s;
		}
	});

	/**
	 *  Return the elapsed seconds at the given time.
	 *  @param  {Time}  time  When to get the elapsed seconds
	 *  @return  {Seconds}  The number of elapsed seconds
	 */
	Tone.Clock.prototype.getSecondsAtTime = function(time){
		return this._tickSource.getSecondsAtTime(time);
	};

	/**
	 * Set the clock's ticks at the given time.
	 * @param  {Ticks} ticks The tick value to set
	 * @param  {Time} time  When to set the tick value
	 * @return {Tone.Clock}       this
	 */
	Tone.Clock.prototype.setTicksAtTime = function(ticks, time){
		this._tickSource.setTicksAtTime(ticks, time);
		return this;
	};

	/**
	 * Get the clock's ticks at the given time.
	 * @param  {Time} time  When to get the tick value
	 * @return {Ticks}       The tick value at the given time.
	 */
	Tone.Clock.prototype.getTicksAtTime = function(time){
		return this._tickSource.getTicksAtTime(time);
	};

	/**
	 * Get the time of the next tick
	 * @param  {Ticks} ticks The tick number.
	 * @param  {Time} before 
	 * @return {Tone.Clock}       this
	 */
	Tone.Clock.prototype.nextTickTime = function(offset, when){
		when = this.toSeconds(when);
		var currentTick = this.getTicksAtTime(when);
		return this._tickSource.getTimeOfTick(currentTick+offset, when);
	};

	/**
	 *  The scheduling loop.
	 *  @private
	 */
	Tone.Clock.prototype._loop = function(){

		var startTime = this._lastUpdate;
		var endTime = this.now();
		this._lastUpdate = endTime;

		if (startTime !== endTime){
			//the state change events
			this._state.forEachBetween(startTime, endTime, function(e){
				switch (e.state){
					case Tone.State.Started : 
						var offset = this._tickSource.getTicksAtTime(e.time);
						this.emit("start", e.time, offset);
						break;
					case Tone.State.Stopped : 
						if (e.time !== 0){
							this.emit("stop", e.time);
						}
						break;
					case Tone.State.Paused :
						this.emit("pause", e.time); 
						break;
				}
			}.bind(this));
			//the tick callbacks
			this._tickSource.forEachTickBetween(startTime, endTime, function(time, ticks){
				this.callback(time, ticks);
			}.bind(this));
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
		return this._state.getValueAtTime(time);
	};

	/**
	 *  Clean up
	 *  @returns {Tone.Clock} this
	 */
	Tone.Clock.prototype.dispose = function(){
		Tone.Emitter.prototype.dispose.call(this);
		this.context.off("tick", this._boundLoop);
		this._writable("frequency");
		this._tickSource.dispose();
		this._tickSource = null;
		this.frequency = null;
		this._boundLoop = null;
		this._nextTick = Infinity;
		this.callback = null;
		this._state.dispose();
		this._state = null;
	};

	return Tone.Clock;
});
