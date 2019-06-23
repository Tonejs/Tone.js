import { Gain } from "Tone/core/context/Gain";
import { Param } from "Tone/core/context/Param";
import { ToneAudioNode, ToneAudioNodeOptions } from "Tone/core/context/ToneAudioNode";
import { optionsFromArguments } from "Tone/core/util/Defaults";
import { readOnly, writable } from "Tone/core/util/Interface";
import { MultibandSplit } from "../channel/MultibandSplit";

interface EQ3Options extends ToneAudioNodeOptions {
	low: Decibels;
	mid: Decibels;
	high: Decibels;
	lowFrequency: Frequency;
	highFrequency: Frequency;
}

export class EQ3 extends ToneAudioNode<EQ3Options> {
	readonly name = "EQ3";

	/**
	 *  the input
	 */
	readonly input: MultibandSplit;

	/**
	 *  the input
	 */
	readonly output = new Gain({ context: this.context });

	private _multibandSplit: MultibandSplit;

	/**
	 *  The gain for the lower signals
	 */
	private _lowGain: Gain<"decibels">;

	/**
	 *  The gain for the mid signals
	 */
	private _midGain: Gain<"decibels">;

	/**
	 *  The gain for the high signals
	 */
	private _highGain: Gain<"decibels">;

	/**
	 * The gain in decibels of the low part
	 */
	readonly low: Param<"decibels">;

	/**
	 * The gain in decibels of the mid part
	 */
	readonly mid: Param<"decibels">;

	/**
	 * The gain in decibels of the high part
	 */
	readonly high: Param<"decibels">;

	/**
	 *  The Q value for all of the filters.
	 */
	readonly Q = this._multibandSplit.Q;

	/**
	 *  The low/mid crossover frequency.
	 */
	readonly lowFrequency = this._multibandSplit.lowFrequency;

	/**
	 *  The mid/high crossover frequency.
	 */
	readonly highFrequency = this._multibandSplit.highFrequency;

	readonly _internalChannels = [this._multibandSplit, this.output];

	constructor(lowLevel?: Decibels, midlevel?: Decibels, highLevel?: Decibels);
	constructor(options: Partial<EQ3Options>);
	constructor() {
		super(optionsFromArguments(EQ3.getDefaults(), arguments, ["low", "mid", "high"]));
		const options = optionsFromArguments(EQ3.getDefaults(), arguments, ["low", "mid", "high"]);

		this.input = this._multibandSplit = new MultibandSplit({
			highFrequency: options.highFrequency,
			lowFrequency: options.lowFrequency,
		});

		this._lowGain = new Gain({
			context: this.context,
			gain: options.low,
			units: "decibels",
		});

		this._midGain = new Gain({
			context: this.context,
			gain: options.mid,
			units: "decibels",
		});

		this._highGain = new Gain({
			context: this.context,
			gain: options.high, units: "decibels",
		});

		this.low = this._lowGain.gain;
		this.mid = this._midGain.gain;
		this.high = this._highGain.gain;

	// the frequency bands
		this._multibandSplit.low.chain(this._lowGain, this.output);
		this._multibandSplit.mid.chain(this._midGain, this.output);
		this._multibandSplit.high.chain(this._highGain, this.output);

		readOnly(this, ["low", "mid", "high", "lowFrequency", "highFrequency"]);
	}

	static getDefaults(): EQ3Options {
		return Object.assign(ToneAudioNode.getDefaults(), {
			high : 0,
			highFrequency : 2500,
			low : 0,
			lowFrequency : 400,
			mid : 0,
		});
	}

	/**
	 *  Clean up.
	 */
	dispose(): this {
		super.dispose();
		writable(this, ["low", "mid", "high", "lowFrequency", "highFrequency"]);
		this._multibandSplit.dispose();
		this.lowFrequency.dispose();
		this.highFrequency.dispose();
		this._lowGain.dispose();
		this._midGain.dispose();
		this._highGain.dispose();
		this.low.dispose();
		this.mid.dispose();
		this.high.dispose();
		this.Q.dispose();
		return this;
	}

}
