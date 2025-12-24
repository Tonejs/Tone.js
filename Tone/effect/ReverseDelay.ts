import { Param } from "../core/context/Param.js";
import { NormalRange, Seconds, Time } from "../core/type/Units.js";
import { optionsFromArguments } from "../core/util/Defaults.js";
import { EffectOptions } from "./Effect.js";
import { workletName } from "./ReverseDelay.worklet.js";
import { connectSeries } from "../core/context/ToneAudioNode.js";
import {
	ToneAudioWorklet,
	ToneAudioWorkletOptions,
} from "../core/worklet/ToneAudioWorklet.js";
import { Gain } from "../core/context/Gain.js";
import { Effect } from "./Effect.js";

export interface ReverseDelayOptions extends EffectOptions {
	delayTime: Time
	feedback: NormalRange
}

/**
 * TODO: Add description
 */
export class ReverseDelay extends Effect<ReverseDelayOptions> {
	readonly name: string = "ReverseDelay";

	/**
	 * TODO: add description
	 */
	private _reverseDelayWorklet: ReverseDelayWorklet;

	/**
	 * TODO: update param descriptions
	 * @param delayTime 
	 * @param feedback // min, max, desc
	 */
	constructor(delayTime?: Time, feedback?: NormalRange);
	constructor(options?: Partial<ReverseDelayOptions>);
	constructor() {
		const options = optionsFromArguments(ReverseDelay.getDefaults(), arguments, [
			"delayTime",
			"feedback"
		]);
		super(options);

		this._reverseDelayWorklet = this._connectWorklet(options.delayTime, options.feedback);
	}

	_connectWorklet(delayTime: Time, feedback: NormalRange): ReverseDelayWorklet {
		const worklet = new ReverseDelayWorklet({
			context: this.context,
			delayTime: this.toSeconds(delayTime),
			feedback
		});
		this.connectEffect(worklet);

		return worklet;
	}

	/**
	 * TODO: add description
	 */
	get delayTime(): Time {
		return this._reverseDelayWorklet.delayTime;
	}

	set delayTime(delayTime) {
		const prev = this._reverseDelayWorklet;
		this._reverseDelayWorklet = this._connectWorklet(delayTime, this.feedback);

		// Prevent sudden stop when disposing previous worklet
		prev.output.gain.linearRampTo(0, this.toSeconds(this.delayTime))
		this.context.setTimeout(() => prev.dispose(), this.toSeconds(this.delayTime));
	}

	/**
	 * TODO: add description
	 */
	get feedback(): NormalRange {
		return this._reverseDelayWorklet.feedback.value;
	}

	set feedback(feedback) {
		this._reverseDelayWorklet.set({ feedback });
	}

	static getDefaults(): ReverseDelayOptions {
		return Object.assign(Effect.getDefaults(), {
			wet: .5,
			delayTime: 1,
			feedback: .5
		});
	}

	dispose(): this {
		super.dispose();
		this._reverseDelayWorklet.dispose();
		return this;
	}
}

export interface ReverseDelayWorkletOptions extends ToneAudioWorkletOptions {
	delayTime: Seconds;
	feedback: NormalRange;
}

/**
 * Internal class which creates an AudioWorklet to reverse the delay signal
 */
class ReverseDelayWorklet extends ToneAudioWorklet<ReverseDelayWorkletOptions> {
	readonly name: string = "ReverseDelayWorklet";

	readonly input: Gain;
	readonly output: Gain;

	readonly delayTime: Seconds;
	readonly feedback: Param<"normalRange">;

	constructor(options?: Partial<ReverseDelayOptions>)
	constructor() {
		const options = optionsFromArguments(ReverseDelayWorklet.getDefaults(), arguments, [
			"delayTime",
			"feedback"
		]);

		super({
			...options, 
			workletOptions: {
				processorOptions: {
					delayTime: options.delayTime
				}
			}
		});

		this.input = new Gain({ context: this.context });
		this.output = new Gain({ context: this.context });

		this.delayTime = options.delayTime;
		this.feedback = new Param<"normalRange">({
			context: this.context,
			value: options.feedback,
			units: "normalRange",
			param: this._dummyParam,
			swappable: true,
			minValue: 0,
			maxValue: .9999
		});
	}

	static getDefaults(): ReverseDelayWorkletOptions {
		return Object.assign(ToneAudioWorklet.getDefaults(), {
			delayTime: 1,
			feedback: .5,
		});
	}

	protected _audioWorkletName(): string {
		return workletName;
	}

	onReady(node: AudioWorkletNode): void {
		connectSeries(this.input, node, this.output)
		const feedback = node.parameters.get("feedback") as AudioParam;
		this.feedback.setParam(feedback);
	}

	dispose(): this {
		super.dispose();
		this.input.dispose();
		this.output.dispose();
		this.feedback.dispose();
		return this;
	}
}