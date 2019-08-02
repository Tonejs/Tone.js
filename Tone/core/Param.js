import Tone from "../core/Tone";
import "../type/Type";
import "../core/AudioNode";
import "../core/Timeline";

/**
 *  @class Tone.Param wraps the native Web Audio's AudioParam to provide
 *         additional unit conversion functionality. It also
 *         serves as a base-class for classes which have a single,
 *         automatable parameter.
 *  @extends {Tone.AudioNode}
 *  @param  {AudioParam}  param  The parameter to wrap.
 *  @param  {Tone.Type} units The units of the audio param.
 *  @param  {Boolean} convert If the param should be converted.
 */
Tone.Param = function(){

	var options = Tone.defaults(arguments, ["param", "units", "convert"], Tone.Param);
	Tone.AudioNode.call(this, options);

	/**
	 *  The native parameter to control
	 *  @type  {AudioParam}
	 *  @private
	 */
	this._param = this.input = options.param;

	/**
	 *  The units of the parameter
	 *  @type {Tone.Type}
	 */
	this.units = options.units;

	/**
	 *  If the value should be converted or not
	 *  @type {Boolean}
	 */
	this.convert = options.convert;

	/**
	 *  True if the signal value is being overridden by
	 *  a connected signal.
	 *  @readOnly
	 *  @type  {boolean}
	 *  @private
	 */
	this.overridden = false;

	/**
	 * The timeline which tracks all of the automations.
	 * @type {Tone.Timeline}
	 * @private
	 */
	this._events = new Tone.Timeline(1000);

	if (Tone.isDefined(options.value) && this._param){
		this.setValueAtTime(options.value, 0);
	}
};

Tone.extend(Tone.Param, Tone.AudioNode);

/**
 *  Defaults
 *  @type  {Object}
 *  @const
 */
Tone.Param.defaults = {
	"units" : Tone.Type.Default,
	"convert" : true,
	"param" : undefined
};

/**
 * The current value of the parameter.
 * @memberOf Tone.Param#
 * @type {Number}
 * @name value
 */
Object.defineProperty(Tone.Param.prototype, "value", {
	get : function(){
		var now = this.now();
		return this._toUnits(this.getValueAtTime(now));
	},
	set : function(value){
		this._initialValue = this._fromUnits(value);
		this.cancelScheduledValues(this.now());
		this.setValueAtTime(value, this.now());
	}
});

/**
 * The minimum output value of the parameter
 * @memberOf Tone.Param#
 * @type {Number}
 * @name value
 */
Object.defineProperty(Tone.Param.prototype, "minValue", {
	get : function(){
		if (this.units === Tone.Type.Time || this.units === Tone.Type.Frequency ||
			this.units === Tone.Type.NormalRange || this.units === Tone.Type.Positive ||
			this.units === Tone.Type.BPM){
			return 0;
		} else if (this.units === Tone.Type.AudioRange){
			return -1;
		} else if (this.units === Tone.Type.Decibels){
			return -Infinity;
		} else {
			return this._param.minValue;
		}
	}
});

/**
 * The maximum output value of the parameter
 * @memberOf Tone.Param#
 * @type {Number}
 * @name value
 */
Object.defineProperty(Tone.Param.prototype, "maxValue", {
	get : function(){
		if (this.units === Tone.Type.NormalRange ||
			this.units === Tone.Type.AudioRange){
			return 1;
		} else {
			return this._param.maxValue;
		}
	}
});

/**
 *  Convert the given value from the type specified by Tone.Param.units
 *  into the destination value (such as Gain or Frequency).
 *  @private
 *  @param  {*} val the value to convert
 *  @return {number}     the number which the value should be set to
 */
Tone.Param.prototype._fromUnits = function(val){
	if ((this.convert || Tone.isUndef(this.convert)) && !this.overridden){
		switch (this.units){
			case Tone.Type.Time:
				return this.toSeconds(val);
			case Tone.Type.Frequency:
				return this.toFrequency(val);
			case Tone.Type.Decibels:
				return Tone.dbToGain(val);
			case Tone.Type.NormalRange:
				return Math.min(Math.max(val, 0), 1);
			case Tone.Type.AudioRange:
				return Math.min(Math.max(val, -1), 1);
			case Tone.Type.Positive:
				return Math.max(val, 0);
			default:
				return val;
		}
	} else {
		return val;
	}
};

/**
 * Convert the parameters value into the units specified by Tone.Param.units.
 * @private
 * @param  {number} val the value to convert
 * @return {number}
 */
Tone.Param.prototype._toUnits = function(val){
	if (this.convert || Tone.isUndef(this.convert)){
		switch (this.units){
			case Tone.Type.Decibels:
				return Tone.gainToDb(val);
			default:
				return val;
		}
	} else {
		return val;
	}
};

