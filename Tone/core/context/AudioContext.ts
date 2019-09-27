import {
	IAudioWorkletNodeOptions,
	AudioContext as stdAudioContext,
	AudioWorkletNode as stdAudioWorkletNode,
	OfflineAudioContext as stdOfflineAudioContext,
} from "standardized-audio-context";
import { assert } from "../util/Debug";
import { isDefined } from "../util/TypeCheck";

/**
 * Create a new AudioContext
 */
function createAudioContext(): AudioContext {
	return new stdAudioContext() as unknown as AudioContext;
}

/**
 * Create a new OfflineAudioContext
 */
export function createOfflineAudioContext(channels: number, length: number, sampleRate: number): OfflineAudioContext {
	return new stdOfflineAudioContext(channels, length, sampleRate) as unknown as OfflineAudioContext;
}

/**
 * Either the online or offline audio context
 */
export type AnyAudioContext = AudioContext | OfflineAudioContext;

/**
 * Interface for things that Tone.js adds to the window
 */
interface ToneWindow extends Window {
	TONE_AUDIO_CONTEXT?: AnyAudioContext;
	TONE_SILENCE_LOGGING?: boolean;
	TONE_DEBUG_CLASS?: string;
}

/**
 * A reference to the window object
 * @hidden
 */
export const theWindow: ToneWindow | null = typeof self === "object" ? self : null;

/**
 * If the browser has a window object which has an AudioContext
 * @hidden
 */
export const hasAudioContext = theWindow &&
	(theWindow.hasOwnProperty("AudioContext") || theWindow.hasOwnProperty("webkitAudioContext"));

/**
 * The global audio context which is getable and assignable through
 * getAudioContext and setAudioContext
 */
let globalContext: AnyAudioContext;

// if it was created already, use that one
// this enables multiple versions of Tone.js to run on the same page.
if (theWindow && theWindow.TONE_AUDIO_CONTEXT) {
	globalContext = theWindow.TONE_AUDIO_CONTEXT;
}

/**
 * Returns the default system-wide AudioContext
 */
export function getAudioContext(): AnyAudioContext {
	if (!globalContext && hasAudioContext) {
		setAudioContext(createAudioContext());
	}
	return globalContext;
}

/**
 * Set the default audio context
 */
export function setAudioContext(context: AnyAudioContext): void {
	globalContext = context;
	if (theWindow) {
		theWindow.TONE_AUDIO_CONTEXT = globalContext;
	}
}

export function createAudioWorkletNode(context: AnyAudioContext, name: string, options?: Partial<IAudioWorkletNodeOptions>): AudioWorkletNode {
	assert(isDefined(stdAudioWorkletNode), "This node only works in a secure context (https or localhost)");
	// @ts-ignore
	return new stdAudioWorkletNode(context, name, options);
}
