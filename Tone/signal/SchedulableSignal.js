define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/core/Schedulable"], function (Tone) {

	/**
	 *  @class A signal which adds the method _getValueAtTime. 
	 *         Code and inspiration from https://github.com/jsantell/web-audio-automation-timeline
	 */
	Tone.SchedulableSignal = function(){

		//extend Tone.Signal
		Tone.Signal.apply(this, arguments);

		/**
		 *  The scheduled events
		 *  @type {Tone.Schedulable}
		 *  @private
		 */
		this._events = new Tone.Schedulable();

		/**
		 *  The initial scheduled value
		 *  @type {Number}
		 *  @private
		 */
		this._initial = this._value.value;
	};

	Tone.extend(Tone.SchedulableSignal, Tone.Signal);

	/**
	 *  The event types of a schedulable signal.
	 *  @enum {String}
	 */
	Tone.SchedulableSignal.Type = {
		Linear : "linear",
		Exponential : "exponential",
		Target : "target",
		Set : "set"
	};

	///////////////////////////////////////////////////////////////////////////
	//	SCHEDULING
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Schedules a parameter value change at the given time.
	 *  @param {*}	value The value to set the signal.
	 *  @param {Time}  time The time when the change should occur.
	 *  @returns {Tone.SchedulableSignal} this
	 *  @example
	 * //set the frequency to "G4" in exactly 1 second from now. 
	 * freq.setValueAtTime("G4", "+1");
	 */
	Tone.SchedulableSignal.prototype.setValueAtTime = function (value, startTime) {
		value = this._fromUnits(value);
		startTime = this.toSeconds(startTime);
		this._events.addEvent({
			"type" : Tone.SchedulableSignal.Type.Set,
			"value" : value,
			"time" : startTime
		});
		//invoke the original event
		Tone.Signal.prototype.setValueAtTime.apply(this, arguments);
		return this;
	};

	/**
	 *  Schedules a linear continuous change in parameter value from the 
	 *  previous scheduled parameter value to the given value.
	 *  
	 *  @param  {number} value   
	 *  @param  {Time} endTime 
	 *  @returns {Tone.SchedulableSignal} this
	 */
	Tone.SchedulableSignal.prototype.linearRampToValueAtTime = function (value, endTime) {
		value = this._fromUnits(value);
		endTime = this.toSeconds(endTime);
		this._events.addEvent({
			"type" : Tone.SchedulableSignal.Type.Linear,
			"value" : value,
			"time" : endTime
		});
		Tone.Signal.prototype.linearRampToValueAtTime.apply(this, arguments);
		return this;
	};

	/**
	 *  Schedules an exponential continuous change in parameter value from 
	 *  the previous scheduled parameter value to the given value.
	 *  
	 *  @param  {number} value   
	 *  @param  {Time} endTime 
	 *  @returns {Tone.SchedulableSignal} this
	 */
	Tone.SchedulableSignal.prototype.exponentialRampToValueAtTime = function (value, endTime) {
		value = this._fromUnits(value);
		value = Math.max(this._minOutput, value);
		endTime = this.toSeconds(endTime);
		this._events.addEvent({
			"type" : Tone.SchedulableSignal.Type.Exponential,
			"value" : value,
			"time" : endTime
		});
		Tone.Signal.prototype.exponentialRampToValueAtTime.apply(this, arguments);
		return this;
	};

	/**
	 *  Start exponentially approaching the target value at the given time with
	 *  a rate having the given time constant.
	 *  @param {number} value        
	 *  @param {Time} startTime    
	 *  @param {number} timeConstant 
	 *  @returns {Tone.SchedulableSignal} this 
	 */
	Tone.SchedulableSignal.prototype.setTargetAtTime = function (value, startTime, timeConstant) {
		value = this._fromUnits(value);
		value = Math.max(this._minOutput, value);
		startTime = this.toSeconds(startTime);
		this._events.addEvent({
			"type" : Tone.SchedulableSignal.Type.Target,
			"value" : value,
			"time" : startTime,
			"constant" : timeConstant
		});
		Tone.Signal.prototype.setTargetAtTime.apply(this, arguments);
		return this;
	};

	/**
	 *  Cancels all scheduled parameter changes with times greater than or 
	 *  equal to startTime.
	 *  
	 *  @param  {Time} startTime
	 *  @returns {Tone.SchedulableSignal} this
	 */
	Tone.SchedulableSignal.prototype.cancelScheduledValues = function (after) {
		this._events.clear(after);
		Tone.Signal.prototype.cancelScheduledValues.apply(this, arguments);
		return this;
	};

	/**
	 *  Sets the computed value at the given time. This provides
	 *  a point from which a linear or exponential curve
	 *  can be scheduled after.
	 *  @param {Time} time When to set the ramp point
	 *  @returns {Tone.SchedulableSignal} this
	 */
	Tone.SchedulableSignal.prototype.setRampPoint = function (time) {
		time = this.toSeconds(time);
		//get the value at the given time
		var val = this._getValueAtTime(time);
		this.setValueAtTime(val, time);
		return this;
	};

	/**
	 *  Do a linear ramp to the given value between the start and finish times.
	 *  @param {Number} value The value to ramp to.
	 *  @param {Time} start The beginning anchor point to do the linear ramp
	 *  @param {Time} finish The ending anchor point by which the value of
	 *                       the signal will equal the given value.
	 */
	Tone.SchedulableSignal.prototype.linearRampToValueBetween = function (value, start, finish) {
		this.setRampPoint(start);
		this.linearRampToValueAtTime(value, finish);
		return this;
	};

	/**
	 *  Do a exponential ramp to the given value between the start and finish times.
	 *  @param {Number} value The value to ramp to.
	 *  @param {Time} start The beginning anchor point to do the exponential ramp
	 *  @param {Time} finish The ending anchor point by which the value of
	 *                       the signal will equal the given value.
	 */
	Tone.SchedulableSignal.prototype.exponentialRampToValueBetween = function (value, start, finish) {
		this.setRampPoint(start);
		this.exponentialRampToValueAtTime(value, finish);
		return this;
	};

	///////////////////////////////////////////////////////////////////////////
	//	GETTING SCHEDULED VALUES
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Returns the value before or equal to the given time
	 *  @param  {Number}  time  The time to query
	 *  @return  {Object}  The event at or before the given time.
	 *  @private
	 */
	Tone.SchedulableSignal.prototype._searchBefore = function(time){
		return this._events.getEvent(time);
	};

	/**
	 *  The event after the given time
	 *  @param  {Number}  time  The time to query.
	 *  @return  {Object}  The next event after the given time
	 */
	Tone.SchedulableSignal.prototype._searchAfter = function(time){
		return this._events.getNextEvent(time);
	};

	/**
	 *  Get the scheduled value at the given time.
	 *  @param  {Number}  time  The time in seconds.
	 *  @return  {Number}  The scheduled value at the given time.
	 *  @private
	 */
	Tone.SchedulableSignal.prototype._getValueAtTime = function(time){
		var after = this._searchAfter(time);
		var before = this._searchBefore(time);
		//if it was set by
		if (before === null){
			return this._initial;
		} else if (before.type === Tone.SchedulableSignal.Type.Target){
			var previous = this._searchBefore(before.time - 0.0001);
			var previouVal;
			if (previous === null){
				previouVal = this._initial;
			} else {
				previouVal = previous.value;
			}
			return this._exponentialApproach(before.time, previouVal, before.value, before.constant, time);
		} else if (after === null){
			return before.value;
		} else if (after.type === Tone.SchedulableSignal.Type.Linear){
			return this._linearInterpolate(before.time, before.value, after.time, after.value, time);
		} else if (after.type === Tone.SchedulableSignal.Type.Exponential){
			return this._exponentialInterpolate(before.time, before.value, after.time, after.value, time);
		} else {
			return before.value;
		}
	};

	///////////////////////////////////////////////////////////////////////////
	//	AUTOMATION CURVE CALCULATIONS
	//	MIT License, copyright (c) 2014 Jordan Santell
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Calculates the the value along the curve produced by setTargetAtTime
	 *  @private
	 */
	Tone.SchedulableSignal.prototype._exponentialApproach = function (t0, v0, v1, timeConstant, t) {
		return v1 + (v0 - v1) * Math.exp(-(t - t0) / timeConstant);
	};

	/**
	 *  Calculates the the value along the curve produced by linearRampToValueAtTime
	 *  @private
	 */
	Tone.SchedulableSignal.prototype._linearInterpolate = function (t0, v0, t1, v1, t) {
		return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
	};

	/**
	 *  Calculates the the value along the curve produced by exponentialRampToValueAtTime
	 *  @private
	 */
	Tone.SchedulableSignal.prototype._exponentialInterpolate = function (t0, v0, t1, v1, t) {
		v0 = Math.max(this._minOutput, v0);
		return v0 * Math.pow(v1 / v0, (t - t0) / (t1 - t0));
	};

	/**
	 *  Clean up.
	 *  @return {Tone.SchedulableSignal} this
	 */
	Tone.SchedulableSignal.prototype.dispose = function(){
		Tone.Signal.prototype.dispose.call(this);
		this._events.dispose();
		this._events = null;
	};

	return Tone.SchedulableSignal;
});