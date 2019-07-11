import { connect } from "../Connect";
import { AutomationEvent, Param, ParamOptions } from "../context/Param";
import { getContext } from "../Global";
import { optionsFromArguments } from "../util/Defaults";
import { Timeline } from "../util/Timeline";
import { isUndef } from "../util/TypeCheck";

interface TickAutomationEvent extends AutomationEvent {
	ticks: number;
}

interface TickSignalOptions extends ParamOptions {
	value: Hertz | BPM;
	multiplier: number;
}

/**
 * TickSignal extends Tone.Signal, but adds the capability
 * to calculate the number of elapsed ticks. exponential and target curves
 * are approximated with multiple linear ramps.
 *
 * Thank you Bruno Dias, H. Sofia Pinto, and David M. Matos,
 * for your [WAC paper](https://smartech.gatech.edu/bitstream/handle/1853/54588/WAC2016-49.pdf)
 * describing integrating timing functions for tempo calculations.
 *
 * @param value The initial value of the signal
 */
export class TickSignal<Type extends "hertz" | "bpm"> extends Param<Type> {

	name = "TickSignal";

	protected _events: Timeline<TickAutomationEvent> = new Timeline(Infinity);

	private _sig: ConstantSourceNode = this.context.createConstantSource();

	protected _param = this._sig.offset;

	private _multiplier: number = 1;

	constructor(options: Partial<TickSignalOptions>);
	constructor(value?: number);
	constructor() {

		super(optionsFromArguments(TickSignal.getDefaults(), arguments, ["value"]));
		const options = optionsFromArguments(TickSignal.getDefaults(), arguments, ["value"]);

		this._sig = this.context.createConstantSource();
		this._sig.start(0);
		this._param = this._sig.offset;

		// set the multiplier
		this.multiplier = options.multiplier;

		// clear the ticks from the beginning
		this.cancelScheduledValues(0);
		// set an initial event
		this._events.add({
			ticks: 0,
			time : 0,
			type : "setValue",
			value: this._fromType(options.value),
		});
		this.setValueAtTime(options.value, 0);
	}

	static getDefaults(): TickSignalOptions {
		return Object.assign(Param.getDefaults(), {
			multiplier: 1,
			param: getContext().createConstantSource().offset,
			units: "hertz",
			value: 1,
		});
	}

	setTargetAtTime(value: UnitMap[Type], time: Time, constant: number): this {
		// approximate it with multiple linear ramps
		time = this.toSeconds(time);
		this.setRampPoint(time);
		const computedValue = this._fromType(value);

		// start from previously scheduled value
		const prevEvent = this._events.get(time) as TickAutomationEvent;
		const segments = Math.round(Math.max(1 / constant, 1));
		for (let i = 0; i <= segments; i++) {
			const segTime = constant * i + time;
			const rampVal = this._exponentialApproach(prevEvent.time, prevEvent.value, computedValue, constant, segTime);
			this.linearRampToValueAtTime(this._toType(rampVal), segTime);
		}
		return this;
	}

	setValueAtTime(value: UnitMap[Type], time: Time): this {
		const computedTime = this.toSeconds(time);
		super.setValueAtTime(value, time);
		const event = this._events.get(computedTime) as TickAutomationEvent;
		const previousEvent = this._events.previousEvent(event);
		const ticksUntilTime = this._getTicksUntilEvent(previousEvent, computedTime);
		event.ticks = Math.max(ticksUntilTime, 0);
		return this;
	}

	linearRampToValueAtTime(value: UnitMap[Type], time: Time): this {
		const computedTime = this.toSeconds(time);
		super.linearRampToValueAtTime(value, time);
		const event = this._events.get(computedTime) as TickAutomationEvent;
		const previousEvent = this._events.previousEvent(event);
		const ticksUntilTime = this._getTicksUntilEvent(previousEvent, computedTime);
		event.ticks = Math.max(ticksUntilTime, 0);
		return this;
	}

	exponentialRampToValueAtTime(value: UnitMap[Type], time: Time): this {
		// aproximate it with multiple linear ramps
		time = this.toSeconds(time);
		const computedVal = this._fromType(value);

		// start from previously scheduled value
		const prevEvent = this._events.get(time) as TickAutomationEvent;
		// approx 10 segments per second
		const segments = Math.round(Math.max((time - prevEvent.time) * 10, 1));
		const segmentDur = ((time - prevEvent.time) / segments);
		for (let i = 0; i <= segments; i++) {
			const segTime = segmentDur * i + prevEvent.time;
			const rampVal = this._exponentialInterpolate(prevEvent.time, prevEvent.value, time, computedVal, segTime);
			this.linearRampToValueAtTime(this._toType(rampVal), segTime);
		}
		return this;
	}

