/**
 * Interface for things that Tone.js adds to the window
 */
interface ToneWindow extends Window {
	TONE_AUDIO_CONTEXT?: BaseAudioContext;
	TONE_SILENCE_LOGGING?: boolean;
	TONE_DEBUG_CLASS?: string;
}

/**
 * A reference to the window object
 */
export const theWindow: ToneWindow | null = typeof self === "object" ? self : null;

/**
 * If the browser has a window object which has an AudioContext
 */
export const hasAudioContext = theWindow && theWindow.hasOwnProperty("AudioContext");

/**
 * The global audio context which is getable and assignable through
 * getAudioContext and setAudioContext
 */
let globalContext: BaseAudioContext;

// if it was created already, use that one
// this enables multiple versions of Tone.js to run on the same page.
if (theWindow && theWindow.TONE_AUDIO_CONTEXT) {
	globalContext = theWindow.TONE_AUDIO_CONTEXT;
}

/**
 * Returns the default system-wide AudioContext
 */
export function getAudioContext(): BaseAudioContext {
	if (!globalContext && hasAudioContext) {
		setAudioContext(new AudioContext());
	}
	return globalContext;
}

/**
 * Set the default audio context
 */
export function setAudioContext(context: BaseAudioContext): void {
	globalContext = context;
	if (theWindow) {
		theWindow.TONE_AUDIO_CONTEXT = globalContext;
	}
}
