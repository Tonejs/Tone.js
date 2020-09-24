import { InputNode, OutputNode, ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { Decibels } from "../../core/type/Units";
import { optionsFromArguments } from "../../core/util/Defaults";
import { Compressor } from "./Compressor";
import { Param } from "../../core/context/Param";
import { readOnly } from "../../core/util/Interface";

export interface LimiterOptions extends ToneAudioNodeOptions {
	threshold: Decibels;
};

/**
 * Limiter will limit the loudness of an incoming signal.
 * It is composed of a [[Compressor]] with a fast attack
 * and release and max ratio. Limiters are commonly used to safeguard against
 * signal clipping. Unlike a compressor, limiters do not provide
 * smooth gain reduction and almost completely prevent
 * additional gain above the threshold.
 *
 * @example
 * const limiter = new Tone.Limiter(-20).toDestination();
 * const oscillator = new Tone.Oscillator().connect(limiter);
 * oscillator.start();
 * @category Component
 */
export class Limiter extends ToneAudioNode<LimiterOptions> {

	readonly name: string = "Limiter";

	readonly input: InputNode;
	readonly output: OutputNode;

	/**
	 * The compressor which does the limiting
	 */
	private _compressor: Compressor;

	readonly threshold: Param<"decibels">

	/**
	 * @param threshold The threshold above which the gain reduction is applied.
	 */
	constructor(threshold?: Decibels);
	constructor(options?: Partial<LimiterOptions>);
	constructor() {
		super(Object.assign(optionsFromArguments(Limiter.getDefaults(), arguments, ["threshold"])));
		const options = optionsFromArguments(Limiter.getDefaults(), arguments, ["threshold"]);

		this._compressor = this.input = this.output = new Compressor({
			context: this.context,
			ratio: 20,
			attack: 0,
			release: 0,
			threshold: options.threshold
		});

		this.threshold = this._compressor.threshold;
		readOnly(this, "threshold");
	}

	static getDefaults(): LimiterOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			threshold: -12
		});
	}

	/**
	 * A read-only decibel value for metering purposes, representing the current amount of gain
	 * reduction that the compressor is applying to the signal. 
	 */
	get reduction(): Decibels {
		return this._compressor.reduction;
	}

	dispose(): this {
		super.dispose();
		this._compressor.dispose();
		this.threshold.dispose();
		return this;
	}
}
