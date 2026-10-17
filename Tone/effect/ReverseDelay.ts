import { Gain } from "../core/context/Gain.js";
import { Param } from "../core/context/Param.js";
import { connectSeries } from "../core/context/ToneAudioNode.js";
import { NormalRange, Seconds, Time } from "../core/type/Units.js";
import { optionsFromArguments } from "../core/util/Defaults.js";
import { readOnly } from "../core/util/Interface.js";
import {
	ToneAudioWorklet,
	ToneAudioWorkletOptions,
} from "../core/worklet/ToneAudioWorklet.js";
import { Effect, EffectOptions } from "./Effect.js";
import { audioWorklet } from "./ReverseDelay.worklet.code.js";

const workletName = "reverse-delay";

export interface ReverseDelayOptions extends EffectOptions {
	delayTime: Time;
	maxDelay: Time;
	feedback: NormalRange;
}

/**
 * A feedback delay effect that plays the echos in reverse.
 * Algorithm and gain function found in [this pdf](https://ccrma.stanford.edu/~jingjiez/portfolio/echoing-harmonics/pdfs/A%20Pitch%20Shifting%20Reverse%20Echo%20Audio%20Effect.pdf)
 *
 * @example
 * const reverse = new Tone.ReverseDelay(1.5, 0.75).toDestination();
 * const synth = new Tone.Synth().connect(reverse);
 * synth.triggerAttackRelease("C4", "2n");
 * @category Effect
 */
export class ReverseDelay extends Effect<ReverseDelayOptions> {
	readonly name: string = "ReverseDelay";

	/**
	 * The node that does the reverse delay effect.
	 */
	private _reverseDelayWorklet: ReverseDelayWorklet;

	/**
	 * The amount of time the incoming signal is delayed and reversed.
	 */
	readonly delayTime: Param<"time">;

	/**
	 * The amount of signal which is fed back through the delay.
	 */
	readonly feedback: Param<"normalRange">;

	/**
	 * @param delayTime The amount of time the incoming signal will be delayed and reversed.
	 * @param feedback The amount of signal which is fed back through the delay.
	 */
	constructor(delayTime?: Time, feedback?: NormalRange);
	constructor(options?: Partial<ReverseDelayOptions>);
	constructor() {
		const options = optionsFromArguments(
			ReverseDelay.getDefaults(),
			arguments,
			["delayTime", "feedback"]
		);
		super(options);

		const maxDelay = Math.max(
			this.toSeconds(options.delayTime),
			this.toSeconds(options.maxDelay)
		);

		this._reverseDelayWorklet = new ReverseDelayWorklet({
			context: this.context,
			delayTime: this.toSeconds(options.delayTime),
			maxDelay,
			feedback: options.feedback,
		});
		this.connectEffect(this._reverseDelayWorklet);

		this.delayTime = this._reverseDelayWorklet.delayTime;
		this.feedback = this._reverseDelayWorklet.feedback;
		readOnly(this, ["delayTime", "feedback"]);
	}

	static getDefaults(): ReverseDelayOptions {
		return Object.assign(Effect.getDefaults(), {
			wet: 0.5,
			delayTime: 1,
			maxDelay: 2,
			feedback: 0.5,
		});
	}

	dispose(): this {
		super.dispose();
		this._reverseDelayWorklet.dispose();
		this.delayTime.dispose();
		this.feedback.dispose();
		return this;
	}
}

export interface ReverseDelayWorkletOptions extends ToneAudioWorkletOptions {
	delayTime: Seconds;
	maxDelay: Seconds;
	feedback: NormalRange;
}

/**
 * Internal class which creates an AudioWorklet to reverse the delay signal
 */
class ReverseDelayWorklet extends ToneAudioWorklet<ReverseDelayWorkletOptions> {
	readonly name: string = "ReverseDelayWorklet";

	readonly input: Gain;
	readonly output: Gain;

	readonly delayTime: Param<"time">;
	readonly feedback: Param<"normalRange">;

	constructor(options?: Partial<ReverseDelayOptions>);
	constructor() {
		const options = optionsFromArguments(
			ReverseDelayWorklet.getDefaults(),
			arguments,
			["delayTime", "feedback"]
		);

		const maxDelay = Math.max(options.delayTime, options.maxDelay);

		super({
			...options,
			workletOptions: {
				processorOptions: {
					maxDelay,
				},
			},
		});

		this.input = new Gain({ context: this.context });
		this.output = new Gain({ context: this.context });

		this.delayTime = new Param<"time">({
			context: this.context,
			value: options.delayTime,
			units: "time",
			param: this._dummyParam,
			swappable: true,
			minValue: 0,
			maxValue: maxDelay,
		});
		this.feedback = new Param<"normalRange">({
			context: this.context,
			value: options.feedback,
			units: "normalRange",
			param: this._dummyParam,
			swappable: true,
			minValue: 0,
			maxValue: 0.9999,
		});
	}

	static getDefaults(): ReverseDelayWorkletOptions {
		return Object.assign(ToneAudioWorklet.getDefaults(), {
			delayTime: 1,
			maxDelay: 2,
			feedback: 0.5,
		});
	}

	protected _audioWorkletName(): string {
		return workletName;
	}

	protected _audioWorkletCode(): string {
		return audioWorklet;
	}

	protected _onReady(node: AudioWorkletNode): void {
		connectSeries(this.input, node, this.output);
		const delayTime = node.parameters.get("delayTime") as AudioParam;
		this.delayTime.setParam(delayTime);
		const feedback = node.parameters.get("feedback") as AudioParam;
		this.feedback.setParam(feedback);
	}

	dispose(): this {
		super.dispose();
		this.input.dispose();
		this.output.dispose();
		this.delayTime.dispose();
		this.feedback.dispose();
		return this;
	}
}
