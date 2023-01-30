import {
	AudioBuffer, isAnyAudioContext,
	isAnyAudioNode, isAnyAudioParam,
	isAnyOfflineAudioContext
} from "standardized-audio-context";

/**
 * Test if the given value is an instanceof AudioParam
 */
export function isAudioParam(arg: unknown): arg is AudioParam {
	return isAnyAudioParam(arg);
}

/**
 * Test if the given value is an instanceof AudioNode
 */
export function isAudioNode(arg: unknown): arg is AudioNode {
	return isAnyAudioNode(arg);
}

/**
 * Test if the arg is instanceof an OfflineAudioContext
 */
export function isOfflineAudioContext(arg: unknown): arg is OfflineAudioContext {
	return isAnyOfflineAudioContext(arg);
}

/**
 * Test if the arg is an instanceof AudioContext
 */
export function isAudioContext(arg: unknown): arg is AudioContext {
	return isAnyAudioContext(arg);
}

/**
 * Test if the arg is instanceof an AudioBuffer
 */
export function isAudioBuffer(arg: unknown): arg is AudioBuffer {
	return arg instanceof AudioBuffer;
}