	/**
	 * Returns the tick value at the time. Takes into account
	 * any automation curves scheduled on the signal.
	 * @param  time The time to get the tick count at
	 * @return The number of ticks which have elapsed at the time given any automations.
	 */
	private _getTicksUntilEvent(event: TickAutomationEvent | null, time: number): Ticks {
		if (event === null) {
			event = {
				ticks : 0,
				time : 0,
				type: "setValue",
				value: 0,
			};
		} else if (isUndef(event.ticks)) {
			const previousEvent = this._events.previousEvent(event);
			event.ticks = this._getTicksUntilEvent(previousEvent, event.time);
		}
		const val0 = this._fromType(this.getValueAtTime(event.time));
		let val1 = this._fromType(this.getValueAtTime(time));
		// if it's right on the line, take the previous value
		const onTheLineEvent = this._events.get(time);
		if (onTheLineEvent && onTheLineEvent.time === time && onTheLineEvent.type === "setValue") {
			val1 = this._fromType(this.getValueAtTime(time - this.sampleTime));
		}
		return 0.5 * (time - event.time) * (val0 + val1) + event.ticks;
	}

	/**
	 * Returns the tick value at the time. Takes into account
	 * any automation curves scheduled on the signal.
	 * @param  time The time to get the tick count at
	 * @return The number of ticks which have elapsed at the time given any automations.
	 */
	getTicksAtTime(time: Time): Ticks {
		const computedTime = this.toSeconds(time);
		const event = this._events.get(computedTime);
		return Math.max(this._getTicksUntilEvent(event, computedTime), 0);
	}

	/**
	 * Return the elapsed time of the number of ticks from the given time
	 * @param ticks The number of ticks to calculate
	 * @param  time The time to get the next tick from
	 * @return The duration of the number of ticks from the given time in seconds
	 */
	getDurationOfTicks(ticks: Ticks, time: Time): Seconds {
		const computedTime = this.toSeconds(time);
		const currentTick = this.getTicksAtTime(time);
		return this.getTimeOfTick(currentTick + ticks) - computedTime;
	}

	/**
	 * Given a tick, returns the time that tick occurs at.
	 * @return The time that the tick occurs.
	 */
	getTimeOfTick(tick: Ticks): Seconds {
		const before = this._events.get(tick, "ticks");
		const after = this._events.getAfter(tick, "ticks");
		if (before && before.ticks === tick) {
			return before.time;
		} else if (before && after &&
			after.type === "linear" &&
			before.value !== after.value) {
			const val0 = this._fromType(this.getValueAtTime(before.time));
			const val1 = this._fromType(this.getValueAtTime(after.time));
			const delta = (val1 - val0) / (after.time - before.time);
			const k = Math.sqrt(Math.pow(val0, 2) - 2 * delta * (before.ticks - tick));
			const sol1 = (-val0 + k) / delta;
			const sol2 = (-val0 - k) / delta;
			return (sol1 > 0 ? sol1 : sol2) + before.time;
		} else if (before) {
			if (before.value === 0) {
				return Infinity;
			} else {
				return before.time + (tick - before.ticks) / before.value;
			}
		} else {
			return tick / this._initialValue;
		}
	}

	/**
	 * Convert some number of ticks their the duration in seconds accounting
	 * for any automation curves starting at the given time.
	 * @param  ticks The number of ticks to convert to seconds.
	 * @param  when  When along the automation timeline to convert the ticks.
	 * @return The duration in seconds of the ticks.
	 */
	ticksToTime(ticks: Ticks, when: Time): Seconds {
		return this.getDurationOfTicks(ticks, when);
	}

	/**
	 * The inverse of [ticksToTime](#tickstotime). Convert a duration in
	 * seconds to the corresponding number of ticks accounting for any
	 * automation curves starting at the given time.
	 * @param  duration The time interval to convert to ticks.
	 * @param  when When along the automation timeline to convert the ticks.
	 * @return The duration in ticks.
	 */
	timeToTicks(duration: Time, when: Time): Ticks {
		const computedTime = this.toSeconds(when);
		const computedDuration = this.toSeconds(duration);
		const startTicks = this.getTicksAtTime(computedTime);
		const endTicks = this.getTicksAtTime(computedTime + computedDuration);
		return endTicks - startTicks;
	}

	/**
	 * Convert from the type when the unit value is BPM
	 */
	protected _fromType(val: UnitMap[Type]): number {
		if (this.units === "bpm" && this.multiplier) {
			return 1 / (60 / val / this.multiplier);
		} else {
			return super._fromType(val);
		}
	}

	protected _toType(val: number): UnitMap[Type] {
		if (this.units === "bpm" && this.multiplier) {
			return (val / this.multiplier) * 60;
		} else {
			return super._toType(val);
		}
	}
	/**
	 * A multiplier on the bpm value. Useful for setting a PPQ relative to the base frequency value.
	 */
	get multiplier(): number {
		return this._multiplier;
	}
	set multiplier(m: number) {
		// get and reset the current value with the new multipler
		// might be necessary to clear all the previous values
		const currentVal = this.value;
		this._multiplier = m;
		this.value = currentVal;
	}

	/**
	 * Connect the output signal
	 */
	connect(dstNode, outputNumber = 0, inputNumber = 0): this {
		connect(this._sig, dstNode, outputNumber, inputNumber);
		return this;
	}
}
