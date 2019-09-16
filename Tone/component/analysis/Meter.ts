import { gainToDb } from "../../core/type/Conversions";
import { Decibels, NormalRange } from "../../core/type/Units";
import { optionsFromArguments } from "../../core/util/Defaults";
import { MeterBase, MeterBaseOptions } from "./MeterBase";

export interface MeterOptions extends MeterBaseOptions {
	smoothing: NormalRange;
}

/**
 * Meter gets the [RMS](https://en.wikipedia.org/wiki/Root_mean_square)
 * of an input signal. It can also get the raw value of the input signal.
 *
 * @example
 * var meter = new Meter();
 * var mic = new Tone.UserMedia().open();
 * //connect mic to the meter
 * mic.connect(meter);
 * //the current level of the mic input in decibels
 * var level = meter.getLevel();
 * @category Component
 */
export class Meter extends MeterBase<MeterOptions> {

	readonly name: string = "Meter";

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
	}

	static getDefaults(): MeterOptions {
		return Object.assign(MeterBase.getDefaults(), {
			smoothing: 0.8,
		});
	}

	/**
	 * Use [[getValue]] instead. For the previous getValue behavior, use DCMeter.
	 * @deprecated
	 */
	getLevel(): Decibels {
		console.warn("'getLevel' has been changed to 'getValue'");
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
		return gainToDb(this._rms);
	}

	dispose(): this {
		super.dispose();
		this._analyser.dispose();
		return this;
	}
}
