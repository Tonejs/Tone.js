/// <reference types="audioworklet" />

import { DelayLine } from "../core/worklet/DelayLine.worklet.js";
import { SingleIOProcessor } from "../core/worklet/SingleIOProcessor.worklet.js";
import {
	AudioParamDescriptor,
	ToneWorkletProcessorOptions,
	workletDeepMerge,
} from "../core/worklet/ToneAudioWorkletProcessor.worklet.js";

interface ReverseDelayWorkletOptions extends ToneWorkletProcessorOptions {
	processorOptions?: {
		maxDelay?: number;
	};
}

type ReverseDelayParam = "delayTime" | "feedback";

export class ReverseDelayWorklet extends SingleIOProcessor<
	ReverseDelayParam,
	ReverseDelayWorkletOptions
> {
	private delayLine: DelayLine;
	private writeHead: number[] = [];

	constructor(options: ReverseDelayWorkletOptions = {}) {
		super(options);
		const maxDelay = this.options.processorOptions?.maxDelay ?? 1;
		const maxSamples = Math.floor(this.sampleRate * maxDelay);
		const channels = this.options.channelCount || 2;
		this.delayLine = new DelayLine(maxSamples * 2, channels);
		for (let i = 0; i < channels; i++) {
			this.writeHead[i] = 0;
		}
	}

	static getDefaults(): ReverseDelayWorkletOptions {
		return workletDeepMerge(super.getDefaults(), {
			processorOptions: {
				maxDelay: 1,
			},
		}) as ReverseDelayWorkletOptions;
	}

	static get parameterDescriptors(): AudioParamDescriptor<ReverseDelayParam>[] {
		return [
			{
				name: "delayTime",
				defaultValue: 1,
				minValue: 0,
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
		parameters: Record<ReverseDelayParam, number>
	): number {
		const delayTimeSamples = Math.floor(
			this.sampleRate * parameters.delayTime
		);
		const windowSize = Math.floor(delayTimeSamples * 2);

		let reversedSample = 0;
		if (windowSize > 0) {
			const posInWindow = this.writeHead[channel] % windowSize;
			const readWriteDifference = (2 * posInWindow + 1) % windowSize;
			const delayPct = readWriteDifference / windowSize;
			const gainFunction = 4 * delayPct * (1 - delayPct);

			reversedSample =
				this.delayLine.get(channel, readWriteDifference) * gainFunction;
		}

		const delayedSample = this.delayLine.get(channel, delayTimeSamples);

		// Push the forward sample back on the line
		this.delayLine.push(
			channel,
			input + delayedSample * parameters.feedback
		);
		this.writeHead[channel] += 1;

		// Play the reversed sample
		return reversedSample;
	}
}

registerProcessor("reverse-delay", ReverseDelayWorklet);
