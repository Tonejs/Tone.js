import { Time, Unit, UnitName } from "../type/Units";

/**
 * Abstract base class for [[Param]] and [[Signal]]
 * @category Core
 */
export abstract class AbstractParam<Type extends Unit> {

	/**
	 * Schedules a parameter value change at the given time.
	 * Does this work? is this working. are you working?
	 * @param value The value to set the signal.
	 * @param time The time when the change should occur.
	 * @example
	 * //set the frequency to "G4" in exactly 1 second from now.
	 * freq.setValueAtTime("G4", "+1");
	 */
	abstract setValueAtTime(value: Type, time: Time): this;

	/**
	 * Get the signals value at the given time. Subsequent scheduling
	 * may invalidate the returned value.
	 * @param time When to get the value
	 */
	abstract getValueAtTime(time: Time): Type;

	/**
	 * Creates a schedule point with the current value at the current time.
	 * This is useful for creating an automation anchor point in order to
	 * schedule changes from the current value.
	 * @param time When to add a ramp point.
	 * @example
	 * param.getValueAtTime(Tone.now())
	 */
	abstract setRampPoint(time: Time): this;

	/**
	 * Schedules a linear continuous change in parameter value from the
	 * previous scheduled parameter value to the given value.
	 */
	abstract linearRampToValueAtTime(value: Type, time: Time): this;

	/**
	 * Schedules an exponential continuous change in parameter value from
	 * the previous scheduled parameter value to the given value.
	 */
	abstract exponentialRampToValueAtTime(value: Type, time: Time): this;

	/**
	 * Schedules an exponential continuous change in parameter value from
	 * the current time and current value to the given value over the
	 * duration of the rampTime.
	 * @param value   The value to ramp to.
	 * @param rampTime the time that it takes the
	 *                             value to ramp from it's current value
	 * @param startTime When the ramp should start.
	 * @example
	 * //exponentially ramp to the value 2 over 4 seconds.
	 * signal.exponentialRampTo(2, 4);
	 */
	abstract exponentialRampTo(value: Type, rampTime: Time, startTime?: Time): this;

	/**
	 * Schedules an linear continuous change in parameter value from
	 * the current time and current value to the given value over the
	 * duration of the rampTime.
	 *
	 * @param  value   The value to ramp to.
	 * @param  rampTime the time that it takes the
	 *                              value to ramp from it's current value
	 * @param startTime 	When the ramp should start.
	 * @returns {Param} this
	 * @example
	 * //linearly ramp to the value 4 over 3 seconds.
	 * signal.linearRampTo(4, 3);
	 */
	abstract linearRampTo(value: Type, rampTime: Time, startTime?: Time): this;

	/**
	 * Start exponentially approaching the target value at the given time. Since it
	 * is an exponential approach it will continue approaching after the ramp duration. The
	 * rampTime is the time that it takes to reach over 99% of the way towards the value.
	 * @param  value   The value to ramp to.
	 * @param  rampTime the time that it takes the
	 *                              value to ramp from it's current value
	 * @param startTime 	When the ramp should start.
	 * @example
	 * //exponentially ramp to the value 2 over 4 seconds.
	 * signal.exponentialRampTo(2, 4);
	 */
	abstract targetRampTo(value: Type, rampTime: Time, startTime?: Time): this;

	/**
	 * Start exponentially approaching the target value at the given time. Since it
	 * is an exponential approach it will continue approaching after the ramp duration. The
	 * rampTime is the time that it takes to reach over 99% of the way towards the value. This methods
	 * is similar to setTargetAtTime except the third argument is a time instead of a 'timeConstant'
	 * @param  value   The value to ramp to.
	 * @param time 	When the ramp should start.
	 * @param  rampTime the time that it takes the value to ramp from it's current value
	 * @example
	 * //exponentially ramp to the value 2 over 4 seconds.
	 * signal.exponentialRampTo(2, 4);
	 */
	abstract exponentialApproachValueAtTime(value: Type, time: Time, rampTime: Time): this;

	/**
	 * Start exponentially approaching the target value at the given time with
	 * a rate having the given time constant.
	 * @param value
	 * @param startTime
	 * @param timeConstant
	 */
	abstract setTargetAtTime(value: Type, startTime: Time, timeConstant: number): this;

	/**
	 * Sets an array of arbitrary parameter values starting at the given time
	 * for the given duration.
	 *
	 * @param values
	 * @param startTime
	 * @param duration
	 * @param scaling If the values in the curve should be scaled by some value
	 */
	abstract setValueCurveAtTime(values: Type[], startTime: Time, duration: Time, scaling?: number): this;

	/**
	 * Cancels all scheduled parameter changes with times greater than or
	 * equal to startTime.
	 */
	abstract cancelScheduledValues(time: Time): this;

	/**
	 * This is similar to [[cancelScheduledValues]] except
	 * it holds the automated value at time until the next automated event.
	 */
	abstract cancelAndHoldAtTime(time: Time): this;

	/**
	 * Ramps to the given value over the duration of the rampTime.
	 * Automatically selects the best ramp type (exponential or linear)
	 * depending on the `units` of the signal
	 *
	 * @param  value
	 * @param  rampTime The time that it takes the value to ramp from it's current value
	 * @param startTime When the ramp should start.
	 * @example
	 * //ramp to the value either linearly or exponentially
	 * //depending on the "units" value of the signal
	 * signal.rampTo(0, 10);
	 * @example
	 * //schedule it to ramp starting at a specific time
	 * signal.rampTo(0, 10, 5)
	 */
	abstract rampTo(value: Type, rampTime: Time, startTime?: Time): this;

	/**
	 * The current value of the parameter. Setting this value
	 * is equivalent to setValueAtTime(value, context.currentTime)
	 */
	abstract value: Type;

	/**
	 * If the value should be converted or not
	 */
	abstract convert: boolean;

	/**
	 * The unit type
	 */
	abstract readonly units: UnitName;

	/**
	 * True if the signal value is being overridden by
	 * a connected signal. Internal use only.
	 */
	abstract overridden: boolean;

	/**
	 * The minimum value of the output given the units
	 */
	abstract readonly minValue: number;

	/**
	 * The maximum value of the output given the units
	 */
	abstract readonly maxValue: number;
}
