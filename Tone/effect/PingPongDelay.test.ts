import { PingPongDelay } from "./PingPongDelay";
import { BasicTests } from "test/helper/Basic";
import { EffectTests } from "test/helper/EffectTests";
import { expect } from "chai";
import { CompareToFile } from "test/helper/CompareToFile";
import { Oscillator } from "Tone/source/oscillator/Oscillator";

describe("PingPongDelay", () => {

	BasicTests(PingPongDelay);
	EffectTests(PingPongDelay, 0.01);

	it("matches a file", () => {
		return CompareToFile(() => {
			const delay = new PingPongDelay(0.2, 0.8).toDestination();
			const pulse = new Oscillator().connect(delay);
			pulse.start(0).stop(0.1);
		}, "pingPongDelay.wav", 0.2);
	});

	context("API", () => {

		it("can pass in options in the constructor", () => {
			const pingPong = new PingPongDelay({
				delayTime: 0.2,
			});
			expect(pingPong.delayTime.value).to.be.closeTo(0.2, 0.01);
			pingPong.dispose();
		});

		it("can get/set the options", () => {
			const pingPong = new PingPongDelay();
			pingPong.set({
				delayTime: 0.21,
			});
			expect(pingPong.get().delayTime).to.be.closeTo(0.21, 0.01);
			pingPong.dispose();
		});
	});
});

