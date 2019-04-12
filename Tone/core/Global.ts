import { isUndef } from "./Util";

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
 * True if the current environment has the necessary APIs to run Tone.js
 */
// // export const supported: boolean = toneGlobal.hasOwnProperty("Promise") && toneGlobal.hasOwnProperty("AudioContext");

// set the audio context initially, and if one is not already created
// if (Tone.supported && !Tone.initialized){
// 	if (!Tone.global.TONE_AUDIO_CONTEXT){
// 		Tone.global.TONE_AUDIO_CONTEXT = new Context();
// 	}
// 	Tone.context = Tone.global.TONE_AUDIO_CONTEXT;

// 	// log on first initialization
// 	// allow optional silencing of this log
// 	if (!Tone.global.TONE_SILENCE_LOGGING){
// 		var prefix = "v";
// 		if (Tone.version === "dev"){
// 			prefix = "";
// 		}
// 		var printString = " * Tone.js " + prefix + Tone.version + " * ";
// 		// eslint-disable-next-line no-console
// 		console.log("%c" + printString, "background: #000; color: #fff");
// 	}
// } else if (!Tone.supported && !Tone.global.TONE_SILENCE_LOGGING){
// 	// eslint-disable-next-line no-console
// 	console.warn("This browser does not support Tone.js");
// }
