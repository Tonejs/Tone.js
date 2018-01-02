define(["Tone/core/Tone", "Tone/signal/TickSignal", "Tone/core/TimelineState",
	"Tone/core/Emitter", "Tone/core/Context"], function(Tone) {

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
		 *  The last state of the clock.
		 *  @type  {State}
		 *  @private
		 */
		this._lastState = Tone.State.Stopped;

		/**
		 *  The rate the callback function should be invoked.
		 *  @type  {BPM}
		 *  @signal
		 */
		this.frequency = new Tone.TickSignal(options.frequency, Tone.Type.Frequency);
		this._readOnly("frequency");

		/**
		 *  The number of times the callback was invoked. Starts counting at 0
		 *  and increments after the callback was invoked.
		 *  @type {Ticks}
		 *  @private
		 */
		this._ticks = 0;

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
			"ticks" : 0
		});

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
			var ticksAtTime = Math.floor(this.getTicksAtTime(time));
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
	 *  @returns {Tone.Clock} this
	 *  @example
	 * clock.stop();
	 */
	Tone.Clock.prototype.stop = function(time){
		time = this.toSeconds(time);
		this._state.cancel(time);
		this._state.setStateAtTime(Tone.State.Stopped, time);
		this.setTicksAtTime(0, time);
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
			var pausedTicks = this.getTicksAtTime(time);
			this.setTicksAtTime(pausedTicks, time);
			this._state.setStateAtTime(Tone.State.Paused, time);
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
			return this._ticks;
		},
		set : function(t){
			this._ticks = t;
			this.setTicksAtTime(t, this.now());
		}
	});

	/**
	 *  The time since ticks=0 that the Clock has been running. Accounts
	 *  for tempo curves
	 *  @type {Seconds}
	 */
	Object.defineProperty(Tone.Clock.prototype, "seconds", {
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
	Tone.Clock.prototype.getTicksAtTime = function(time){
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
	 * @return {Tone.Clock}       this
	 */
	Tone.Clock.prototype.setTicksAtTime = function(ticks, time){
		time = this.toSeconds(time);
		this._ticks = ticks;
		this._tickOffset.cancel(time);
		this._tickOffset.add({
			"time" : time,
			"ticks" : ticks,
			"position" : this.frequency.getTicksAtTime(time)
		});
		return this;
	};

	/**
	 *  The scheduling loop.
	 *  @private
	 */
	Tone.Clock.prototype._loop = function(){

		//the end of the update interval
		var endTime = this.now() + this.context.updateInterval;

		//the current event at the time of the loop
		var event = this._state.get(endTime);

		if (event){
			//state change events
			if (event.state !== this._lastState){
				this._lastState = event.state;
				switch (event.state){
					case Tone.State.Started:
						this._ticks = event.offset;
						this._nextTick = event.time;
						this.emit("start", event.time, this._ticks);
						break;
					case Tone.State.Stopped:
						this._ticks = 0;
						this.emit("stop", event.time);
						break;
					case Tone.State.Paused:
						this.emit("pause", event.time);
						break;
				}
			}

			//all the tick events
			while (endTime > this._nextTick && this._state){
				var tickTime = this._nextTick;
				if (this.frequency){
					this._nextTick += this.frequency.getDurationOfTicks(1, this._nextTick);
					if (event.state === Tone.State.Started){
						try {
							this.callback(tickTime);
							this._ticks++;
						} catch (e){
							this._ticks++;
							throw e;
						}
					}
				}
			}
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
		this.frequency.dispose();
		this.frequency = null;
		this._tickOffset.dispose();
		this._tickOffset = null;
		this._boundLoop = null;
		this._nextTick = Infinity;
		this.callback = null;
		this._state.dispose();
		this._state = null;
	};

	return Tone.Clock;
});
