import { ToneAudioWorkletProcessor } from "./ToneAudioWorkletProcessor.worklet";
import { addToWorklet } from "./WorkletGlobalScope";

export abstract class SingleIOProcessor extends ToneAudioWorkletProcessor {

	constructor(options: AudioWorkletNodeOptions) {
		super(Object.assign(options, {
			numberOfInputs: 1,
			numberOfOutputs: 1
		}));
	}

	/**
	 * Generate an output sample from the input sample and parameters
	 */
	abstract generate(input: number, channel: number, parameters: { [name: string]: number }): number;

	/**
	 * Holds the name of the parameter and a single value of that
	 * parameter at the current sample
	 */
	private params: { [name: string]: number } = {};

	/**
	 * Update the private `params` object with the 
	 * values of the parameters at the given index
	 */
	private updateParams(
		parameters: { [name: string]: Float32Array },
		index: number
	) {
		for (const paramName in parameters) {
			const param = parameters[paramName];
			if (param.length > 1) {
				this.params[paramName] = parameters[paramName][index];
			} else {
				this.params[paramName] = parameters[paramName][0];
			}
		}
	}

	/**
	 * Process a single frame of the audio
	 */
	process(
		inputs: Float32Array[][] | undefined[],
		outputs: Float32Array[][],
		parameters: { [name: string]: Float32Array }
	): boolean {
		const input = inputs[0];
		const output = outputs[0];
		// get the parameter values
		const channelCount = Math.max(input?.length || 0, output.length);
		for (let sample = 0; sample < this.blockSize; sample++) {
			this.updateParams(parameters, sample);
			for (let channel = 0; channel < channelCount; channel++) {
				const inputSample = input?.length ? input[channel][sample] : 0;
				output[channel][sample] = this.generate(inputSample, channel, this.params);
			}
		}
		return !this.disposed;
	}
};

addToWorklet(SingleIOProcessor);
