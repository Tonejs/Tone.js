import { ToneAudioNode } from "../../core/context/ToneAudioNode.js";
import { dbToGain } from "../../core/type/Conversions.js";
import {
	Decibels,
	Hertz,
	NormalRange,
	PowerOfTwo,
} from "../../core/type/Units.js";
import { assert } from "../../core/util/Debug.js";
import { optionsFromArguments } from "../../core/util/Defaults.js";
import { MeterBase, MeterBaseOptions } from "./MeterBase.js";

export interface FFTOptions extends MeterBaseOptions {
	size: PowerOfTwo;
	smoothing: NormalRange;
	normalRange: boolean;
	minDecibels: Decibels;
	maxDecibels: Decibels;
}

/**
 * Get the current frequency data of the connected audio source using a fast Fourier transform.
 * Read more about FFT algorithms on [Wikipedia] (https://en.wikipedia.org/wiki/Fast_Fourier_transform).
 * @category Component
 */
export class FFT extends MeterBase<FFTOptions, 1> {
	readonly name: string = "FFT";

	/**
	 * If the output should be in decibels or normal range between 0-1. If `normalRange` is false,
	 * the output range will be the measured decibel value, otherwise the decibel value will be converted to
	 * the range of 0-1
	 */
	normalRange: boolean;

	/**
	 * @param size The size of the FFT. Value must be a power of two in the range 16 to 16384.
	 */
	constructor(size?: PowerOfTwo);
	constructor(options?: Partial<FFTOptions>);
	constructor() {
		const options = optionsFromArguments(FFT.getDefaults(), arguments, [
			"size",
		]);
		super(options);

		this.normalRange = options.normalRange;
		this._analyser.type = "fft";
		this.size = options.size;
		// raise maxDecibels first so minDecibels stays below it after each assignment
		this.maxDecibels = Math.max(options.maxDecibels, this.maxDecibels);
		this.minDecibels = options.minDecibels;
		this.maxDecibels = options.maxDecibels;
	}

	static getDefaults(): FFTOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			normalRange: false,
			size: 1024,
			smoothing: 0.8,
			minDecibels: -100,
			maxDecibels: -30,
		});
	}

	/**
	 * Gets the current frequency data from the connected audio source.
	 * Returns the frequency data of length {@link size} as a Float32Array of decibel values.
	 */
	getValue(): Float32Array {
		const values = this._analyser.getValue();
		return values.map((v) => (this.normalRange ? dbToGain(v) : v));
	}

	/**
	 * The size of analysis. This must be a power of two in the range 16 to 16384.
	 * Determines the size of the array returned by {@link getValue} (i.e. the number of
	 * frequency bins). Large FFT sizes may be costly to compute.
	 */
	get size(): PowerOfTwo {
		return this._analyser.size;
	}
	set size(size) {
		this._analyser.size = size;
	}

	/**
	 * 0 represents no time averaging with the last analysis frame.
	 */
	get smoothing(): NormalRange {
		return this._analyser.smoothing;
	}
	set smoothing(val) {
		this._analyser.smoothing = val;
	}

	/**
	 * The lowest value in decibels of the FFT range, -100 by default. Sets
	 * [minDecibels](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/minDecibels)
	 * on the underlying AnalyserNode. Must be less than {@link maxDecibels}.
	 * The values returned by {@link getValue} are not clamped to it.
	 */
	get minDecibels(): Decibels {
		return this._analyser.minDecibels;
	}
	set minDecibels(min) {
		this._analyser.minDecibels = min;
	}

	/**
	 * The highest value in decibels of the FFT range, -30 by default. Sets
	 * [maxDecibels](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/maxDecibels)
	 * on the underlying AnalyserNode. Must be greater than {@link minDecibels}.
	 */
	get maxDecibels(): Decibels {
		return this._analyser.maxDecibels;
	}
	set maxDecibels(max) {
		this._analyser.maxDecibels = max;
	}

	/**
	 * Returns the frequency value in hertz of each of the indices of the FFT's {@link getValue} response.
	 * @example
	 * const fft = new Tone.FFT(32);
	 * console.log([0, 1, 2, 3, 4].map(index => fft.getFrequencyOfIndex(index)));
	 */
	getFrequencyOfIndex(index: number): Hertz {
		assert(
			0 <= index && index < this.size,
			`index must be greater than or equal to 0 and less than ${this.size}`
		);
		return (index * this.context.sampleRate) / (this.size * 2);
	}
}
