import { version } from "../version";

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
export function getContext(): BaseAudioContext {
	if (!globalContext) {
		globalContext = new AudioContext();
		// @ts-ignore
		window.TONE_AUDIO_CONTEXT = globalContext;
	}
	return globalContext;
}

/**
 * Set the default audio context
 */
export function setContext(context: BaseAudioContext): void {
	globalContext = context;
	// @ts-ignore
	window.TONE_AUDIO_CONTEXT = globalContext;
}

/**
 * Most browsers will not play _any_ audio until a user
 * clicks something (like a play button). Invoke this method
 * on a click or keypress event handler to start the audio context.
 * More about the Autoplay policy
 * [here](https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio)
 * @example
 * document.querySelector('#playbutton').addEventListener('click', () => Tone.start())
 */
export function start(): Promise <void> {
	if (globalContext instanceof AudioContext) {
		return globalContext.resume();
	} else {
		return Promise.resolve();
	}
}

/**
 * Log Tone.js + version in the console.
 */
if (!this.TONE_SILENCE_LOGGING) {
	let prefix = "v";
	// @ts-ignore
	if (version === "dev") {
		prefix = "";
	}
	const printString = ` * Tone.js ${prefix}${version} * `;
	// tslint:disable-next-line: no-console
	console.log(`%c${printString}`, "background: #000; color: #fff");
}
