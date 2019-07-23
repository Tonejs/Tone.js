import { AbstractParam } from "../context/AbstractParam";
import { dbToGain, gainToDb } from "../type/Conversions";
import "../type/Units";
import { optionsFromArguments } from "../util/Defaults";
import { Timeline } from "../util/Timeline";
import { isDefined, isNumber } from "../util/TypeCheck";
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
		this._initialValue = this._param.value;
		this.units = options.units;
		this.convert = options.convert;

		// if the value is defined, set it immediately
		if (isDefined(options.value)) {
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
		time = this.toSeconds(time);
		const numericValue = this._fromType(value);
		this._events.add({
			time,
			type: "setValue",
			value: numericValue,
		});
		this.log("setValue", value, time);
		this.assert(isNumber(numericValue), `Invalid argument to setValueAtTime: ${numericValue}, ${time}`);
		this._param.setValueAtTime(numericValue, time);
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
		endTime = this.toSeconds(endTime);
		this._events.add({
			time: endTime,
			type: "linear",
			value : numericValue,
		});
		this.log("linear", value, endTime);
		this.assert(isNumber(numericValue), `Invalid argument to linearRampToValueAtTime: ${numericValue}, ${endTime}`);
		this._param.linearRampToValueAtTime(numericValue, endTime);
		return this;
	}

	exponentialRampToValueAtTime(value: Type, endTime: Time): this {
		let numericValue = this._fromType(value);
		numericValue = Math.max(this._minOutput, numericValue);
		endTime = this.toSeconds(endTime);
		// store the event
		this._events.add({
			time: endTime,
			type: "exponential",
			value : numericValue,
		});
		this.log("exponential", value, endTime);
		this.assert(isNumber(numericValue), `Invalid argument to exponentialRampToValueAtTime: ${numericValue}, ${endTime}`);
		this._param.exponentialRampToValueAtTime(numericValue, endTime);
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
		const timeConstant = Math.log(this.toSeconds(rampTime) + 1) / Math.log(200);
		time = this.toSeconds(time);
		return this.setTargetAtTime(value, time, timeConstant);
	}

	setTargetAtTime(value: Type, startTime: Time, timeConstant: Positive): this {
		const numericValue = this._fromType(value);
		// The value will never be able to approach without timeConstant > 0.
		this.assert(timeConstant > 0, "timeConstant must be greater than 0");
		startTime = this.toSeconds(startTime);
		this._events.add({
			constant: timeConstant,
			time: startTime,
			type: "setTarget",
			value: numericValue,
		});
		this.log("setTarget", value, startTime, timeConstant);
		this.assert(isNumber(numericValue), `Invalid argument to setTargetAtTime: ${numericValue}, ${startTime}`);
		this._param.setTargetAtTime(numericValue, startTime, timeConstant);
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
		time = this.toSeconds(time);
		this._events.cancel(time);
		this.assert(isNumber(time), `Invalid argument to cancelScheduledValues: ${time}`);
		this._param.cancelScheduledValues(time);
		this.log("cancel", time);
		return this;
	}

	cancelAndHoldAtTime(time: Time): this {
		time = this.toSeconds(time);
		const valueAtTime = this._fromType(this.getValueAtTime(time));
		this.log("cancelAndHoldAtTime", time, "value=" + valueAtTime);

		// remove the schedule events
		this._param.cancelScheduledValues(time);

		// if there is an event at the given time
		// and that even is not a "set"
		const before = this._events.get(time);
		const after = this._events.getAfter(time);
		if (before && before.time === time) {
			// remove everything after
			if (after) {
				this._events.cancel(after.time);
			} else {
				this._events.cancel(time + this.sampleTime);
			}
		} else if (after) {
			// cancel the next event(s)
			this._events.cancel(after.time);
			if (after.type === "linear") {
				this.linearRampToValueAtTime(this._toType(valueAtTime), time);
			} else if (after.type === "exponential") {
				this.exponentialRampToValueAtTime(this._toType(valueAtTime), time);
			}
		}

		// set the value at the given time
		this._events.add({
			time,
			type: "setValue",
			value: valueAtTime,
		});
		this._param.setValueAtTime(valueAtTime, time);
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