/**
 *  the minimum output value
 *  @type {Number}
 *  @private
 */
Tone.Param.prototype._minOutput = 1e-5;

/**
 *  The event types
 *  @enum {String}
 *  @private
 */
Tone.Param.AutomationType = {
	Linear : "linearRampToValueAtTime",
	Exponential : "exponentialRampToValueAtTime",
	Target : "setTargetAtTime",
	SetValue : "setValueAtTime",
	Cancel : "cancelScheduledValues"
};

/**
 *  Schedules a parameter value change at the given time.
 *  @param {*}	value The value to set the signal.
 *  @param {Time}  time The time when the change should occur.
 *  @returns {Tone.Param} this
 *  @example
 * //set the frequency to "G4" in exactly 1 second from now.
 * freq.setValueAtTime("G4", "+1");
 */
Tone.Param.prototype.setValueAtTime = function(value, time){
	time = this.toSeconds(time);
	value = this._fromUnits(value);
	this._events.add({
		"type" : Tone.Param.AutomationType.SetValue,
		"value" : value,
		"time" : time,
	});
	this.log(Tone.Param.AutomationType.SetValue, value, time);
	this._param.setValueAtTime(value, time);
	return this;
};

/**
 *  Get the signals value at the given time. Subsequent scheduling
 *  may invalidate the returned value.
 *  @param {Time} time When to get the value
 *  @returns {Number} The value at the given time
 */
Tone.Param.prototype.getValueAtTime = function(time){
	time = this.toSeconds(time);
	var after = this._events.getAfter(time);
	var before = this._events.get(time);
	var initialValue = Tone.defaultArg(this._initialValue, this._param.defaultValue);
	var value = initialValue;
	//if it was set by
	if (before === null){
		value = initialValue;
	} else if (before.type === Tone.Param.AutomationType.Target){
		var previous = this._events.getBefore(before.time);
		var previousVal;
		if (previous === null){
			previousVal = initialValue;
		} else {
			previousVal = previous.value;
		}
		value = this._exponentialApproach(before.time, previousVal, before.value, before.constant, time);
	} else if (after === null){
		value = before.value;
	} else if (after.type === Tone.Param.AutomationType.Linear){
		value = this._linearInterpolate(before.time, before.value, after.time, after.value, time);
	} else if (after.type === Tone.Param.AutomationType.Exponential){
		value = this._exponentialInterpolate(before.time, before.value, after.time, after.value, time);
	} else {
		value = before.value;
	}
	return value;
};

/**
 *  Creates a schedule point with the current value at the current time.
 *  This is useful for creating an automation anchor point in order to
 *  schedule changes from the current value.
 *
 *  @param {number=} now (Optionally) pass the now value in.
 *  @returns {Tone.Param} this
 */
Tone.Param.prototype.setRampPoint = function(time){
	time = this.toSeconds(time);
	var currentVal = this.getValueAtTime(time);
	this.cancelAndHoldAtTime(time);
	if (currentVal === 0){
		currentVal = this._minOutput;
	}
	this.setValueAtTime(this._toUnits(currentVal), time);
	return this;
};

/**
 *  Schedules a linear continuous change in parameter value from the
 *  previous scheduled parameter value to the given value.
 *
 *  @param  {number} value
 *  @param  {Time} endTime
 *  @returns {Tone.Param} this
 */
Tone.Param.prototype.linearRampToValueAtTime = function(value, endTime){
	value = this._fromUnits(value);
	endTime = this.toSeconds(endTime);
	this._events.add({
		"type" : Tone.Param.AutomationType.Linear,
		"value" : value,
		"time" : endTime,
	});
	this.log(Tone.Param.AutomationType.Linear, value, endTime);
	this._param.linearRampToValueAtTime(value, endTime);
	return this;
};

/**
 *  Schedules an exponential continuous change in parameter value from
 *  the previous scheduled parameter value to the given value.
 *
 *  @param  {number} value
 *  @param  {Time} endTime
 *  @returns {Tone.Param} this
 */
Tone.Param.prototype.exponentialRampToValueAtTime = function(value, endTime){
	value = this._fromUnits(value);
	value = Math.max(this._minOutput, value);
	endTime = this.toSeconds(endTime);
	//store the event
	this._events.add({
		"type" : Tone.Param.AutomationType.Exponential,
		"time" : endTime,
		"value" : value
	});
	this.log(Tone.Param.AutomationType.Exponential, value, endTime);
	this._param.exponentialRampToValueAtTime(value, endTime);
	return this;
};

