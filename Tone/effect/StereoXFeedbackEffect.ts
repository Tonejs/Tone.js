import { StereoEffect, StereoEffectOptions } from "./StereoEffect";
import { NormalRange } from "../core/type/Units";
import { Signal } from "../signal/Signal";
import { Gain } from "../core/context/Gain";
import { readOnly } from "../core/util/Interface";
import { Split } from "../component/channel/Split";
import { Merge } from "../component/channel/Merge";

export interface StereoXFeedbackEffectOptions extends StereoEffectOptions {
	feedback: NormalRange;
}

/**
 * Just like a stereo feedback effect, but the feedback is routed from left to right
 * and right to left instead of on the same channel.
 * ```
 * +--------------------------------+ feedbackRL <----------------------------------+
 * |                                                                                |
 * +-->                          +----->        +---->                          +-----+
 *      feedbackMerge +--> split        (EFFECT)       merge +--> feedbackSplit     | |
 * +-->                          +----->        +---->                          +---+ |
 * |                                                                                  |
 * +--------------------------------+ feedbackLR <------------------------------------+
 * ```
 */
export class StereoXFeedbackEffect<Options extends StereoXFeedbackEffectOptions> extends StereoEffect<Options> {
	
	/**
	 * The amount of feedback from the output
	 * back into the input of the effect (routed
	 * across left and right channels).
	 */
	readonly feedback: Signal<"normalRange">;

	/**
	 * the left side feedback
	 */
	protected _feedbackLR: Gain;

	/**
	 * the right side feedback
	 */
	protected _feedbackRL: Gain;

	/**
	 * Split the channels for feedback
	 */
	protected _feedbackSplit: Split;

	/**
	 * Merge the channels for feedback
	 */
	protected _feedbackMerge: Merge;

	constructor(options: StereoXFeedbackEffectOptions) {

		super(options);

		this.feedback = new Signal({
			context: this.context,
			value: options.feedback, 
			units: "normalRange"
		});
		this._feedbackLR = new Gain({ context: this.context });
		this._feedbackRL = new Gain({ context: this.context });

		this._feedbackSplit = new Split({ context: this.context, channels: 2 });
		this._feedbackMerge = new Merge({ context: this.context, channels: 2 });

		this._merge.connect(this._feedbackSplit);
		this._feedbackMerge.connect(this._split);
		
		// the left output connected to the right input
		this._feedbackSplit.connect(this._feedbackLR, 0, 0);
		this._feedbackLR.connect(this._feedbackMerge, 0, 1);

		// the left output connected to the right input
		this._feedbackSplit.connect(this._feedbackRL, 1, 0);
		this._feedbackRL.connect(this._feedbackMerge, 0, 0);
		
		// the feedback control
		this.feedback.fan(this._feedbackLR.gain, this._feedbackRL.gain);
		readOnly(this, ["feedback"]);
	}

	static getDefaults(): StereoXFeedbackEffectOptions {
		return Object.assign(StereoEffect.getDefaults(), {
			feedback: 0.5,
		});
	}

	dispose(): this {
		super.dispose();
		this.feedback.dispose();
		this._feedbackLR.dispose();
		this._feedbackRL.dispose();
		this._feedbackSplit.dispose();
		this._feedbackMerge.dispose();
		return this;
	}
}
