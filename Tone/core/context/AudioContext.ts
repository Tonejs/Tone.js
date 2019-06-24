/**
 * The global audio context which is getable and assignable through
 * getContext and setContext
 */
let globalContext: BaseAudioContext;

// @ts-ignore
globalContext = window.TONE_AUDIO_CONTEXT;

/**
 * Returns the default system-wide AudioContext
 */
export function getAudioContext(): BaseAudioContext {
	if (!globalContext) {
		setAudioContext(new AudioContext());
	}
	return globalContext;
}

/**
 * Set the default audio context
 */
export function setAudioContext(context: BaseAudioContext): void {
	globalContext = context;
	// @ts-ignore
	window.TONE_AUDIO_CONTEXT = globalContext;
}