/**
 *  Schedules an exponential continuous change in parameter value from
 *  the current time and current value to the given value over the
 *  duration of the rampTime.
 *
 *  @param  {number} value   The value to ramp to.
 *  @param  {Time} rampTime the time that it takes the
 *                               value to ramp from it's current value
 *  @param {Time}	[startTime=now] 	When the ramp should start.
 *  @returns {Tone.Param} this
 *  @example
 * //exponentially ramp to the value 2 over 4 seconds.
 * signal.exponentialRampTo(2, 4);
 */
Tone.Param.prototype.exponentialRampTo = function(value, rampTime, startTime){
	startTime = this.toSeconds(startTime);
	this.setRampPoint(startTime);
	this.exponentialRampToValueAtTime(value, startTime + this.toSeconds(rampTime));
	return this;
};

/**
 *  Schedules an linear continuous change in parameter value from
 *  the current time and current value to the given value over the
 *  duration of the rampTime.
 *
 *  @param  {number} value   The value to ramp to.
 *  @param  {Time} rampTime the time that it takes the
 *                               value to ramp from it's current value
 *  @param {Time}	[startTime=now] 	When the ramp should start.
 *  @returns {Tone.Param} this
 *  @example
 * //linearly ramp to the value 4 over 3 seconds.
 * signal.linearRampTo(4, 3);
 */
Tone.Param.prototype.linearRampTo = function(value, rampTime, startTime){
	startTime = this.toSeconds(startTime);
	this.setRampPoint(startTime);
	this.linearRampToValueAtTime(value, startTime + this.toSeconds(rampTime));
	return this;
};

/**
 *  Start exponentially approaching the target value at the given time. Since it
 *  is an exponential approach it will continue approaching after the ramp duration. The
 *  rampTime is the time that it takes to reach over 99% of the way towards the value.
 *  @param  {number} value   The value to ramp to.
 *  @param  {Time} rampTime the time that it takes the
 *                               value to ramp from it's current value
 *  @param {Time}	[startTime=now] 	When the ramp should start.
 *  @returns {Tone.Param} this
 *  @example
 * //exponentially ramp to the value 2 over 4 seconds.
 * signal.exponentialRampTo(2, 4);
 */
Tone.Param.prototype.targetRampTo = function(value, rampTime, startTime){
	startTime = this.toSeconds(startTime);
	this.setRampPoint(startTime);
	this.exponentialApproachValueAtTime(value, startTime, rampTime);
	return this;
};

/**
 *  Start exponentially approaching the target value at the given time. Since it
 *  is an exponential approach it will continue approaching after the ramp duration. The
 *  rampTime is the time that it takes to reach over 99% of the way towards the value. This methods
 *  is similar to setTargetAtTime except the third argument is a time instead of a 'timeConstant'
 *  @param  {number} value   The value to ramp to.
 *  @param {Time}	time 	When the ramp should start.
 *  @param  {Time} rampTime the time that it takes the
 *                               value to ramp from it's current value
 *  @returns {Tone.Param} this
 *  @example
 * //exponentially ramp to the value 2 over 4 seconds.
 * signal.exponentialRampTo(2, 4);
 */
Tone.Param.prototype.exponentialApproachValueAtTime = function(value, time, rampTime){
	var timeConstant = Math.log(this.toSeconds(rampTime)+1)/Math.log(200);
	time = this.toSeconds(time);
	this.setTargetAtTime(value, time, timeConstant);
	//at 90% start a linear ramp to the final value
	this.cancelAndHoldAtTime(time + rampTime * 0.9);
	this.linearRampToValueAtTime(value, time + rampTime);
	return this;
};

/**
 *  Start exponentially approaching the target value at the given time with
 *  a rate having the given time constant.
 *  @param {number} value
 *  @param {Time} startTime
 *  @param {number} timeConstant
 *  @returns {Tone.Param} this
 */
Tone.Param.prototype.setTargetAtTime = function(value, startTime, timeConstant){
	value = this._fromUnits(value);
	// The value will never be able to approach without timeConstant > 0.
	if (timeConstant <= 0){
		throw new Error("timeConstant must be greater than 0");
	}
	startTime = this.toSeconds(startTime);
	this._events.add({
		"type" : Tone.Param.AutomationType.Target,
		"value" : value,
		"time" : startTime,
		"constant" : timeConstant
	});
	this.log(Tone.Param.AutomationType.Target, value, startTime, timeConstant);
	this._param.setTargetAtTime(value, startTime, timeConstant);
	return this;
};

/**
 *  Sets an array of arbitrary parameter values starting at the given time
 *  for the given duration.
 *
 *  @param {Array} values
 *  @param {Time} startTime
 *  @param {Time} duration
 *  @param {NormalRange} [scaling=1] If the values in the curve should be scaled by some value
 *  @returns {Tone.Param} this
 */
