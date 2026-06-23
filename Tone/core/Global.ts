import { version } from "../version.js";
import { AnyAudioContext, theWindow } from "./context/AudioContext.js";
import { BaseContext } from "./context/BaseContext.js";
import { Context } from "./context/Context.js";
import {
	getContext,
	setContext as _setContext,
} from "./context/GlobalContext.js";
import { OfflineContext } from "./context/OfflineContext.js";
import {
	isAudioContext,
	isOfflineAudioContext,
} from "./util/AdvancedTypeCheck.js";

export { getContext };

/**
 * Set the default audio context
 * @param context
 * @param disposeOld Pass `true` if you don't need the old context to dispose it.
 * @category Core
 */
export function setContext(
	context: BaseContext | AnyAudioContext,
	disposeOld = false
): void {
	if (disposeOld) {
		getContext().dispose();
	}

	if (isAudioContext(context)) {
		_setContext(new Context(context));
	} else if (isOfflineAudioContext(context)) {
		_setContext(new OfflineContext(context));
	} else {
		_setContext(context);
	}
}

/**
 * Most browsers will not play _any_ audio until a user
 * clicks something (like a play button). Invoke this method
 * on a click or keypress event handler to start the audio context.
 * More about the Autoplay policy
 * [here](https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio)
 * @example
 * document.querySelector("button").addEventListener("click", async () => {
 * 	await Tone.start();
 * 	console.log("context started");
 * });
 * @category Core
 */
export function start(): Promise<void> {
	return getContext().resume();
}

/**
 * Log Tone.js + version in the console.
 */
if (theWindow && !theWindow.TONE_SILENCE_LOGGING) {
	let prefix = "v";
	if (version === "dev") {
		prefix = "";
	}
	const printString = ` * Tone.js ${prefix}${version} * `;
	// eslint-disable-next-line no-console
	console.log(`%c${printString}`, "background: #000; color: #fff");
}
