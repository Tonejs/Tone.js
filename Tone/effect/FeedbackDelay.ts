import { Delay } from "../core/context/Delay.js";
import { Param } from "../core/context/Param.js";
import { NormalRange, Time } from "../core/type/Units.js";
import { optionsFromArguments } from "../core/util/Defaults.js";
import { readOnly } from "../core/util/Interface.js";
import { FeedbackEffect, FeedbackEffectOptions } from "./FeedbackEffect.js";

export interface FeedbackDelayOptions extends FeedbackEffectOptions {
	delayTime: Time;
	maxDelay: Time;
}

/**
 * FeedbackDelay is a DelayNode in which part of output signal is fed back into the delay.
 *
 * @param delayTime The delay applied to the incoming signal.
 * @param feedback The amount of the effected signal which is fed back through the delay.
 * @example
 * const feedbackDelay = new Tone.FeedbackDelay("8n", 0.5).toDestination();
 * const tom = new Tone.MembraneSynth({
 * 	octaves: 4,
 * 	pitchDecay: 0.1
 * }).connect(feedbackDelay);
 * tom.triggerAttackRelease("A2", "32n");
 * @category Effect
 */
export class FeedbackDelay extends FeedbackEffect<FeedbackDelayOptions> {
	readonly name: string = "FeedbackDelay";

	/**
	 * the delay node
	 */
	private _delayNode: Delay;

	/**
	 * The delayTime of the FeedbackDelay.
	 */
	readonly delayTime: Param<"time">;

	constructor(delayTime?: Time, feedback?: NormalRange);
	constructor(options?: Partial<FeedbackDelayOptions>);
	constructor() {
		const options = optionsFromArguments(
			FeedbackDelay.getDefaults(),
			arguments,
			["delayTime", "feedback"]
		);
		super(options);

		this._delayNode = new Delay({
			context: this.context,
			delayTime: options.delayTime,
			maxDelay: options.maxDelay,
		});
		this.delayTime = this._delayNode.delayTime;

		// connect it up
		this.connectEffect(this._delayNode);
		readOnly(this, "delayTime");
	}

	static getDefaults(): FeedbackDelayOptions {
		return Object.assign(FeedbackEffect.getDefaults(), {
			delayTime: 0.25,
			maxDelay: 1,
		});
	}

	dispose(): this {
		super.dispose();
		this._delayNode.dispose();
		this.delayTime.dispose();
		return this;
	}
}
