import { SingleIOProcessor } from "../../core/worklet/SingleIOProcessor.worklet";
import "../../core/worklet/DelayLine.worklet";
import { registerProcessor } from "../../core/worklet/WorkletGlobalScope";

export const workletName = "feedback-comb-filter";

export class FeedbackCombFilterWorklet extends SingleIOProcessor {

	private delayLine: import("../../core/worklet/DelayLine.worklet").DelayLine;

	constructor(options: AudioWorkletNodeOptions) {
		super(options);
		// @ts-ignore
		this.delayLine = new DelayLine(this.sampleRate, options.channelCount || 2);
	}

	static get parameterDescriptors() {
		return [{
			name: "delayTime",
			defaultValue: 0.1,
			minValue: 0,
			maxValue: 1
		}, {
			name: "feedback",
			defaultValue: 0.5,
			minValue: 0,
			maxValue: 0.9999,
		}];
	}

	generate(input: number, channel: number, parameters: { [name: string]: number }): number {
		const delayedSample = this.delayLine.get(channel, parameters.delayTime * this.sampleRate);
		this.delayLine.push(channel, input + delayedSample * parameters.feedback);
		// console.log(channel);
		return delayedSample;
	}
}

registerProcessor(workletName, FeedbackCombFilterWorklet);
