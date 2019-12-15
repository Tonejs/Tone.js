import { gainToDb } from "../../core/type/Conversions";
import { Decibels, NormalRange } from "../../core/type/Units";
import { optionsFromArguments } from "../../core/util/Defaults";
import { MeterBase, MeterBaseOptions } from "./MeterBase";
import { warn } from "../../core/util/Debug";

export interface MeterOptions extends MeterBaseOptions {
	smoothing: NormalRange;
	normalRange: boolean;
}

/**
 * Meter gets the [RMS](https://en.wikipedia.org/wiki/Root_mean_square)
 * of an input signal. It can also get the raw value of the input signal.
 *
 * @example
 * import { Meter, UserMedia } from "tone";
 * const meter = new Meter();
 * const mic = new UserMedia();
 * mic.open();
 * // connect mic to the meter
 * mic.connect(meter);
 * // the current level of the mic
 * const level = meter.getValue();
 * @category Component
 */
export class Meter extends MeterBase<MeterOptions> {

	readonly name: string = "Meter";

	/**
	 * If the output should be in decibels or normal range between 0-1. If `normalRange` is false,
	 * the output range will be the measured decibel value, otherwise the decibel value will be converted to
	 * the range of 0-1
	 */
	normalRange: boolean;

	/**
	 * A value from between 0 and 1 where 0 represents no time averaging with the last analysis frame.
	 */
	smoothing: number;

	/**
	 * The previous frame's value
	 */
	private _rms = 0;

	/**
	 * @param smoothing The amount of smoothing applied between frames.
	 */
	constructor(smoothing?: NormalRange);
	constructor(options?: Partial<MeterOptions>);
	constructor() {
		super(optionsFromArguments(Meter.getDefaults(), arguments, ["smoothing"]));
		const options = optionsFromArguments(Meter.getDefaults(), arguments, ["smoothing"]);

		this.smoothing = options.smoothing;
		this._analyser.size = 256;
		this._analyser.type = "waveform";
		this.normalRange = options.normalRange;
	}

	static getDefaults(): MeterOptions {
		return Object.assign(MeterBase.getDefaults(), {
			smoothing: 0.8,
			normalRange: false,
		});
	}

	/**
	 * Use [[getValue]] instead. For the previous getValue behavior, use DCMeter.
	 * @deprecated
	 */
	getLevel(): Decibels {
		warn("'getLevel' has been changed to 'getValue'");
		return this.getValue();
	}

	/**
	 * Get the current decibel value of the incoming signal
	 */
	getValue(): number {
		const values = this._analyser.getValue();
		const totalSquared = values.reduce((total, current) => total + current * current, 0);
		const rms = Math.sqrt(totalSquared / values.length);
		// the rms can only fall at the rate of the smoothing
		// but can jump up instantly
		this._rms = Math.max(rms, this._rms * this.smoothing);
		return this.normalRange ? this._rms : gainToDb(this._rms);
	}

	dispose(): this {
		super.dispose();
		this._analyser.dispose();
		return this;
	}
}
