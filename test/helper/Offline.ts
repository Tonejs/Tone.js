import { TestAudioBuffer } from "@tonejs/plot";
import { Context } from "Tone/core/context/Context";
import { OfflineContext } from "Tone/core/context/OfflineContext";
import { isFunction } from "Tone/core/util/TypeCheck";

type ReturnFunction = (time: Seconds) => void;

export async function Offline(
	callback: (context: OfflineContext) => void | ReturnFunction | Promise<void | ReturnFunction> | void,
	duration = 0.1, channels = 1, sampleRate: number = 44100,
): Promise<TestAudioBuffer> {
	const originalContext = Context.getGlobal();
	const offline = new OfflineContext(channels, duration + 1 / sampleRate, sampleRate);
	Context.setGlobal(offline);
	let retFunction = callback(offline);
	if (retFunction instanceof Promise) {
		retFunction = await retFunction;
	}
	if (isFunction(retFunction)) {
		const fn = retFunction;
		offline.on("tick", () => fn(offline.now()));
	}
	Context.setGlobal(originalContext);
	const buffer = await offline.render();
	return new TestAudioBuffer(buffer);
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
