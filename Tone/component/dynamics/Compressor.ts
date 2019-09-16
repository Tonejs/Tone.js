import { Param } from "../../core/context/Param";
import { ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { Decibels, Positive, Time } from "../../core/type/Units";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";

interface CompressorOptions extends ToneAudioNodeOptions {
	attack: Time;
	knee: Decibels;
	ratio: Positive;
	release: Time;
	threshold: Decibels;
}

/**
 * Compressor is a thin wrapper around the Web Audio
 * [DynamicsCompressorNode](http://webaudio.github.io/web-audio-api/#the-dynamicscompressornode-interface).
 * Compression reduces the volume of loud sounds or amplifies quiet sounds
 * by narrowing or "compressing" an audio signal's dynamic range.
 * Read more on [Wikipedia](https://en.wikipedia.org/wiki/Dynamic_range_compression).
 * @example
 * var comp = new Compressor(-30, 3);
 * @category Component
 */
export class Compressor extends ToneAudioNode<CompressorOptions> {

	readonly name: string = "Compressor";

	/**
	 * the compressor node
	 */
	private _compressor: DynamicsCompressorNode = this.context.createDynamicsCompressor();
	readonly input = this._compressor;
	readonly output = this._compressor;

	/**
	 * The decibel value above which the compression will start taking effect.
	 */
	readonly threshold: Param<Decibels>;

	/**
	 * The amount of time (in seconds) to reduce the gain by 10dB.
	 */
	readonly attack: Param<Time>;

	/**
	 * The amount of time (in seconds) to increase the gain by 10dB.
	 */
	readonly release: Param<Time>;

	/**
	 * A decibel value representing the range above the threshold where the
	 * curve smoothly transitions to the "ratio" portion.
	 */
	readonly knee: Param<Decibels>;

	/**
	 * The amount of dB change in input for a 1 dB change in output.
	 */
	readonly ratio: Param<Decibels>;

	/**
	 * @param threshold The value above which the compression starts to be applied.
	 * @param ratio The gain reduction ratio.
	 */
	constructor(threshold?: Decibels, ratio?: Positive);
	constructor(options?: Partial<CompressorOptions>);
	constructor() {

		super(optionsFromArguments(Compressor.getDefaults(), arguments, ["threshold", "ratio"]));
		const options = optionsFromArguments(Compressor.getDefaults(), arguments, ["threshold", "ratio"]);

		this.threshold = new Param({
			context: this.context,
			convert: false,
			param: this._compressor.threshold,
			units: "decibels",
			value: options.threshold,
		});

		this.attack = new Param({
			context: this.context,
			param: this._compressor.attack,
			units: "time",
			value: options.attack,
		});

		this.release = new Param({
			context: this.context,
			param: this._compressor.release,
			units: "time",
			value: options.release,
		});

		this.knee = new Param({
			context: this.context,
			convert: false,
			param: this._compressor.knee,
			units: "decibels",
			value: options.knee,
		});

		this.ratio = new Param({
			context: this.context,
			convert: false,
			param: this._compressor.ratio,
			units: "positive",
			value: options.ratio,
		});

		// set the defaults
		readOnly(this, ["knee", "release", "attack", "ratio", "threshold"]);
	}

	static getDefaults(): CompressorOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			attack: 0.003,
			knee: 30,
			ratio: 12,
			release: 0.25,
			threshold: -24,
		});
	}

	/**
	 * A read-only decibel value for metering purposes, representing the current amount of gain
	 * reduction that the compressor is applying to the signal. If fed no signal the value will be 0 (no gain reduction).
	 */
	get reduction(): number {
		return this._compressor.reduction;
	}

	dispose(): this {
		super.dispose();
		this._compressor.disconnect();
		this.attack.dispose();
		this.release.dispose();
		this.threshold.dispose();
		this.ratio.dispose();
		this.knee.dispose();
		return this;
	}
}
