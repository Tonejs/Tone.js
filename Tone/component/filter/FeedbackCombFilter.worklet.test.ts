import { expect, use } from "chai";
import chaiAlmost from "chai-almost";

import { testGenerate } from "../../../test/helper/AudioWorklet.js";
import { FeedbackCombFilterWorklet } from "./FeedbackCombFilter.worklet.js";

use(chaiAlmost());

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

		expect(output).to.deep.almost(expected);
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
