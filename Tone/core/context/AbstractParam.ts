import { Time, UnitMap, UnitName } from "../type/Units";

/**
 * Abstract base class for [[Param]] and [[Signal]]
 */
export abstract class AbstractParam<TypeName extends UnitName> {

	/**
	 * Schedules a parameter value change at the given time.
	 * @param value The value to set the signal.
	 * @param time The time when the change should occur.
	 * @example
	 * import { Oscillator } from "tone";
	 * const osc = new Oscillator().toDestination().start();
	 * // set the frequency to "G4" in exactly 1 second from now.
	 * osc.frequency.setValueAtTime("G4", "+1");
	 */
	abstract setValueAtTime(value: UnitMap[TypeName], time: Time): this;

	/**
	 * Get the signals value at the given time. Subsequent scheduling
	 * may invalidate the returned value.
	 * @param time When to get the value
	 * @example
	 * import { now, Oscillator } from "tone";
	 * const osc = new Oscillator().toDestination().start();
	 * // set the frequency to "G4" in exactly 1 second from now.
	 * osc.frequency.setValueAtTime("G4", "+1");
	 * setInterval(() => {
	 * 	// check the value every 100 ms
	 * 	osc.frequency.getValueAtTime(now());
	 * }, 100);
	 */
	abstract getValueAtTime(time: Time): UnitMap[TypeName];
	
	/**
	 * Creates a schedule point with the current value at the current time.
	 * Automation methods like [[linearRampToValueAtTime]] and [[exponentialRampToValueAtTime]]
	 * require a starting automation value usually set by [[setValueAtTime]]. This method
	 * is useful since it will do a `setValueAtTime` with whatever the currently computed
	 * value at the given time is. 
	 * @param time When to add a ramp point.
	 * @example
	 * import { Oscillator } from "tone";
	 * const osc = new Oscillator().toDestination().start();
	 * // set the frequency to "G4" in exactly 1 second from now.
	 * osc.frequency.setRampPoint("+1");
	 * osc.frequency.linearRampToValueAtTime("C1", "+2");
	 */
	abstract setRampPoint(time: Time): this;

	/**
	 * Schedules a linear continuous change in parameter value from the
	 * previous scheduled parameter value to the given value.
	 */
	abstract linearRampToValueAtTime(value: UnitMap[TypeName], time: Time): this;

	/**
	 * Schedules an exponential continuous change in parameter value from
	 * the previous scheduled parameter value to the given value.
	 */
	abstract exponentialRampToValueAtTime(value: UnitMap[TypeName], time: Time): this;

	/**
	 * Schedules an exponential continuous change in parameter value from
	 * the current time and current value to the given value over the
	 * duration of the rampTime.
	 * @param value   The value to ramp to.
	 * @param rampTime the time that it takes the
	 *                             value to ramp from it's current value
	 * @param startTime When the ramp should start.
	 * @example
	 * import { FeedbackDelay, Noise } from "tone";
	 * const delay = new FeedbackDelay(0.5, 0.98).toDestination();
	 * // a short burst of noise through the feedback delay
	 * const noise = new Noise().connect(delay).start().stop("+0.1");
	 * // making the delay time shorter over time will also make the pitch rise
	 * delay.delayTime.exponentialRampTo(0.01, 20);
	 */
	abstract exponentialRampTo(value: UnitMap[TypeName], rampTime: Time, startTime?: Time): this;

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
	 * import { FeedbackDelay, Noise } from "tone";
	 * const delay = new FeedbackDelay(0.5, 0.98).toDestination();
	 * // a short burst of noise through the feedback delay
	 * const noise = new Noise().connect(delay).start().stop("+0.1");
	 * // linearly ramp to the value 4 over 3 seconds.
	 * delay.delayTime.linearRampTo(4, 3);
	 */
	abstract linearRampTo(value: UnitMap[TypeName], rampTime: Time, startTime?: Time): this;

	/**
	 * Start exponentially approaching the target value at the given time. Since it
	 * is an exponential approach it will continue approaching after the ramp duration. The
	 * rampTime is the time that it takes to reach over 99% of the way towards the value.
	 * @param  value   The value to ramp to.
	 * @param  rampTime the time that it takes the
	 *                              value to ramp from it's current value
	 * @param startTime 	When the ramp should start.
	 * @example
	 * import { Oscillator } from "tone";
	 * const osc = new Oscillator().toDestination().start();
	 * osc.frequency.targetRampTo("C4", 4);
	 */
	abstract targetRampTo(value: UnitMap[TypeName], rampTime: Time, startTime?: Time): this;

	/**
	 * Start exponentially approaching the target value at the given time. Since it
	 * is an exponential approach it will continue approaching after the ramp duration. The
	 * rampTime is the time that it takes to reach over 99% of the way towards the value. This methods
	 * is similar to setTargetAtTime except the third argument is a time instead of a 'timeConstant'
	 * @param  value   The value to ramp to.
	 * @param time 	When the ramp should start.
	 * @param  rampTime the time that it takes the value to ramp from it's current value
	 * @example
	 * import { Oscillator } from "tone";
	 * const osc = new Oscillator().toDestination().start();
	 * // exponential approach over 4 seconds starting in 1 second
	 * osc.frequency.exponentialApproachValueAtTime("C4", "+1", 4);
	 */
	abstract exponentialApproachValueAtTime(value: UnitMap[TypeName], time: Time, rampTime: Time): this;

	/**
	 * Start exponentially approaching the target value at the given time with
	 * a rate having the given time constant.
	 * @param value
	 * @param startTime
	 * @param timeConstant
	 */
	abstract setTargetAtTime(value: UnitMap[TypeName], startTime: Time, timeConstant: number): this;

	/**
	 * Sets an array of arbitrary parameter values starting at the given time
	 * for the given duration.
	 *
	 * @param values
	 * @param startTime
	 * @param duration
	 * @param scaling If the values in the curve should be scaled by some value
	 */
	abstract setValueCurveAtTime(values: UnitMap[TypeName][], startTime: Time, duration: Time, scaling?: number): this;

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
	 * import { Oscillator } from "tone";
	 * const osc = new Oscillator().toDestination().start();
	 * // schedule it to ramp either linearly or exponentially depending on the units
	 * osc.frequency.rampTo("A2", 10);
	 * @example
	 * import { Oscillator } from "tone";
	 * const osc = new Oscillator().toDestination().start();
	 * // schedule it to ramp starting at a specific time
	 * osc.frequency.rampTo("A2", 10, "+2");
	 */
	abstract rampTo(value: UnitMap[TypeName], rampTime: Time, startTime?: Time): this;

	/**
	 * The current value of the parameter. Setting this value
	 * is equivalent to setValueAtTime(value, context.currentTime)
	 */
	abstract value: UnitMap[TypeName];

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
