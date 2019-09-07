import { Signal, SignalOptions } from "../../signal/Signal";
import { BPM, Hertz, Seconds, Ticks, Time } from "../type/Units";
import { optionsFromArguments } from "../util/Defaults";
import { TickParam } from "./TickParam";

interface TickSignalOptions<T> extends SignalOptions<T> {
	value: T;
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
 * @category Core
 */
export class TickSignal<Type extends Hertz | BPM> extends Signal<Type> {

	readonly name: string = "TickSignal";

	/**
	 * The param which controls the output signal value
	 */
	protected _param: TickParam<Type>;

	/**
	 * @param value The initial value of the signal
	 */
	constructor(value?: Type);
	constructor(options: Partial<TickSignalOptions<Type>>);
	constructor() {

		super(optionsFromArguments(TickSignal.getDefaults(), arguments, ["value"]));
		const options = optionsFromArguments(TickSignal.getDefaults(), arguments, ["value"]);

		this._param = new TickParam({
			context: this.context,
			convert: options.convert,
			multiplier : options.multiplier,
			param: this._constantSource.offset,
			units: options.units,
			value: options.value,
		});
	}

	static getDefaults(): TickSignalOptions<any> {
		return Object.assign(Signal.getDefaults(), {
			multiplier: 1,
			units: "hertz",
			value: 1,
		});
	}

	ticksToTime(ticks: Ticks, when: Time): Seconds {
		return this._param.ticksToTime(ticks, when);
	}

	timeToTicks(duration: Time, when: Time): Ticks {
		return this._param.timeToTicks(duration, when);
	}

	getTimeOfTick(tick: Ticks): Seconds {
		return this._param.getTimeOfTick(tick);
	}

	getDurationOfTicks(ticks: Ticks, time: Time): Seconds {
		return this._param.getDurationOfTicks(ticks, time);
	}

	getTicksAtTime(time: Time): Ticks {
		return this._param.getTicksAtTime(time);
	}

	/**
	 * A multiplier on the bpm value. Useful for setting a PPQ relative to the base frequency value.
	 */
	get multiplier(): number {
		return this._param.multiplier;
	}
	set multiplier(m: number) {
		this._param.multiplier = m;
	}

	dispose(): this {
		super.dispose();
		this._param.dispose();
		return this;
	}
}
