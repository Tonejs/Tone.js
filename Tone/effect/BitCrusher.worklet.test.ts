import { expect } from "chai";

import { testGenerate } from "../../test/helper/AudioWorklet.js";
import { BitCrusherWorklet } from "./BitCrusher.worklet.js";

describe("BitCrusherWorklet", () => {
	it("quantizes input samples with bits = 2", () => {
		const crusher = new BitCrusherWorklet();
		// step = Math.pow(0.5, 2 - 1) = 0.5
		const inputs = [0, -0.2, -0.3, -0.5, -0.8, 0.2, 0.3, 0.5, 0.8];
		const expected = [0, 0, -0.5, -0.5, -1, 0, 0.5, 0.5, 1];

		const output = testGenerate(crusher, inputs, { bits: 2 });
		expect(output).to.deep.equal(expected);
	});

	it("quantizes input samples with bits = 1", () => {
		const crusher = new BitCrusherWorklet();
		// step = Math.pow(0.5, 1 - 1) = 1.0
		const inputs = [-0.8, -0.5, 0, 0.4, 0.8];
		const expected = [-1, 0, 0, 0, 1];

		const output = testGenerate(crusher, inputs, { bits: 1 });
		expect(output).to.deep.equal(expected);
	});

	it("uses default parameters when none are specified", () => {
		const crusher = new BitCrusherWorklet();
		const inputs = [0, 0.25, 0.5, -0.5];
		const output = testGenerate(crusher, inputs);

		// With default bits = 12 (step = 1/2048), values should be very close to original
		for (let i = 0; i < inputs.length; i++) {
			expect(output[i]).to.be.closeTo(inputs[i], 1 / 2048);
		}
	});

	it("quantizes input samples with scheduled parameter values per sample", () => {
		const crusher = new BitCrusherWorklet();
		// For input 0.3:
		// with bits = 2: step = 0.5 -> 0.5 * Math.floor(0.3 / 0.5 + 0.5) = 0.5
		// with bits = 1: step = 1.0 -> 1.0 * Math.floor(0.3 / 1.0 + 0.5) = 0
		const inputs = [0.3, 0.3, 0.3, 0.3];
		const output = testGenerate(crusher, inputs, { bits: [2, 2, 1, 1] });
		expect(output).to.deep.equal([0.5, 0.5, 0, 0]);
	});

	it("holds the last scheduled value when array is shorter than inputs", () => {
		const crusher = new BitCrusherWorklet();
		const inputs = [0.3, 0.3, 0.3, 0.3];
		const output = testGenerate(crusher, inputs, { bits: [2] });
		expect(output).to.deep.equal([0.5, 0.5, 0.5, 0.5]);
	});
});
