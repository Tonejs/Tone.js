import {
	AudioContext as stdAudioContext,
	AudioWorkletNode as stdAudioWorkletNode,
	OfflineAudioContext as stdOfflineAudioContext,
} from "standardized-audio-context";
import { assert } from "../util/Debug";
import { isDefined } from "../util/TypeCheck";

/**
 * Create a new AudioContext
 */
export function createAudioContext(
	options?: AudioContextOptions
): AudioContext {
	return new stdAudioContext(options) as unknown as AudioContext;
}

/**
 * Create a new OfflineAudioContext
 */
export function createOfflineAudioContext(
	channels: number,
	length: number,
	sampleRate: number
): OfflineAudioContext {
	return new stdOfflineAudioContext(
		channels,
		length,
		sampleRate
	) as unknown as OfflineAudioContext;
}

/**
 * Either the online or offline audio context
 */
export type AnyAudioContext = AudioContext | OfflineAudioContext;

/**
 * Interface for things that Tone.js adds to the window
 */
type ToneWindow = Window &
	typeof globalThis & {
	TONE_SILENCE_LOGGING?: boolean;
	TONE_DEBUG_CLASS?: string;
};

/**
 * A reference to the window object
 * @hidden
 */
export const currentWindow: ToneWindow | null =
	typeof self === "object" ? self : null;

/**
 * If the browser has a window object which has an AudioContext
 * @hidden
 */
export const hasAudioContext =
	currentWindow &&
	(currentWindow.hasOwnProperty("AudioContext") ||
		currentWindow.hasOwnProperty("webkitAudioContext"));

export function createAudioWorkletNode(
	context: AnyAudioContext,
	name: string,
	options?: Partial<AudioWorkletNodeOptions>
): AudioWorkletNode {
	assert(
		isDefined(stdAudioWorkletNode),
		"AudioWorkletNode only works in a secure context (https or localhost)"
	);
	const nodeClass =
		currentWindow && context instanceof currentWindow.BaseAudioContext
			? currentWindow.AudioWorkletNode
			: (stdAudioWorkletNode as typeof AudioWorkletNode);
	return new nodeClass(context, name, options);
}

/**
 * This promise resolves to a boolean which indicates if the
 * functionality is supported within the currently used browsee.
 * Taken from [standardized-audio-context](https://github.com/chrisguttandin/standardized-audio-context#issupported)
 */
export { isSupported as supported } from "standardized-audio-context";
