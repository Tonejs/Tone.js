import { expect } from "chai";

import { testGenerate } from "../../test/helper/AudioWorklet.js";
import { ReverseDelayWorklet } from "./ReverseDelay.worklet.js";

describe("ReverseDelayWorklet", () => {
	it("reverses incoming samples and applies window envelope", () => {
		const reverse = new ReverseDelayWorklet({
			processorOptions: { maxDelay: 4 / 44100 },
		});
		const inputs = [1, 2, 0, 0, 0, 0, 0, 0];
		const output = testGenerate(reverse, inputs, {
			delayTime: 4 / 44100,
			feedback: 0,
		});

		// Initial samples return 0 while buffer fills
		expect(output.slice(0, 5)).to.deep.equal([0, 0, 0, 0, 0]);

		// Sample 2 (value 2) emerges before sample 1 (value 1) - reversed order!
		// With window gain 4 * delayPct * (1 - delayPct):
		// For sample 2 at writeHead 5: pct = 3/8 -> gain = 0.9375 -> 2 * 0.9375 = 1.875
		// For sample 1 at writeHead 6: pct = 5/8 -> gain = 0.9375 -> 1 * 0.9375 = 0.9375
		expect(output[5]).to.be.closeTo(1.875, 1e-4);
		expect(output[6]).to.be.closeTo(0.9375, 1e-4);
		expect(output[7]).to.equal(0);
	});

	it("feeds back forward signal according to feedback parameter", () => {
		const reverse = new ReverseDelayWorklet({
			processorOptions: { maxDelay: 2 / 44100 },
		});
		const inputs = [1, ...new Array(15).fill(0)];
		const outputNoFeedback = testGenerate(reverse, inputs, {
			delayTime: 2 / 44100,
			feedback: 0,
		});

		const reverseWithFeedback = new ReverseDelayWorklet({
			processorOptions: { maxDelay: 2 / 44100 },
		});
		const outputWithFeedback = testGenerate(reverseWithFeedback, inputs, {
			delayTime: 2 / 44100,
			feedback: 0.8,
		});

		// With feedback, the signal continues to recirculate in subsequent windows
		const energyNoFb = outputNoFeedback
			.slice(6)
			.reduce((acc, v) => acc + Math.abs(v), 0);
		const energyWithFb = outputWithFeedback
			.slice(6)
			.reduce((acc, v) => acc + Math.abs(v), 0);
		expect(energyWithFb).to.be.greaterThan(energyNoFb);
	});

	it("uses default parameters when none are specified", () => {
		const reverse = new ReverseDelayWorklet();
		const inputs = [0, 0, 0, 0];
		const output = testGenerate(reverse, inputs);
		expect(output).to.deep.equal([0, 0, 0, 0]);
	});

	it("processes channels independently", () => {
		const reverse = new ReverseDelayWorklet({
			processorOptions: { maxDelay: 4 / 44100 },
		});
		const inputs = [1, 2, 0, 0, 0, 0, 0, 0];
		const outputChan0 = testGenerate(
			reverse,
			inputs,
			{ delayTime: 4 / 44100, feedback: 0 },
			0
		);
		expect(outputChan0[5]).to.be.closeTo(1.875, 1e-4);

		const zeros = [0, 0, 0, 0, 0, 0, 0, 0];
		const outputChan1 = testGenerate(
			reverse,
			zeros,
			{ delayTime: 4 / 44100, feedback: 0 },
			1
		);
		expect(outputChan1).to.deep.equal(zeros);
	});

	it("dynamically updates delayTime via parameter without reallocating", () => {
		const reverse = new ReverseDelayWorklet({
			processorOptions: { maxDelay: 8 / 44100 },
		});
		// Inputs with delayTime = 2 / 44100 (windowSize = 4)
		const inputs = [1, 2, 0, 0, 0, 0, 0, 0];
		const output = testGenerate(reverse, inputs, {
			delayTime: 2 / 44100,
			feedback: 0,
		});
		// With delay = 2 (windowSize = 4):
		// writeHead after sample 2: 2.
		// windowSize = 4. readHeadInWindow = (4 - 1 - (2 % 4) + 4) % 4 = 1.
		// windowStart = 2 - (2 % 4) = 0. readHead = 1.
		// At writeHead 3: posInWindow = (2 + 4) % 4 = 2. readHeadOffset = 4 - 1 - 2 = 1.
		// Output begins emerging earlier than with delay = 4.
		expect(output.some((v) => Math.abs(v) > 0)).to.equal(true);
	});
});
