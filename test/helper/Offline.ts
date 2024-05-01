import { TestAudioBuffer } from "./compare/index";
import { OfflineContext } from "../../Tone/core/context/OfflineContext";
import { getContext, setContext } from "../../Tone/core/Global";
import { Seconds } from "../../Tone/core/type/Units";
import { isArray, isFunction } from "../../Tone/core/util/TypeCheck";

type ReturnFunction = (time: Seconds) => void;

export async function Offline(
	callback: (context: OfflineContext) => void | ReturnFunction | ReturnFunction[] | Promise<void | ReturnFunction> | void,
	duration = 0.1, channels = 1, sampleRate = 44100,
): Promise<TestAudioBuffer> {
	const originalContext = getContext();
	const offline = new OfflineContext(channels, duration + 1 / sampleRate, sampleRate);
	setContext(offline);
	try {
		let retFunction = callback(offline);
		if (retFunction instanceof Promise) {
			retFunction = await retFunction;
		}
		if (isFunction(retFunction)) {
			const fn = retFunction;
			offline.on("tick", () => fn(offline.now()));
		} else if (isArray(retFunction)) {
			// each element in the array is a timing callback
			retFunction.forEach(fn => {
				offline.on("tick", () => fn(offline.now()));
			});
		}
	} catch (e) {
		throw e;
	} finally {
		setContext(originalContext);
		const buffer = await offline.render();
		return new TestAudioBuffer(buffer.get() as AudioBuffer);
	}
}

export function whenBetween(value: Seconds, start: Seconds, stop: Seconds, callback: () => void): void {
	if (value >= start && value < stop) {
		callback();
	}
}

// invoked only once
export function atTime(when: Seconds, callback: (time: Seconds) => void): (time: Seconds) => void {
	let wasInvoked = false;
	return (time) => {
		if (time >= when && !wasInvoked) {
			callback(time);
			wasInvoked = true;
		}
	};
}
