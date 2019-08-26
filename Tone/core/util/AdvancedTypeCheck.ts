import { isAnyAudioNode } from "standardized-audio-context";
import { isFunction } from "./TypeCheck";

/**
 * Test if the given value is an instanceof AudioParam
 */
export function isAudioParam(arg: any): arg is AudioParam {
	return arg instanceof Object &&  Reflect.has(arg, "value") &&
		!Reflect.has(arg, "input") &&
		isFunction(arg.setValueAtTime);
}

/**
 * Test if the given value is an instanceof AudioNode
 */
export function isAudioNode(arg: any): arg is AudioNode {
	return isAnyAudioNode(arg);
}

/**
 * Test if the arg is instanceof an OfflineAudioContext
 */
export function isOfflineAudioContext(arg: any): arg is OfflineAudioContext {
	return arg instanceof Object &&  Reflect.has(arg, "destination") &&
		isFunction(arg.startRendering) && !Reflect.has(arg, "rawContext");
}

/**
 * Test if the arg is an instanceof AudioContext
 */
export function isAudioContext(arg: any): arg is AudioContext {
	return arg instanceof Object &&  Reflect.has(arg, "destination") &&
		isFunction(arg.close) && isFunction(arg.resume) && !Reflect.has(arg, "rawContext");
}

/**
 * Test if the arg is instanceof an AudioBuffer
 */
export function isAudioBuffer(arg: any): arg is AudioBuffer {
	return arg instanceof Object &&  Reflect.has(arg, "sampleRate")
		&& Reflect.has(arg, "duration") && !isFunction(arg.load);
}
