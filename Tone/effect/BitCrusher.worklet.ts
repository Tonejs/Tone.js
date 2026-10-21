/// <reference types="audioworklet" />

import { SingleIOProcessor } from "../core/worklet/SingleIOProcessor.worklet.js";
import { AudioParamDescriptor } from "../core/worklet/ToneAudioWorkletProcessor.worklet.js";

export class BitCrusherWorklet extends SingleIOProcessor {
	static get parameterDescriptors(): AudioParamDescriptor[] {
		return [
			{
				name: "bits",
				defaultValue: 12,
				minValue: 1,
				maxValue: 16,
				automationRate: "k-rate",
			},
		];
	}

	generate(
		input: number,
		_channel: number,
		parameters: Record<string, number>
	): number {
		const step = Math.pow(0.5, parameters.bits - 1);
		return step * Math.floor(input / step + 0.5);
	}
}

registerProcessor("bit-crusher", BitCrusherWorklet);
