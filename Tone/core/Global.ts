import { version } from "../version";

/**
 * The global audio context which is getable and assignable through
 * getContext and setContext
 */
let globalContext: BaseAudioContext;

/**
 * Returns the default system-wide AudioContext
 */
export function getContext(): BaseAudioContext {
	if (!globalContext) {
		globalContext = new AudioContext();
	}
	return globalContext;
}

/**
 * Set the default audio context
 */
export function setContext(context: BaseAudioContext): void {
	globalContext = context;
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
export function start(): Promise < void> {
	return globalContext.resume();
}

/**
 * Log Tone.js + version in the console.
 */
if (!this.TONE_SILENCE_LOGGING) {
	let prefix = "v";
	if (version === "dev") {
		prefix = "";
	}
	const printString = ` * Tone.js ${prefix}${version} * `;
	// tslint:disable-next-line: no-console
	console.log(`%c${printString}`, "background: #000; color: #fff");
}
