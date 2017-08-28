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
		value = this._fromUnits(value);

		//start from previously scheduled value
		var prevEvent = this._events.get(time);
		var segments = 5;
		for (var i = 0; i <= segments; i++){
			var segTime = constant * i + time;
			var rampVal = this._exponentialApproach(prevEvent.time, prevEvent.value, value, constant, segTime);
			this.linearRampToValueAtTime(this._toUnits(rampVal), segTime);
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
		value = this._fromUnits(value);

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
			this.linearRampToValueAtTime(this._toUnits(rampVal), segTime);
		}
		return this;
	};

	/**
	 * Returns the tick value at the time. Takes into account
	 * any automation curves scheduled on the signal.
	 * @private
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
	 * Return the elapsed time of the number of ticks from the given time
	 * @param {Ticks} ticks The number of ticks to calculate
	 * @param  {Time} time The time to get the next tick from
	 * @return {Seconds} The duration of the number of ticks from the given time in seconds
	 */
	Tone.TickSignal.prototype.getDurationOfTicks = function(ticks, time){
		time = this.toSeconds(time);
		var currentTick = this.getTickAtTime(time);
		return this.getTimeOfTick(currentTick + ticks) - time;
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
