/// <reference types="audioworklet" />

import { DelayLine } from "../../core/worklet/DelayLine.worklet.js";
import { SingleIOProcessor } from "../../core/worklet/SingleIOProcessor.worklet.js";
import {
	AudioParamDescriptor,
	ToneWorkletProcessorOptions,
} from "../../core/worklet/ToneAudioWorkletProcessor.worklet.js";

type FeedbackCombFilterParam = "delayTime" | "feedback";

export class FeedbackCombFilterWorklet extends SingleIOProcessor<FeedbackCombFilterParam> {
	private delayLine: DelayLine;

	constructor(options: ToneWorkletProcessorOptions = {}) {
		super(options);
		this.delayLine = new DelayLine(
			this.sampleRate,
			options.channelCount || 2
		);
	}

	static get parameterDescriptors(): AudioParamDescriptor<FeedbackCombFilterParam>[] {
		return [
			{
				name: "delayTime",
				defaultValue: 0.1,
				minValue: 0,
				maxValue: 1,
				automationRate: "k-rate",
			},
			{
				name: "feedback",
				defaultValue: 0.5,
				minValue: 0,
				maxValue: 0.9999,
				automationRate: "k-rate",
			},
		];
	}

	generate(
		input: number,
		channel: number,
		parameters: Record<FeedbackCombFilterParam, number>
	): number {
		const delayedSample = this.delayLine.get(
			channel,
			parameters.delayTime * this.sampleRate
		);
		this.delayLine.push(
			channel,
			input + delayedSample * parameters.feedback
		);
		return delayedSample;
	}
}

registerProcessor("feedback-comb-filter", FeedbackCombFilterWorklet);
