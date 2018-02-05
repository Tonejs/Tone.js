define(["Tone/core/Tone", "Tone/signal/TickSignal", "Tone/core/TimelineState",
	"Tone/core/Timeline", "Tone/core/Param"], function(Tone){

	"use strict";

	/**
	 *  @class  Uses [Tone.TickSignal](TickSignal) to track elapsed ticks with
	 *  		complex automation curves.
	 *
	 * 	@constructor
     *  @param {Frequency} frequency The initial frequency that the signal ticks at
	 *  @extends {Tone}
	 */
	Tone.TickSource = function(){

		var options = Tone.defaults(arguments, ["frequency"], Tone.TickSource);

		/**
		 *  The frequency the callback function should be invoked.
		 *  @type  {Frequency}
		 *  @signal
		 */
		this.frequency = new Tone.TickSignal(options.frequency, Tone.Type.Frequency);
		this._readOnly("frequency");

		/**
		 *  The state timeline
		 *  @type {Tone.TimelineState}
		 *  @private
		 */
		this._state = new Tone.TimelineState(Tone.State.Stopped);

		/**
		 * The offset values of the ticks
		 * @type {Tone.Timeline}
		 * @private
		 */
		this._tickOffset = new Tone.Timeline();
		//add the first event
		this._tickOffset.add({
			"time" : 0,
			"ticks" : -1
		});
	};

	Tone.extend(Tone.TickSource);

	/**
	 *  The defaults
	 *  @const
	 *  @type  {Object}
	 */
	Tone.TickSource.defaults = {
		"frequency" : 1,
	};

	/**
	 *  Returns the playback state of the source, either "started", "stopped" or "paused".
	 *  @type {Tone.State}
	 *  @readOnly
	 *  @memberOf Tone.TickSource#
	 *  @name state
	 */
	Object.defineProperty(Tone.TickSource.prototype, "state", {
		get : function(){
			return this._state.getValueAtTime(this.now());
		}
	});

	/**
	 *  Start the clock at the given time. Optionally pass in an offset
	 *  of where to start the tick counter from.
	 *  @param  {Time=}  time    The time the clock should start
	 *  @param  {Ticks=}  offset  Where the tick counter starts counting from.
	 *  @return  {Tone.TickSource}  this
	 */
	Tone.TickSource.prototype.start = function(time, offset){
		time = this.toSeconds(time);
		if (this._state.getValueAtTime(time) !== Tone.State.Started){
			var ticksAtTime = this.getTicksAtTime(time);
			if (ticksAtTime === -1){
				ticksAtTime = 0;
			}
			offset = Tone.defaultArg(offset, ticksAtTime);
			this._state.setStateAtTime(Tone.State.Started, time);
			this._state.get(time).offset = offset;
			this.setTicksAtTime(offset, time);
		}
		return this;
	};

	/**
	 *  Stop the clock. Stopping the clock resets the tick counter to 0.
	 *  @param {Time} [time=now] The time when the clock should stop.
	 *  @returns {Tone.TickSource} this
	 *  @example
	 * clock.stop();
	 */
	Tone.TickSource.prototype.stop = function(time){
		time = this.toSeconds(time);
		this._state.cancel(time);
		this._state.setStateAtTime(Tone.State.Stopped, time);
		this.setTicksAtTime(-1, time);
		return this;
	};

	/**
	 *  Pause the clock. Pausing does not reset the tick counter.
	 *  @param {Time} [time=now] The time when the clock should stop.
	 *  @returns {Tone.TickSource} this
	 */
	Tone.TickSource.prototype.pause = function(time){
		time = this.toSeconds(time);
		if (this._state.getValueAtTime(time) === Tone.State.Started){
			var pausedTicks = this.getTicksAtTime(time);
			this.setTicksAtTime(pausedTicks, time);
			this._state.setStateAtTime(Tone.State.Paused, time);
		}
		return this;
	};

	/**
	 *  The number of times the callback was invoked. Starts counting at 0
	 *  and increments after the callback was invoked. Returns -1 when stopped.
	 *  @memberOf Tone.TickSource#
	 *  @name ticks
	 *  @type {Ticks}
	 */
	Object.defineProperty(Tone.TickSource.prototype, "ticks", {
		get : function(){
			return this.getTicksAtTime(this.now());
		},
		set : function(t){
			this.setTicksAtTime(t, this.now());
		}
	});

	/**
	 *  The time since ticks=0 that the TickSource has been running. Accounts
	 *  for tempo curves
	 *  @memberOf Tone.TickSource#
	 *  @name seconds
	 *  @type {Seconds}
	 */
	Object.defineProperty(Tone.TickSource.prototype, "seconds", {
		get : function(){
			var time = this.now();
			var ticks = this.getTicksAtTime(time);
			var totalTicks = this.frequency.getTicksAtTime(time);
			if (totalTicks - ticks > 0){
				var tickTime = this.frequency.getTimeOfTick(totalTicks - ticks);
				return this.frequency.ticksToTime(ticks, tickTime).toSeconds();
			} else {
				return this.frequency.ticksToTime(ticks, time).toSeconds();
			}
		},
		set : function(s){
			var now = this.now();
			var ticks = this.frequency.timeToTicks(s, now-s);
			this.setTicksAtTime(ticks, now);
		}
	});

	/**
	 * Get the elapsed ticks at the given time
	 * @param  {Time} time When to get the ticks
	 * @return {Ticks}      The elapsed ticks at the given time.
	 */
	Tone.TickSource.prototype.getTicksAtTime = function(time){
		time = this.toSeconds(time);
		var tickEvent = this._tickOffset.get(time);
		var offset = tickEvent.ticks;
		var elapsedTicks = this.frequency.getTicksAtTime(time) - tickEvent.position;
		if (this._state.getValueAtTime(time) !== Tone.State.Started){
			return offset;
		} else {
			return elapsedTicks + offset;
		}
	};

	/**
	 * Set the clock's ticks at the given time.
	 * @param  {Ticks} ticks The tick value to set
	 * @param  {Time} time  When to set the tick value
	 * @return {Tone.TickSource}       this
	 */
	Tone.TickSource.prototype.setTicksAtTime = function(ticks, time){
		time = this.toSeconds(time);
		this._tickOffset.cancel(time);
		this._tickOffset.add({
			"time" : time,
			"ticks" : ticks,
			"position" : this.frequency.getTicksAtTime(time)
		});
		return this;
	};

	/**
	 *  Returns the scheduled state at the given time.
	 *  @param  {Time}  time  The time to query.
	 *  @return  {String}  The name of the state input in setStateAtTime.
	 *  @example
	 * source.start("+0.1");
	 * source.getStateAtTime("+0.1"); //returns "started"
	 */
	Tone.TickSource.prototype.getStateAtTime = function(time){
		time = this.toSeconds(time);
		return this._state.getValueAtTime(time);
	};

	/**
	 *  Clean up
	 *  @returns {Tone.TickSource} this
	 */
	Tone.TickSource.prototype.dispose = function(){
		Tone.Param.prototype.dispose.call(this);
		this._state.dispose();
		this._state = null;
		this._tickOffset.dispose();
		this._tickOffset = null;
		this._writable("frequency");
		this.frequency.dispose();
		this.frequency = null;
		return this;
	};

	return Tone.TickSource;
});
