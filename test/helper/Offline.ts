import { Clock } from "../../Tone/core/clock/Clock.js";
import { TransportInstance } from "../../Tone/core/clock/Transport.js";
import { OfflineContext } from "../../Tone/core/context/OfflineContext.js";
import { getContext, setContext } from "../../Tone/core/Global.js";
import { Seconds } from "../../Tone/core/type/Units.js";
import { isArray, isFunction } from "../../Tone/core/util/TypeCheck.js";
import { TestAudioBuffer } from "./compare/index.js";

type ReturnFunction = (time: Seconds) => void;

export async function Offline(
	callback: (
		context: OfflineContext
	) =>
		| void
		| ReturnFunction
		| ReturnFunction[]
		| Promise<void | ReturnFunction>
		| void,
	duration = 0.1,
	channels = 1,
	sampleRate = 44100
): Promise<TestAudioBuffer> {
	const originalContext = getContext();
	const offline = new OfflineContext(
		channels,
		duration + 1 / sampleRate,
		sampleRate
	);
	setContext(offline);
	let error: Error | null = null;
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
			retFunction.forEach((fn) => {
				offline.on("tick", () => fn(offline.now()));
			});
		}
	} catch (e) {
		error = e as Error;
	} finally {
		setContext(originalContext);
		const buffer = await offline.render();
		if (error) {
			throw error;
		}
		return new TestAudioBuffer(buffer.get() as AudioBuffer);
	}
}

export function whenBetween(
	value: Seconds,
	start: Seconds,
	stop: Seconds,
	callback: () => void
): void {
	if (value >= start && value < stop) {
		callback();
	}
}

// invoked only once
export function atTime(
	when: Seconds,
	callback: (time: Seconds) => void
): (time: Seconds) => void {
	let wasInvoked = false;
	return (time) => {
		if (time >= when && !wasInvoked) {
			callback(time);
			wasInvoked = true;
		}
	};
}

/**
 * Simulates the real-time condition where Clock._lastUpdate lags behind
 * by temporarily detaching the clock loop from the context's "tick" event.
 */
export function holdClock(
	target: TransportInstance | Clock<any>,
	callback: (time: Seconds) => void
): (time: Seconds) => void {
	const clock = (target as any)._clock ?? target;
	const boundLoop = clock._boundLoop;
	clock.context.off("tick", boundLoop);
	return (time) => {
		try {
			callback(time);
		} finally {
			clock.context.on("tick", boundLoop);
		}
	};
}
