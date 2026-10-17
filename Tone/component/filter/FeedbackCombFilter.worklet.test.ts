import { expect } from "chai";

import { testGenerate } from "../../../test/helper/AudioWorklet.js";
import { FeedbackCombFilterWorklet } from "./FeedbackCombFilter.worklet.js";

describe("FeedbackCombFilterWorklet", () => {
	it("delays an impulse by the specified delay time with zero feedback", () => {
		const filter = new FeedbackCombFilterWorklet();
		const inputs = [1, 0, 0, 0, 0, 0, 0, 0];
		const expected = [0, 0, 0, 0, 1, 0, 0, 0];

		const output = testGenerate(filter, inputs, {
			delayTime: 3 / 44100,
			feedback: 0,
		});

		expect(output).to.deep.equal(expected);
	});

	it("recirculates signal according to feedback parameter", () => {
		const filter = new FeedbackCombFilterWorklet();
		const inputs = [1, 0, 0, 0, 0, 0, 0];
		const expected = [0, 0, 1, 0, 0.5, 0, 0.25];

		const output = testGenerate(filter, inputs, {
			delayTime: 1 / 44100,
			feedback: 0.5,
		});

		for (let i = 0; i < expected.length; i++) {
			expect(output[i]).to.be.closeTo(expected[i], 1e-6);
		}
	});

	it("uses default parameters when none are specified", () => {
		const filter = new FeedbackCombFilterWorklet();
		// Default delayTime is 0.1 seconds = 4410 samples at 44100Hz
		const inputs = [1, ...new Array(50).fill(0)];
		const output = testGenerate(filter, inputs);

		// Output should be zero for the first 51 samples
		for (let i = 0; i < inputs.length; i++) {
			expect(output[i]).to.equal(0);
		}
	});

	it("processes channels independently", () => {
		const filter = new FeedbackCombFilterWorklet();
		const inputs = [1, 0, 0, 0, 0];

		// Send impulse on channel 0
		const outputChan0 = testGenerate(
			filter,
			inputs,
			{ delayTime: 1 / 44100, feedback: 0.5 },
			0
		);
		expect(outputChan0).to.deep.equal([0, 0, 1, 0, 0.5]);

		// Channel 1 should be silent since it received no input
		const zeros = [0, 0, 0, 0, 0];
		const outputChan1 = testGenerate(
			filter,
			zeros,
			{ delayTime: 1 / 44100, feedback: 0.5 },
			1
		);
		expect(outputChan1).to.deep.equal([0, 0, 0, 0, 0]);
	});
});
