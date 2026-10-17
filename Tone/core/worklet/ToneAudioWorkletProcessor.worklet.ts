/// <reference types="audioworklet" />

/**
 * A single entry returned from a processor's static `parameterDescriptors`
 */
export interface AudioParamDescriptor<ParamName extends string = string> {
	name: ParamName;
	automationRate?: "a-rate" | "k-rate";
	minValue?: number;
	maxValue?: number;
	defaultValue: number;
}

/**
 * The options passed into an AudioWorkletProcessor's constructor
 */
export interface ToneWorkletProcessorOptions {
	numberOfInputs?: number;
	numberOfOutputs?: number;
	channelCount?: number;
	channelCountMode?: "max" | "clamped-max" | "explicit";
	channelInterpretation?: "speakers" | "discrete";
	processorOptions?: Record<string, any>;
}

/**
 * Extract default values from an array of AudioParamDescriptors.
 */
export function parameterDescriptorsToDefaults<
	ParamName extends string = string,
>(descriptors?: AudioParamDescriptor<ParamName>[]): Record<ParamName, number> {
	const defaults = {} as Record<ParamName, number>;
	if (descriptors) {
		for (const desc of descriptors) {
			defaults[desc.name] = desc.defaultValue;
		}
	}
	return defaults;
}

/**
 * Recursively merge objects for worklets.
 * Plain objects are deeply merged; primitives and arrays are copied by value/reference.
 */
export function workletDeepMerge<T extends Record<string, any>>(
	target: T,
	...sources: (Record<string, any> | undefined)[]
): T {
	const dest = target as Record<string, any>;
	for (const source of sources) {
		if (!source) {
			continue;
		}
		for (const key of Object.keys(source)) {
			const sourceVal = source[key];
			const targetVal = dest[key];
			if (
				sourceVal &&
				typeof sourceVal === "object" &&
				!Array.isArray(sourceVal)
			) {
				if (
					!targetVal ||
					typeof targetVal !== "object" ||
					Array.isArray(targetVal)
				) {
					dest[key] = {};
				}
				workletDeepMerge(dest[key], sourceVal);
			} else if (sourceVal !== undefined) {
				dest[key] = sourceVal;
			}
		}
	}
	return target;
}

/**
 * The base AudioWorkletProcessor for use in Tone.js. Works with the {@link ToneAudioWorklet}.
 */
export abstract class ToneAudioWorkletProcessor<
		Options extends
			ToneWorkletProcessorOptions = ToneWorkletProcessorOptions,
	>
	extends AudioWorkletProcessor
	implements AudioWorkletProcessorImpl
{
	/**
	 * If the processor was disposed or not. Keep alive until its disposed.
	 */
	protected disposed = false;

	/**
	 * The number of samples in the processing block
	 */
	protected readonly blockSize = 128;

	/**
	 * The sample rate
	 */
	protected sampleRate: number = sampleRate;

	/**
	 * The options passed in to the constructor merged with defaults
	 */
	protected options: Options;

	constructor(options?: Options) {
		super();

		const defaultOptions = (
			this.constructor as typeof ToneAudioWorkletProcessor
		).getDefaults();

		this.options = workletDeepMerge({} as Options, defaultOptions, options);

		this.port.onmessage = (event: MessageEvent): void => {
			// when it receives a dispose
			if (event.data === "dispose") {
				this.disposed = true;
			}
		};
	}

	static get parameterDescriptors(): AudioParamDescriptor[] {
		return [];
	}

	static getDefaults(): ToneWorkletProcessorOptions {
		return {
			numberOfInputs: 1,
			numberOfOutputs: 1,
			processorOptions: parameterDescriptorsToDefaults(
				this.parameterDescriptors
			),
		};
	}

	abstract process(
		inputs: Float32Array[][],
		outputs: Float32Array[][],
		parameters: Record<string, Float32Array>
	): boolean;
}
