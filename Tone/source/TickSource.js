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
		this._state.setStateAtTime(Tone.State.Stopped, 0);

		/**
		 * The offset values of the ticks
		 * @type {Tone.Timeline}
		 * @private
		 */
		this._tickOffset = new Tone.Timeline();
		//add the first event
		this.setTicksAtTime(0, 0);
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
	 *  @param {Ticks=0} offset The number of ticks to start the source at
	 *  @return  {Tone.TickSource}  this
	 */
	Tone.TickSource.prototype.start = function(time, offset){
		time = this.toSeconds(time);
		if (this._state.getValueAtTime(time) !== Tone.State.Started){
			this._state.setStateAtTime(Tone.State.Started, time);
			offset = Tone.defaultArg(offset, 0);
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
		this.setTicksAtTime(0, time);
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
			return this.getSecondsAtTime(this.now());
		},
		set : function(s){
			var now = this.now();
			var ticks = this.frequency.timeToTicks(s, now);
			this.setTicksAtTime(ticks, now);
		}
	});

	/**
	 * Get the elapsed seconds since start at the given time
	 * @param  {Time} time When to get the seconds
	 * @return {Seconds}      The elapsed seconds at the given time.
	 */
	Tone.TickSource.prototype.getSecondsAtTime = function(time){
		time = this.toSeconds(time);
		var stateEvent = this._state.get(time);
		var offsetEvent = this._tickOffset.get(time);
		if (stateEvent.state === Tone.State.Stopped){
			return offsetEvent.seconds;
		} else if (stateEvent.state === Tone.State.Started){
			var elapsedTime = time - offsetEvent.time;
			return elapsedTime + offsetEvent.seconds;
		}
	};

	/**
	 * Get the elapsed ticks at the given time
	 * @param  {Time} time When to get the ticks
	 * @return {Ticks}      The elapsed ticks at the given time.
	 */
	Tone.TickSource.prototype.getTicksAtTime = function(time){
		time = this.toSeconds(time);
		var stateEvent = this._state.get(time);
		var offsetEvent = this._tickOffset.get(time);
		if (!stateEvent){
			return 0;
		} else if (stateEvent.state === Tone.State.Stopped){
			return offsetEvent.ticks;
		} else if (stateEvent.state === Tone.State.Started){
			var startTime = offsetEvent.time;
			var elapsedTicks = this.frequency.getTicksAtTime(time) - this.frequency.getTicksAtTime(startTime);
			return elapsedTicks + offsetEvent.ticks;
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
		// this._tickOffset.cancel(time);
		this._tickOffset.add({
			"time" : time,
			"ticks" : ticks,
			"seconds" : this.frequency.getDurationOfTicks(ticks, time)
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
	 *  Invoke the callback event at all scheduled ticks between the 
	 *  start time and the end time
	 *  @param  {Time}    startTime  The beginning of the search range
	 *  @param  {Time}    endTime    The end of the search range
	 *  @param  {Function<Time, Ticks>}  callback   The callback to invoke with each tick
	 *  @return  {Tone.TickSource}    this
	 */
	Tone.TickSource.prototype.forEachTickBetween = function(startTime, endTime, callback){

		//only iterate through the sections where it is "started"
		var lastStateEvent = this._state.get(startTime);
		this._state.forEachBetween(startTime, endTime, function(event){
			if (lastStateEvent.state === Tone.State.Started && event.state === Tone.State.Stopped){
				this.forEachTickBetween(Math.max(lastStateEvent.time, startTime), event.time, callback);
			}
			lastStateEvent = event;
		}.bind(this));

		startTime = Math.max(lastStateEvent.time, startTime);

		if (lastStateEvent.state === Tone.State.Started && this._state){
			var offsetEvent = this._tickOffset.get(startTime);
			var startTicks = this.frequency.getTicksAtTime(startTime);
			var ticksAtStart = this.frequency.getTicksAtTime(offsetEvent.time);
			var diff = startTicks - ticksAtStart;
			var offset = diff % 1;
			if (offset !== 0){
				offset = 1 - offset;
			}
			var nextTickTime = this.frequency.getTimeOfTick(startTicks + offset);
			var error = null;
			while (nextTickTime < endTime && this._state){
				try {
					callback(nextTickTime, Math.floor(this.getTicksAtTime(nextTickTime + this.sampleTime)));
				} catch (e){
					error = e;
					break;
				}
				if (this._state){
					nextTickTime += this.frequency.getDurationOfTicks(1, nextTickTime);
					var nextEvent = this._tickOffset.get(nextTickTime);
					if (nextEvent !== offsetEvent){
						nextTickTime = nextEvent.time;
						offsetEvent = nextEvent;
					}
				} 
			}
		}

		if (error){
			throw error;
		}
		
		return this;

		/*var event = this._tickOffset.get(startTime);
		var error = null;
		var startTicks = this.frequency.getTicksAtTime(startTime);
		var ticksAtStart = this.frequency.getTicksAtTime(event.time);
		var diff = startTicks - ticksAtStart;
		var offset = diff % 1;*/
		/*console.log(offset);
		if (Math.abs(1 - offset) > 1e-3){
			offset = 1 - offset;
		}*/
		// console.log(offset);
		startTicks -= offset;
		var nextTickTime = this.frequency.getTimeOfTick(startTicks);

		while (nextTickTime <= endTime && this._state){
			// console.log(nextTickTime);
			if (this._state.getValueAtTime(nextTickTime) === Tone.State.Started && nextTickTime >= startTime){
				try {
					callback(nextTickTime, Math.round(this.getTicksAtTime(nextTickTime + this.blockTime)));
				} catch (e){
					error = e;
					break;
				}
			}
			if (this.frequency){
				nextTickTime += this.frequency.getDurationOfTicks(1, nextTickTime);
				var nextEvent = this._tickOffset.getAfter(nextTickTime);
				if (nextEvent !== event){
					nextTickTime = nextEvent.time;
					event = nextEvent;
				}
			} 
		}

		if (error){
			throw error;
		}

		return nextTickTime;
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
