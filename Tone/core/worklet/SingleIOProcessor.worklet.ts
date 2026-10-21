/// <reference types="audioworklet" />

import {
	ToneAudioWorkletProcessor,
	ToneWorkletProcessorOptions,
	workletDeepMerge,
} from "./ToneAudioWorkletProcessor.worklet.js";

/**
 * Abstract class for a single input/output processor.
 * Has a `generate` function which processes one sample at a time.
 */
export abstract class SingleIOProcessor<
	ParamName extends string = string,
	Options extends ToneWorkletProcessorOptions = ToneWorkletProcessorOptions,
> extends ToneAudioWorkletProcessor<Options> {
	/**
	 * Holds the name of the parameter and a single value of that
	 * parameter at the current sample
	 */
	protected params: Record<ParamName, number> = {} as Record<
		ParamName,
		number
	>;

	static getDefaults(): ToneWorkletProcessorOptions {
		return workletDeepMerge(super.getDefaults(), {
			numberOfInputs: 1,
			numberOfOutputs: 1,
		});
	}

	/**
	 * Generate an output sample from the input sample and parameters
	 */
	abstract generate(
		input: number,
		channel: number,
		parameters: Record<ParamName, number>
	): number;

	/**
	 * Update the private params object with the
	 * values of the parameters at the given index
	 */
	private updateParams(
		parameters: Record<string, Float32Array>,
		index: number
	): void {
		for (const paramName in parameters) {
			const param = parameters[paramName];
			if (param.length > 1) {
				(this.params as Record<string, number>)[paramName] =
					param[index];
			} else {
				(this.params as Record<string, number>)[paramName] = param[0];
			}
		}
	}

	/**
	 * Process a single frame of the audio
	 */
	process(
		inputs: Float32Array[][],
		outputs: Float32Array[][],
		parameters: Record<string, Float32Array>
	): boolean {
		const input = inputs[0];
		const output = outputs[0];
		const channelCount = Math.max(input?.length || 0, output.length);
		for (let sample = 0; sample < this.blockSize; sample++) {
			this.updateParams(parameters, sample);
			for (let channel = 0; channel < channelCount; channel++) {
				const inputSample = input?.length ? input[channel][sample] : 0;
				output[channel][sample] = this.generate(
					inputSample,
					channel,
					this.params
				);
			}
		}
		return !this.disposed;
	}
}
