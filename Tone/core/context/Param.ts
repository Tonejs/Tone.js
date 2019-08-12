import { AbstractParam } from "../context/AbstractParam";
import { dbToGain, gainToDb } from "../type/Conversions";
import { AudioRange, Decibels, Frequency, NormalRange, Positive, Time, Unit, UnitName } from "../type/Units";
import { optionsFromArguments } from "../util/Defaults";
import { Timeline } from "../util/Timeline";
import { isDefined } from "../util/TypeCheck";
import { ToneWithContext, ToneWithContextOptions } from "./ToneWithContext";

export interface ParamOptions extends ToneWithContextOptions {
	units: UnitName;
	value?: any;
	param: AudioParam;
	convert: boolean;
}

/**
 * the possible automation types
 */
type AutomationType = "linear" | "exponential" | "setValue" | "setTarget" | "cancel";

/**
 * The events on the automation
 */
export interface AutomationEvent {
	type: AutomationType;
	time: number;
	value: number;
	constant?: number;
}

/**
 *  Param wraps the native Web Audio's AudioParam to provide
 * additional unit conversion functionality. It also
 * serves as a base-class for classes which have a single,
 * automatable parameter.
 */
export class Param<Type extends Unit = number>
extends ToneWithContext<ParamOptions>
implements AbstractParam<Type> {

	name = "Param";

	static getDefaults(): ParamOptions {
		return Object.assign(ToneWithContext.getDefaults(), {
			convert: true,
			units: "number" as UnitName,
		} as ParamOptions);
	}

	/**
	 * The input connection
	 */
	readonly input: AudioParam;
	readonly units: UnitName;
	convert: boolean;
	overridden: boolean = false;

	/**
	 * The timeline which tracks all of the automations.
	 */
	protected _events: Timeline<AutomationEvent>;

	/**
	 *  The native parameter to control
	 */
	protected _param: AudioParam;

	/**
	 *  The default value before anything is assigned
	 */
	protected _initialValue: number;

	/**
	 *  The minimum output value
	 */
	private _minOutput = 1e-5;

	constructor(param: AudioParam, units?: Unit, convert?: boolean);
	constructor(options: Partial<ParamOptions>);
	constructor() {
		super(optionsFromArguments(Param.getDefaults(), arguments, ["param", "units", "convert"]));

		const options = optionsFromArguments(Param.getDefaults(), arguments, ["param", "units", "convert"]);

		this.assert(isDefined(options.param) && options.param instanceof AudioParam, "param must be an AudioParam");

		// initialize
		this._param = this.input = options.param;
		this._events = new Timeline<AutomationEvent>(1000);
		this._initialValue = this._param.defaultValue;
		this.units = options.units;
		this.convert = options.convert;

		// if the value is defined, set it immediately
		if (isDefined(options.value) && options.value !== this._toType(this._initialValue)) {
			this.setValueAtTime(options.value, 0);
		}
	}

	get value(): Type {
		const now = this.now();
		return this.getValueAtTime(now);
	}
	set value(value: Type) {
		this._initialValue = this._fromType(value);
		this.cancelScheduledValues(this.now());
		this.setValueAtTime(value, this.now());
	}

	get minValue(): number {
		if (this.units === "time" || this.units === "frequency" ||
			this.units === "normalRange" || this.units === "positive" ||
			this.units === "transportTime" || this.units === "ticks" ||
			this.units === "bpm" || this.units === "hertz" || this.units === "samples") {
			return 0;
		} else if (this.units === "audioRange") {
			return -1;
		} else if (this.units === "decibels") {
			return -Infinity;
		} else {
			return this._param.minValue;
		}
	}

	get maxValue(): number {
		if (this.units === "normalRange" ||
			this.units === "audioRange") {
			return 1;
		} else {
			return this._param.maxValue;
		}
	}

	/**
	 * Type guard based on the unit name
	 */
	private _is<T>(arg: any, type: UnitName): arg is T {
		return this.units === type;
	}

	/**
	 *  Convert the given value from the type specified by Param.units
	 *  into the destination value (such as Gain or Frequency).
	 */
	protected _fromType(val: Type): number {
		if (this.convert && !this.overridden) {
			if (this._is<Time>(val, "time")) {
				return this.toSeconds(val);
			} else if (this._is<Decibels>(val, "decibels")) {
				return dbToGain(val);
			} else if (this._is<Frequency>(val, "frequency")) {
				return this.toFrequency(val);
			} else if (this._is<NormalRange>(val, "normalRange")) {
				return Math.min(Math.max(val, 0), 1);
			} else if (this._is<AudioRange>(val, "audioRange")) {
				return Math.min(Math.max(val, -1), 1);
			} else if (this._is<Positive>(val, "positive")) {
				return Math.max(val, 0);
			} else if (this._is<number>(val, "number")) {
				return val;
			} else {
				return val as number;
			}
		} else {
			return val as number;
		}
	}

	/**
	 * Convert the parameters value into the units specified by Param.units.
	 */
	protected _toType(val: number): Type {
		if (this.convert && this.units === "decibels") {
			return gainToDb(val) as Type;
		} else {
			return val as Type;
		}
	}

	///////////////////////////////////////////////////////////////////////////
	// ABSTRACT PARAM INTERFACE
	// all docs are generated from ParamInterface.ts
	///////////////////////////////////////////////////////////////////////////

	setValueAtTime(value: Type, time: Time): this {
		const computedTime = this.toSeconds(time);
		const numericValue = this._fromType(value);
		this.assert(isFinite(numericValue) && isFinite(computedTime),
			`Invalid argument(s) to setValueAtTime: ${JSON.stringify(value)}, ${JSON.stringify(time)}`);

		this.log(this.units, "setValue", value, computedTime);
		this._events.add({
			time: computedTime,
			type: "setValue",
			value: numericValue,
		});
		this._param.setValueAtTime(numericValue, computedTime);
		return this;
	}

	getValueAtTime(time: Time): Type {
		const computedTime = Math.max(this.toSeconds(time), 0);
		const after = this._events.getAfter(computedTime);
		const before = this._events.get(computedTime);
		let value = this._initialValue;
		// if it was set by
		if (before === null) {
			value = this._initialValue;
		} else if (before.type === "setTarget" && (after === null || after.type === "setValue")) {
			const previous = this._events.getBefore(before.time);
			let previousVal;
			if (previous === null) {
				previousVal = this._initialValue;
			} else {
				previousVal = previous.value;
			}
			if (isDefined(before.constant)) {
				value = this._exponentialApproach(before.time, previousVal, before.value, before.constant, computedTime);
			}
		} else if (after === null) {
			value = before.value;
		} else if (after.type === "linear" || after.type === "exponential") {
			let beforeValue = before.value;
			if (before.type === "setTarget") {
				const previous = this._events.getBefore(before.time);
				if (previous === null) {
					beforeValue = this._initialValue;
				} else {
					beforeValue = previous.value;
				}
			}
			if (after.type === "linear") {
				value = this._linearInterpolate(before.time, beforeValue, after.time, after.value, computedTime);
			} else {
				value = this._exponentialInterpolate(before.time, beforeValue, after.time, after.value, computedTime);
			}
		} else {
			value = before.value;
		}
		return this._toType(value);
	}

	setRampPoint(time: Time): this {
		time = this.toSeconds(time);
		let currentVal = this.getValueAtTime(time);
		this.cancelAndHoldAtTime(time);
		if (this._fromType(currentVal) === 0) {
			currentVal = this._toType(this._minOutput);
		}
		this.setValueAtTime(currentVal, time);
		return this;
	}

	linearRampToValueAtTime(value: Type, endTime: Time): this {
		const numericValue = this._fromType(value);
		const computedTime = this.toSeconds(endTime);
		this.assert(isFinite(numericValue) && isFinite(computedTime),
			`Invalid argument(s) to linearRampToValueAtTime: ${JSON.stringify(value)}, ${JSON.stringify(endTime)}`);
		this._events.add({
			time: computedTime,
			type: "linear",
			value : numericValue,
		});
		this.log(this.units, "linear", value, computedTime);
		this._param.linearRampToValueAtTime(numericValue, computedTime);
		return this;
	}

	exponentialRampToValueAtTime(value: Type, endTime: Time): this {
		let numericValue = this._fromType(value);
		numericValue = Math.max(this._minOutput, numericValue);
		const computedTime = this.toSeconds(endTime);
		this.assert(isFinite(numericValue) && isFinite(computedTime),
			`Invalid argument(s) to exponentialRampToValueAtTime: ${JSON.stringify(value)}, ${JSON.stringify(endTime)}`);
		// store the event
		this._events.add({
			time: computedTime,
			type: "exponential",
			value : numericValue,
		});
		this.log(this.units, "exponential", value, computedTime);
		this._param.exponentialRampToValueAtTime(numericValue, computedTime);
		return this;
	}

	exponentialRampTo(value: Type, rampTime: Time, startTime?: Time): this {
		startTime = this.toSeconds(startTime);
		this.setRampPoint(startTime);
		this.exponentialRampToValueAtTime(value, startTime + this.toSeconds(rampTime));
		return this;
	}

	linearRampTo(value: Type, rampTime: Time, startTime?: Time): this {
		startTime = this.toSeconds(startTime);
		this.setRampPoint(startTime);
		this.linearRampToValueAtTime(value, startTime + this.toSeconds(rampTime));
		return this;
	}

	targetRampTo(value: Type, rampTime: Time, startTime?: Time): this {
		startTime = this.toSeconds(startTime);
		this.setRampPoint(startTime);
		this.exponentialApproachValueAtTime(value, startTime, rampTime);
		return this;
	}

	exponentialApproachValueAtTime(value: Type, time: Time, rampTime: Time): this {
		time = this.toSeconds(time);
		rampTime = this.toSeconds(rampTime);
		const timeConstant = Math.log(rampTime + 1) / Math.log(200);
		this.setTargetAtTime(value, time, timeConstant);
		// at 90% start a linear ramp to the final value
		this.cancelAndHoldAtTime(time + rampTime * 0.9);
		this.linearRampToValueAtTime(value, time + rampTime);
		return this;
	}

	setTargetAtTime(value: Type, startTime: Time, timeConstant: Positive): this {
		const numericValue = this._fromType(value);
		// The value will never be able to approach without timeConstant > 0.
		this.assert(isFinite(timeConstant) && timeConstant > 0, "timeConstant must be a number greater than 0");
		const computedTime = this.toSeconds(startTime);
		this.assert(isFinite(numericValue) && isFinite(computedTime),
			`Invalid argument(s) to setTargetAtTime: ${JSON.stringify(value)}, ${JSON.stringify(startTime)}`);
		this._events.add({
			constant: timeConstant,
			time: computedTime,
			type: "setTarget",
			value: numericValue,
		});
		this.log(this.units, "setTarget", value, computedTime, timeConstant);
		this._param.setTargetAtTime(numericValue, computedTime, timeConstant);
		return this;
	}

	setValueCurveAtTime(values: Type[], startTime: Time, duration: Time, scaling: number = 1): this {
		duration = this.toSeconds(duration);
		startTime = this.toSeconds(startTime);
		const startingValue = this._fromType(values[0]) * scaling;
		this.setValueAtTime(this._toType(startingValue), startTime);
		const segTime = duration / (values.length - 1);
		for (let i = 1; i < values.length; i++) {
			const numericValue = this._fromType(values[i]) * scaling;
			this.linearRampToValueAtTime(this._toType(numericValue), startTime + i * segTime);
		}
		return this;
	}

	cancelScheduledValues(time: Time): this {
		const computedTime = this.toSeconds(time);
		this.assert(isFinite(computedTime), `Invalid argument to cancelScheduledValues: ${JSON.stringify(time)}`);
		this._events.cancel(computedTime);
		this._param.cancelScheduledValues(computedTime);
		this.log(this.units, "cancel", computedTime);
		return this;
	}

	cancelAndHoldAtTime(time: Time): this {
		const computedTime = this.toSeconds(time);
		const valueAtTime = this._fromType(this.getValueAtTime(computedTime));
		// remove the schedule events
		this.assert(isFinite(computedTime), `Invalid argument to cancelAndHoldAtTime: ${JSON.stringify(time)}`);

		this.log(this.units, "cancelAndHoldAtTime", computedTime, "value=" + valueAtTime);

		this._param.cancelScheduledValues(computedTime);

		// if there is an event at the given computedTime
		// and that even is not a "set"
		const before = this._events.get(computedTime);
		const after = this._events.getAfter(computedTime);
		if (before && before.time === computedTime) {
			// remove everything after
			if (after) {
				this._events.cancel(after.time);
			} else {
				this._events.cancel(computedTime + this.sampleTime);
			}
		} else if (after) {
			// cancel the next event(s)
			this._events.cancel(after.time);
			if (after.type === "linear") {
				this.linearRampToValueAtTime(this._toType(valueAtTime), computedTime);
			} else if (after.type === "exponential") {
				this.exponentialRampToValueAtTime(this._toType(valueAtTime), computedTime);
			}
		}

		// set the value at the given time
		this._events.add({
			time: computedTime,
			type: "setValue",
			value: valueAtTime,
		});
		this._param.setValueAtTime(valueAtTime, computedTime);
		return this;
	}

	rampTo(value: Type, rampTime: Time = 0.1, startTime?: Time): this {
		if (this.units === "frequency" || this.units === "bpm" || this.units === "decibels") {
			this.exponentialRampTo(value, rampTime, startTime);
		} else {
			this.linearRampTo(value, rampTime, startTime);
		}
		return this;
	}

	dispose(): this {
		super.dispose();
		this._events.dispose();
		return this;
	}

	///////////////////////////////////////////////////////////////////////////
	// 	AUTOMATION CURVE CALCULATIONS
	// 	MIT License, copyright (c) 2014 Jordan Santell
	///////////////////////////////////////////////////////////////////////////

	// Calculates the the value along the curve produced by setTargetAtTime
	protected _exponentialApproach(t0: number, v0: number, v1: number, timeConstant: number, t: number): number {
		return v1 + (v0 - v1) * Math.exp(-(t - t0) / timeConstant);
	}

	// Calculates the the value along the curve produced by linearRampToValueAtTime
	protected _linearInterpolate(t0: number, v0: number, t1: number, v1: number, t: number): number {
		return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
	}

	// Calculates the the value along the curve produced by exponentialRampToValueAtTime
	protected _exponentialInterpolate(t0: number, v0: number, t1: number, v1: number, t: number): number {
		return v0 * Math.pow(v1 / v0, (t - t0) / (t1 - t0));
	}
}
