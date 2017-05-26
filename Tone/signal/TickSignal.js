define(["Tone/core/Tone", "Tone/signal/TimelineSignal"], function (Tone) {

	/**
	 * @class Tone.TickSignal extends Tone.TimelineSignal, but adds the capability
	 *        to calculate the number of elapsed ticks. exponential and target curves
	 *        are approximated with multiple linear ramps. 
	 * @param {Number} value The initial value of the signal
	 * @extends {Tone.TimelineSignal}
	 */
	Tone.TickSignal = function(value){

		Tone.TimelineSignal.call(this, {
			"units" : Tone.Type.Ticks,
			"value" : value
		});

		//extend the memory
		this._events.memory = Infinity;
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
			time = this.toSeconds(time);
			method.apply(this, arguments);
			var event = this._events.get(time);
			event.ticks = Math.max(this.getTickAtTime(event.time - this.sampleTime), 0);
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
		var segmentDur = constant;
		for (var i = 0; i <= segments; i++){
			var segTime = segmentDur * i + time;
			var rampVal = this._exponentialApproach(prevEvent.time, prevEvent.value, value, constant, segTime);
			this.linearRampToValueAtTime(rampVal, segTime);
		}
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
	 * Calculates the number of ticks elapsed between the given interval
	 * @param  {Number} time0
	 * @param  {Number} time1
	 * @return {Ticks}
	 * @private
	 */
	Tone.TickSignal.prototype._getElapsedTicksBetween = function(time0, time1){
		var val0 = this.getValueAtTime(time0);
		var val1 = this.getValueAtTime(time1);
		return 0.5 * (time1 - time0) * (val0 + val1);
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
		if (event === null){
			event = {
				"ticks" : 0,
				"time" : 0
			};
		}
		return this._getElapsedTicksBetween(event.time, time) + event.ticks;
	};

	/**
	 * Given a tick, returns the time that tick occurs at. 
	 * @param  {Ticks} tick
	 * @return {Time}      The time that the tick occurs. 
	 */
	Tone.TickSignal.prototype.getTimeOfTick = function(tick){
		var before = this._events.get(tick, "ticks");
		var after = this._events.getAfter(tick, "ticks");
		if (before !== null && after !== null && after.type === Tone.TimelineSignal.Type.Linear){
			return this._linearInterpolate(before.ticks, before.time, after.ticks, after.time, tick);
		} else if (before !== null){
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