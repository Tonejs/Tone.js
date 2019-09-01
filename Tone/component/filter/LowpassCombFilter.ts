import { Param } from "../../core/context/Param";
import { InputNode, OutputNode, ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { Frequency, NormalRange, Time } from "../../core/type/Units";
import { optionsFromArguments } from "../../core/util/Defaults";
import { RecursivePartial } from "../../core/util/Interface";
import { Signal } from "../../signal/Signal";
import { FeedbackCombFilter } from "./FeedbackCombFilter";
import { Filter } from "./Filter";

interface LowpassCombFilterOptions extends ToneAudioNodeOptions {
	delayTime: Time;
	resonance: NormalRange;
	dampening: Frequency;
}

/**
 *  Tone.Lowpass is a lowpass feedback comb filter. It is similar to
 *  Tone.FeedbackCombFilter, but includes a lowpass filter.
 */
export class LowpassCombFilter extends ToneAudioNode<ToneAudioNodeOptions> {

	readonly name = "LowpassCombFilter";

	/**
	 * The delay node
	 */
	private _combFilter: FeedbackCombFilter;

	/**
	 * The lowpass filter
	 */
	private _lowpass: Filter;

	/**
	 * The delayTime of the comb filter.
	 */
	readonly delayTime: Param<Time>;

	/**
	 * The dampening control of the feedback
	 */
	readonly dampening: Signal<Frequency>;

	/**
	 * The amount of feedback of the delayed signal.
	 */
	readonly resonance: Param<NormalRange>;

	input: InputNode;
	output: OutputNode;

	constructor(options?: RecursivePartial<LowpassCombFilterOptions>)
	constructor() {
		super(optionsFromArguments(LowpassCombFilter.getDefaults(), arguments));
		const options = optionsFromArguments(LowpassCombFilter.getDefaults(), arguments);

		this._combFilter = this.output = new FeedbackCombFilter({
			delayTime: options.delayTime,
			resonance: options.resonance,
		});
		this.delayTime = this._combFilter.delayTime;
		this.resonance = this._combFilter.resonance;

		this._lowpass = this.input = new Filter({
			Q: 0,
			frequency: options.dampening,
			rolloff: -12,
			type : "lowpass",
		});
		this.dampening = this._lowpass.frequency;

		// connections
		this._lowpass.connect(this._combFilter);
	}

	static getDefaults(): LowpassCombFilterOptions {
		return {
			...ToneAudioNode.getDefaults(),
			dampening: 3000,
			delayTime: 0.1,
			resonance: 0.5,
		};
	}

	dispose(): this {
		super.dispose();
		this._combFilter.dispose();
		this._lowpass.dispose();
		return this;
	}
}
