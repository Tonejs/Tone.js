import { version } from "../version";
import { Context } from "./context/Context";

/**
 * The global audio context which is getable and assignable through
 * getContext and setContext
 */
let globalContext: Context;

// @ts-ignore
globalContext = window.TONE_CONTEXT;

/**
 * Returns the default system-wide AudioContext
 */
export function getContext(): Context {
	if (!globalContext) {
		setContext(new Context());
	}
	return globalContext;
}

/**
 * Set the default audio context
 */
export function setContext(context: Context): void {
	globalContext = context;
	context.initialize();
	// @ts-ignore
	window.TONE_CONTEXT = context;
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
	return globalContext.resume();
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
