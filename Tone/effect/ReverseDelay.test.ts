import { expect } from "chai";

import { BasicTests } from "../../test/helper/Basic.js";
import { CompareToFile } from "../../test/helper/CompareToFile.js";
import { EffectTests } from "../../test/helper/EffectTests.js";
import { Oscillator } from "../source/oscillator/Oscillator.js";
import { ReverseDelay } from "./ReverseDelay.js";

describe("ReverseDelay", () => {
	BasicTests(ReverseDelay);
	EffectTests(ReverseDelay, 0.01);

	context("API", () => {
		it("matches a file", () => {
			return CompareToFile(() => {
				const delay = new ReverseDelay({
					delayTime: 0.2,
					feedback: 0.5,
					wet: 0.5,
				}).toDestination();
				const osc = new Oscillator().connect(delay);
				osc.start(0);
				osc.volume.linearRampToValueAtTime(0, 0.1);
				osc.volume.exponentialRampToValueAtTime(-Infinity, 0.2);
			}, "reverseDelay.wav");
		});

		it("can pass in options in the constructor", () => {
			const reverse = new ReverseDelay({
				delayTime: 1.25,
				feedback: 0.75,
			});
			expect(reverse.delayTime.value).to.equal(1.25);
			expect(reverse.feedback.value).to.equal(0.75);
			reverse.dispose();
		});

		it("can get/set the options", () => {
			const reverse = new ReverseDelay(1.25, 0.75);
			expect(reverse.delayTime.value).to.equal(1.25);
			expect(reverse.feedback.value).to.equal(0.75);
			reverse.set({
				delayTime: "2n",
				feedback: 0.5,
			});

			expect(reverse.get().delayTime).to.be.closeTo(1, 0.01);
			expect(reverse.get().feedback).to.be.closeTo(0.5, 0.01);
			reverse.dispose();
		});

		it("can set the delayTime and feedback params directly", () => {
			const reverse = new ReverseDelay({
				maxDelay: 3,
			});
			reverse.delayTime.value = 0.5;
			expect(reverse.delayTime.value).to.be.closeTo(0.5, 0.001);
			reverse.delayTime.value = "4n";
			expect(reverse.delayTime.value).to.be.closeTo(0.5, 0.001);
			reverse.feedback.value = 0.8;
			expect(reverse.feedback.value).to.be.closeTo(0.8, 0.001);
			reverse.dispose();
		});
	});
});
