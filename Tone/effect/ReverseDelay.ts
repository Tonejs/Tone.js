import { Delay } from "../core/context/Delay.js";
import { Param } from "../core/context/Param.js";
import { NormalRange, Time } from "../core/type/Units.js";
import { optionsFromArguments } from "../core/util/Defaults.js";
import { readOnly } from "../core/util/Interface.js";
import { FeedbackEffect, FeedbackEffectOptions } from "./FeedbackEffect.js";
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
	// delayTime: Time
}

export class ReverseDelay extends Effect<ReverseDelayOptions> {
	readonly name: string = "ReverseDelay";

		private _reverseDelayWorklet: ReverseDelayWorklet
	
		// TODO: Figure out passing delayTime
		/**
		 * The delayTime of the FeedbackDelay.
		 */
		// readonly delayTime: Param<"time">;
	
		constructor(delayTime?: Time, feedback?: NormalRange);
		constructor(options?: Partial<ReverseDelayOptions>);
		constructor() {
			const options = optionsFromArguments(
				ReverseDelay.getDefaults(),
				arguments,
				// ["delayTime", "feedback"]
			);

			super(options);

			this._reverseDelayWorklet = new ReverseDelayWorklet({
				context: this.context,
				// delayTime: options.delayTime
			});

			this.connectEffect(this._reverseDelayWorklet);
		}


		static getDefaults(): ReverseDelayOptions {
			return Object.assign(Effect.getDefaults(), {
				wet: .5,
				delayTime: .5
			});
		}
	
		dispose(): this {
			super.dispose();
			this._reverseDelayWorklet.dispose();
			return this;
		}
}

export interface ReverseDelayWorkletOptions extends ToneAudioWorkletOptions {
	delayTime: Time
	feedback: NormalRange;
}

class ReverseDelayWorklet extends ToneAudioWorklet<ReverseDelayWorkletOptions> {
	readonly input: Gain;
	readonly output: Gain;

	/**
	 * The amount of feedback of the delayed signal.
	 */
	readonly feedback: Param<"normalRange">;

	constructor(options?: Partial<ReverseDelayOptions>)
	constructor() {
		const options = optionsFromArguments(
			ReverseDelayWorklet.getDefaults(),
			arguments,
			["delayTime", "feedback"],
		);

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

		this.feedback = new Param<"normalRange">({
			context: this.context,
			value: options.feedback,
			units: "normalRange",
			param: this._dummyParam,
			swappable: true,
		});

		readOnly(
			this,
			[
				"feedback",
				"delayTime"
			]
		);
	}

	protected _audioWorkletName(): string {
		return workletName;
	}

	onReady(node: AudioWorkletNode): void {
		connectSeries(this.input, node, this.output)
		const feedback = node.parameters.get("feedback") as AudioParam;
		this.feedback.setParam(feedback);
	}

	/**
	 * The default parameters
	 */
	static getDefaults(): ReverseDelayWorkletOptions {
		return Object.assign(ToneAudioWorklet.getDefaults(), {
			// TODO: See if there are standard options across codebase
			delayTime: 1,
			feedback: .25,
		});
	}

	dispose(): this {
		super.dispose();
		this.input.dispose();
		this.output.dispose();
		this.feedback.dispose();
		return this;
	}
}