Tone.Param.prototype.setValueCurveAtTime = function(values, startTime, duration, scaling){
	scaling = Tone.defaultArg(scaling, 1);
	duration = this.toSeconds(duration);
	startTime = this.toSeconds(startTime);
	this.setValueAtTime(values[0] * scaling, startTime);
	var segTime = duration / (values.length - 1);
	for (var i = 1; i < values.length; i++){
		this.linearRampToValueAtTime(values[i] * scaling, startTime + i * segTime);
	}
	return this;
};

/**
 *  Cancels all scheduled parameter changes with times greater than or
 *  equal to startTime.
 *
 *  @param  {Time} time
 *  @returns {Tone.Param} this
 */
Tone.Param.prototype.cancelScheduledValues = function(time){
	time = this.toSeconds(time);
	this._events.cancel(time);
	this._param.cancelScheduledValues(time);
	this.log(Tone.Param.AutomationType.Cancel, time);
	return this;
};

/**
 *  This is similar to [cancelScheduledValues](#cancelScheduledValues) except
 *  it holds the automated value at time until the next automated event.
 *  @param  {Time} time
 *  @returns {Tone.Param} this
 */
Tone.Param.prototype.cancelAndHoldAtTime = function(time){
	time = this.toSeconds(time);
	var valueAtTime = this.getValueAtTime(time);
	this.log("cancelAndHoldAtTime", time, "value="+valueAtTime);

	//remove the schedule events
	this._param.cancelScheduledValues(time);

	//if there is an event at the given time
	//and that even is not a "set"
	var before = this._events.get(time);
	var after = this._events.getAfter(time);
	if (before && before.time === time){
		//remove everything after
		if (after){
			this._events.cancel(after.time);
		} else {
			this._events.cancel(time + this.sampleTime);
		}
	} else if (after){
		//cancel the next event(s)
		this._events.cancel(after.time);
		if (after.type === Tone.Param.AutomationType.Linear){
			this.linearRampToValueAtTime(valueAtTime, time);
		} else if (after.type === Tone.Param.AutomationType.Exponential){
			this.exponentialRampToValueAtTime(valueAtTime, time);
		}
	}

	//set the value at the given time
	this._events.add({
		"type" : Tone.Param.AutomationType.SetValue,
		"value" : valueAtTime,
		"time" : time
	});
	this._param.setValueAtTime(valueAtTime, time);
	return this;
};

/**
 *  Ramps to the given value over the duration of the rampTime.
 *  Automatically selects the best ramp type (exponential or linear)
 *  depending on the `units` of the signal
 *
 *  @param  {number} value
 *  @param  {Time} rampTime 	The time that it takes the
 *                              value to ramp from it's current value
 *  @param {Time}	[startTime=now] 	When the ramp should start.
 *  @returns {Tone.Param} this
 *  @example
 * //ramp to the value either linearly or exponentially
 * //depending on the "units" value of the signal
 * signal.rampTo(0, 10);
 *  @example
 * //schedule it to ramp starting at a specific time
 * signal.rampTo(0, 10, 5)
 */
Tone.Param.prototype.rampTo = function(value, rampTime, startTime){
	rampTime = Tone.defaultArg(rampTime, 0.1);
	if (this.units === Tone.Type.Frequency || this.units === Tone.Type.BPM || this.units === Tone.Type.Decibels){
		this.exponentialRampTo(value, rampTime, startTime);
	} else {
		this.linearRampTo(value, rampTime, startTime);
	}
	return this;
};

///////////////////////////////////////////////////////////////////////////
//	AUTOMATION CURVE CALCULATIONS
//	MIT License, copyright (c) 2014 Jordan Santell
///////////////////////////////////////////////////////////////////////////

// Calculates the the value along the curve produced by setTargetAtTime
Tone.Param.prototype._exponentialApproach = function(t0, v0, v1, timeConstant, t){
	return v1 + (v0 - v1) * Math.exp(-(t - t0) / timeConstant);
};

// Calculates the the value along the curve produced by linearRampToValueAtTime
Tone.Param.prototype._linearInterpolate = function(t0, v0, t1, v1, t){
	return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
};

// Calculates the the value along the curve produced by exponentialRampToValueAtTime
Tone.Param.prototype._exponentialInterpolate = function(t0, v0, t1, v1, t){
	return v0 * Math.pow(v1 / v0, (t - t0) / (t1 - t0));
};

/**
 *  Clean up
 *  @returns {Tone.Param} this
 */
Tone.Param.prototype.dispose = function(){
	Tone.AudioNode.prototype.dispose.call(this);
	this._param = null;
	this._events = null;
	return this;
};

export default Tone.Param;

