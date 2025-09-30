import { expect } from "chai";

import { Gain } from "../../Tone/core/context/Gain.js";
import { ToneAudioNode } from "../../Tone/core/context/ToneAudioNode.js";
import { Signal } from "../../Tone/signal/Signal.js";
import { ConstantOutput } from "./ConstantOutput.js";

interface ToneAudioNodeConstructor {
	new (...args: unknown[]): ToneAudioNode;
}

/**
 * Test overwriting of connected signals with classes that use signalConnect / signalDisconnect.
 */
export function SignalConnectAndDisconnect(
	Constructor: ToneAudioNodeConstructor
) {
	context("signal connect/disconnect", () => {
		it("overwrites the output of a signal", () => {
			const signal = new Signal();
			const instance = new Constructor();
			expect(signal.overridden).to.be.false;

			instance.connect(signal);
			expect(signal.overridden).to.be.true;
			expect(signal.value).to.equal(0);

			signal.dispose();
			instance.dispose();
		});

		it("can disconnect from an AudioNode", () => {
			return ConstantOutput(() => {
				const instance = new Constructor();
				const gain = new Gain({
					gain: 0.5,
				}).toDestination();
				instance.connect(gain);
				instance.disconnect(gain);
			}, 0);
		});

		it("restores the output of a Signal when disconnected", () => {
			return ConstantOutput(() => {
				const signal = new Signal(3).toDestination();
				const instance = new Constructor();
				instance.connect(signal);
				instance.disconnect(signal);
			}, 3);
		});

		it("restores an AudioParam when disconnected", () => {
			const gainNode = new Gain(1);
			const instance = new Constructor();
			expect(gainNode.gain.overridden).to.be.false;
			expect(gainNode.gain.value).to.equal(1);

			// overwritten values
			instance.connect(gainNode.gain);
			expect(gainNode.gain.overridden).to.be.true;
			expect(gainNode.gain.value).to.equal(0);

			// back to the original values
			instance.disconnect(gainNode.gain);
			expect(gainNode.gain.overridden).to.be.false;
			expect(gainNode.gain.value).to.equal(1);

			gainNode.dispose();
			instance.dispose();
		});
	});
}
