import { Delay } from "../../core/context/Delay";
import { Gain } from "../../core/context/Gain";
import { Param } from "../../core/context/Param";
import { InputNode, OutputNode, ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { NormalRange, Time } from "../../core/type/Units";
import { optionsFromArguments } from "../../core/util/Defaults";
import { RecursivePartial } from "../../core/util/Interface";

export interface FeedbackCombFilterOptions extends ToneAudioNodeOptions {
	delayTime: Time;
	resonance: NormalRange;
}

/**
 *  @class Comb filters are basic building blocks for physical modeling. Read more
 *         about comb filters on [CCRMA's website](https://ccrma.stanford.edu/~jos/pasp/Feedback_Comb_Filters.html).
 *
 *  @extends {Tone.AudioNode}
 *  @constructor
 *  @param {Time|Object} [delayTime] The delay time of the filter.
 *  @param {NormalRange=} resonance The amount of feedback the filter has.
 */
export class FeedbackCombFilter extends ToneAudioNode<ToneAudioNodeOptions> {

	readonly name = "FeedbackCombFilter";

	/**
	 * The delay node
	 */
	private _delay: Delay;

	/**
	 * The feedback node
	 */
	private _feedback: Gain;

	/**
	 * The amount of delay of the comb filter.
	 */
	readonly delayTime: Param<Time>;

	/**
	 * The amount of feedback of the delayed signal.
	 */
	readonly resonance: Param<NormalRange>;

	input: InputNode;
	output: OutputNode;

	constructor(options?: RecursivePartial<FeedbackCombFilterOptions>)
	constructor() {
		super(optionsFromArguments(FeedbackCombFilter.getDefaults(), arguments));
		const options = optionsFromArguments(FeedbackCombFilter.getDefaults(), arguments);

		this._delay = this.input = this.output = new Delay(options.delayTime);
		this.delayTime = this._delay.delayTime;

		this._feedback = new Gain(options.resonance, "normalRange");
		this.resonance = this._feedback.gain;

		this._delay.chain(this._feedback, this._delay);
	}

	/**
	 * The default parameters
	 */
	static getDefaults(): FeedbackCombFilterOptions {
		return {
			...ToneAudioNode.getDefaults(),
			delayTime: 0.1,
			resonance: 0.5,
		};
	}

	dispose(): this {
		super.dispose();
		this._delay.dispose();
		this._feedback.dispose();
		return this;
	}
}