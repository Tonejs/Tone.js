/// <reference types="audioworklet" />

import {
	isArray,
	isFunction,
	isNumber,
	isUndef,
} from "../../Tone/core/util/TypeCheck.js";
import type { AudioParamDescriptor } from "../../Tone/core/worklet/ToneAudioWorkletProcessor.worklet.js";

interface AudioWorkletGlobalScopeEnvironment {
	AudioWorkletProcessor?: typeof AudioWorkletProcessor;
	registerProcessor?: (
		name: string,
		processorCtor: AudioWorkletProcessorConstructor
	) => void;
	sampleRate?: number;
}

const workletScope =
	globalThis as unknown as AudioWorkletGlobalScopeEnvironment;

/* node:coverage disable */
// Ensure AudioWorklet globals exist at runtime in Node and browser test environments
if (isUndef(workletScope.AudioWorkletProcessor)) {
	class MockMessagePort {
		onmessage: ((this: MessagePort, ev: MessageEvent) => void) | null =
			null;
		onmessageerror: ((this: MessagePort, ev: MessageEvent) => void) | null =
			null;
		postMessage(_message: unknown, _transfer?: Transferable[]): void {}
		start(): void {}
		close(): void {}
		addEventListener(
			_type: string,
			_listener: EventListenerOrEventListenerObject,
			_options?: boolean | AddEventListenerOptions
		): void {}
		removeEventListener(
			_type: string,
			_listener: EventListenerOrEventListenerObject,
			_options?: boolean | EventListenerOptions
		): void {}
		dispatchEvent(_event: Event): boolean {
			return true;
		}
	}

	class MockAudioWorkletProcessor implements AudioWorkletProcessor {
		readonly port = new MockMessagePort() as unknown as MessagePort;
	}
	workletScope.AudioWorkletProcessor =
		MockAudioWorkletProcessor as unknown as typeof AudioWorkletProcessor;
}

if (isUndef(workletScope.registerProcessor)) {
	workletScope.registerProcessor = (
		_name: string,
		_processorCtor: AudioWorkletProcessorConstructor
	): void => {
		// no-op in test environment
	};
}

if (isUndef(workletScope.sampleRate)) {
	workletScope.sampleRate = 44100;
}
/* node:coverage enable */

export type ParameterValues = Record<string, number | number[]>;

export interface GenerateOptions {
	channel?: number;
	parameters?: ParameterValues;
}

export interface TestGenerateProcessor {
	generate: (
		input: number,
		chan: number,
		parameters: Record<string, number>
	) => number;
}

function hasParameterDescriptors(
	fn: unknown
): fn is { parameterDescriptors: AudioParamDescriptor[] } {
	return (
		isFunction(fn) &&
		"parameterDescriptors" in fn &&
		isArray((fn as Record<string, unknown>).parameterDescriptors)
	);
}

/**
 * Runs the `generate` method of a SingleIOProcessor across an input array of samples
 * and returns the array of output samples. Supports scheduled parameter values as arrays.
 */
export function testGenerate(
	processor: TestGenerateProcessor,
	inputs: number[] | Float32Array,
	parametersOrOptions: ParameterValues | GenerateOptions = {},
	channel = 0
): number[] {
	let params: ParameterValues = {};
	let chan = channel;

	if (
		"parameters" in parametersOrOptions ||
		"channel" in parametersOrOptions
	) {
		const opts = parametersOrOptions as GenerateOptions;
		if (opts.parameters) {
			params = opts.parameters;
		}
		if (isNumber(opts.channel)) {
			chan = opts.channel;
		}
	} else {
		params = parametersOrOptions as ParameterValues;
	}

	// Pull default parameter values from static parameterDescriptors if available
	const defaultParams: Record<string, number> = {};
	if (hasParameterDescriptors(processor.constructor)) {
		for (const desc of processor.constructor.parameterDescriptors) {
			if (desc.name && isNumber(desc.defaultValue)) {
				defaultParams[desc.name] = desc.defaultValue;
			}
		}
	}

	const output: number[] = [];
	for (let i = 0; i < inputs.length; i++) {
		const currentParams: Record<string, number> = { ...defaultParams };
		for (const [key, val] of Object.entries(params)) {
			currentParams[key] = isArray(val)
				? (val[i] ?? val[val.length - 1] ?? defaultParams[key] ?? 0)
				: val;
		}
		output.push(processor.generate(inputs[i], chan, currentParams));
	}
	return output;
}
