define(["Tone/core/Tone", "Tone/signal/TimelineSignal"], function (Tone) {

	/**
	 * @class Tone.TickSignal extends Tone.TimelineSignal, but adds the capability
	 *        to calculate the number of elapsed ticks. exponential and target curves
	 *        are approximated with multiple linear ramps. 
	 *        
	 *        Thank you Bruno Dias, H. Sofia Pinto, and David M. Matos, for your [WAC paper](https://smartech.gatech.edu/bitstream/handle/1853/54588/WAC2016-49.pdf)
	 *        describing integrating timing functions for tempo calculations. 
	 *
	 * @param {Number} value The initial value of the signal
	 * @extends {Tone.TimelineSignal}
	 */
	Tone.TickSignal = function(value){

		value = Tone.defaultArg(value, 1);

		Tone.TimelineSignal.call(this, {
			"units" : Tone.Type.Ticks,
			"value" : value
		});

		//extend the memory
		this._events.memory = Infinity;

		/**
		 * The paused time
		 * @type {Ticks}
		 * @private
		 */
		this._pausedRate = null;


		/**
		 * Keep track of state
		 * @type {Tone.TimelineState}
		 * @private
		 */
		// this._state = new Tone.TimelineState(Tone.State.Started);
	};

	Tone.extend(Tone.TickSignal, Tone.TimelineSignal);

	/**
	 * Wraps Tone.TimelineSignal methods so that they also
	 * record the ticks.
	 * @param  {Function} method
	 * @return {Function} 
	 * @private
	 */
	function _wrapScheduleMethods(method){
		return function(value, time){
			//make sure it's not paused or stopped
			var lastEvent = this._events.get(time);
			if (lastEvent && lastEvent.type === Tone.State.Stopped && this._pausedRate !== null){
				throw new Error("Tone.TickSignal: cannot schedule automations while stopped.");
			}
			time = this.toSeconds(time);
			method.apply(this, arguments);
			var event = this._events.get(time);
			var previousEvent = this._events.previousEvent(event);
			var ticksUntilTime = this._getTickUntilEvent(previousEvent, time - this.sampleTime);
			event.ticks = Math.max(ticksUntilTime, 0);
			return this;
		};
	}

	Tone.TickSignal.prototype.setValueAtTime = _wrapScheduleMethods(Tone.TimelineSignal.prototype.setValueAtTime);
	Tone.TickSignal.prototype.linearRampToValueAtTime = _wrapScheduleMethods(Tone.TimelineSignal.prototype.linearRampToValueAtTime);

	/**
	 *  Start exponentially approaching the target value at the given time with
	 *  a rate having the given time constant.
	 *  @param {number} value        
	 *  @param {Time} startTime    
	 *  @param {number} timeConstant 
	 *  @returns {Tone.TickSignal} this 
	 */
	Tone.TickSignal.prototype.setTargetAtTime = function(value, time, constant){
		//aproximate it with multiple linear ramps
		time = this.toSeconds(time);
		this.setRampPoint(time);
		//start from previously scheduled value
		var prevEvent = this._events.get(time);
		var segments = 5;
		for (var i = 0; i <= segments; i++){
			var segTime = constant * i + time;
			var rampVal = this._exponentialApproach(prevEvent.time, prevEvent.value, value, constant, segTime);
			this.linearRampToValueAtTime(rampVal, segTime);
		}
		return this;
	};

	/**
	 * Stop the signal from ticking forward and reset the ticks to 0
	 * until it is restarted. 
	 * @param  {Time=} time When to stop the signal
	 * @return {Tone.TickSignal}      this
	 */
	Tone.TickSignal.prototype.stop = function(time){
		time = this.toSeconds(time);
		this._pausedRate = this.getValueAtTime(time);
		this.cancel(time);
		this.setValueAtTime(0, time);
		var event = this._events.get(time);
		event.type = Tone.State.Stopped;
		event.ticks = 0;
		return this;
	};

	/**
	 * Pause the ticks from counting forward. Will remain
	 * at the same tick value until resumed. 
	 * @param  {Time=} time When to pause the signal
	 * @return {Tone.TickSignal}      this
	 */
	Tone.TickSignal.prototype.pause = function(time){
		time = this.toSeconds(time);
		this._pausedRate = this.getValueAtTime(time);
		this.setValueAtTime(0, time);
		var event = this._events.get(time);
		event.type = Tone.State.Stopped;
		return this;
	};

	/**
	 * Start the signal after paused or stopped. Optionally with an offset
	 * to start the tick counter at. 
	 * @param  {Time=} time When to pause the signal
	 * @param  {Ticks=} offset How many ticks to offset the counter
	 * @return {Tone.TickSignal}      this
	 */
	Tone.TickSignal.prototype.start = function(time, offset){
		time = this.toSeconds(time);
		var resumeRate = this._pausedRate;
		this._pausedRate = null;
		this.setValueAtTime(resumeRate, time);
		var event = this._events.get(time);
		event.ticks = Tone.defaultArg(offset, this.getTickAtTime(time));
		return this;
	};

	/**
	 *  Schedules an exponential continuous change in parameter value from 
	 *  the previous scheduled parameter value to the given value.
	 *  @param  {number} value   
	 *  @param  {Time} endTime 
	 *  @returns {Tone.TickSignal} this
	 */
	Tone.TickSignal.prototype.exponentialRampToValueAtTime = function(value, time){
		//aproximate it with multiple linear ramps
		time = this.toSeconds(time);
		//start from previously scheduled value
		var prevEvent = this._events.get(time);
		if (prevEvent === null){
			prevEvent = {
				"value" : this._initial,
				"time" : 0
			};
		}
		var segments = 5;
		var segmentDur = ((time - prevEvent.time)/segments);
		for (var i = 0; i <= segments; i++){
			var segTime = segmentDur * i + prevEvent.time;
			var rampVal = this._exponentialInterpolate(prevEvent.time, prevEvent.value, time, value, segTime);
			this.linearRampToValueAtTime(rampVal, segTime);
		}
		return this;
	};

	/**
	 * Returns the tick value at the time. Takes into account
	 * any automation curves scheduled on the signal.
	 * @param  {Time} time The time to get the tick count at
	 * @return {Ticks}      The number of ticks which have elapsed at the time
	 *                          given any automations. 
	 */
	Tone.TickSignal.prototype._getTickUntilEvent = function(event, time){
		if (event === null){
			event = {
				"ticks" : 0,
				"time" : 0
			};
		}
		if (event.type === Tone.State.Stopped){
			return event.ticks;
		}
		var val0 = this.getValueAtTime(event.time);
		var val1 = this.getValueAtTime(time);
		return 0.5 * (time - event.time) * (val0 + val1) + event.ticks;
	};

	/**
	 * Returns the tick value at the time. Takes into account
	 * any automation curves scheduled on the signal.
	 * @param  {Time} time The time to get the tick count at
	 * @return {Ticks}      The number of ticks which have elapsed at the time
	 *                          given any automations. 
	 */
	Tone.TickSignal.prototype.getTickAtTime = function(time){
		time = this.toSeconds(time);
		var event = this._events.get(time);
		return this._getTickUntilEvent(event, time);
	};

	/**
	 * Given a tick, returns the time that tick occurs at. 
	 * @param  {Ticks} tick
	 * @return {Time}      The time that the tick occurs. 
	 */
	Tone.TickSignal.prototype.getTimeOfTick = function(tick){
		var before = this._events.get(tick, "ticks");
		var after = this._events.getAfter(tick, "ticks");
		if (before && before.ticks === tick){
			return before.time;
		} else if (before && after && 
			after.type === Tone.TimelineSignal.Type.Linear && 
			before.value !== after.value){
			var val0 = this.getValueAtTime(before.time);
			var val1 = this.getValueAtTime(after.time);
			var delta = (val1 - val0) / (after.time - before.time);
			var k = Math.sqrt(Math.pow(val0, 2) - 2 * delta * (before.ticks - tick));
			var sol1 = (-val0 + k) / delta;
			var sol2 = (-val0 - k) / delta;
			return (sol1 > 0 ? sol1 : sol2) + before.time;
		} else if (before){
			if (before.value === 0){
				return Infinity;
			} else {
				return before.time + (tick - before.ticks) / before.value;
			}
		} else {
			return tick / this._initial;
		}
	};

	return Tone.TickSignal;
});