import { expect } from "chai";

import { testGenerate } from "../../../test/helper/AudioWorklet.js";
import { SingleIOProcessor } from "./SingleIOProcessor.worklet.js";

class MockProcessor extends SingleIOProcessor {
	generate(
		input: number,
		channel: number,
		parameters: Record<string, number>
	): number {
		const gain = parameters.gain ?? 1;
		return input * gain + channel;
	}
}

describe("SingleIOProcessor", () => {
	it("processes samples through generate() with testGenerate", () => {
		const proc = new MockProcessor();
		const inputs = [0.1, 0.2, 0.3];
		const output = testGenerate(proc, inputs, { gain: 2 }, 0);
		expect(output).to.deep.equal([0.2, 0.4, 0.6]);

		// Channel offset: channel 1 adds 1
		const outputChan1 = testGenerate(proc, inputs, { gain: 2 }, 1);
		expect(outputChan1).to.deep.equal([1.2, 1.4, 1.6]);
	});

	it("processes a full block via process() with k-rate parameters", () => {
		const proc = new MockProcessor();
		const inputChannel = new Float32Array(128).fill(0.5);
		const outputChannel = new Float32Array(128);

		const keepAlive = proc.process([[inputChannel]], [[outputChannel]], {
			gain: new Float32Array([3]),
		});

		expect(keepAlive).to.equal(true);
		for (let i = 0; i < 128; i++) {
			expect(outputChannel[i]).to.be.closeTo(1.5, 1e-6);
		}
	});

	it("processes a full block via process() with a-rate parameters", () => {
		const proc = new MockProcessor();
		const inputChannel = new Float32Array(128).fill(1);
		const outputChannel = new Float32Array(128);
		const gainParam = new Float32Array(128);
		for (let i = 0; i < 128; i++) {
			gainParam[i] = i;
		}

		proc.process([[inputChannel]], [[outputChannel]], { gain: gainParam });

		for (let i = 0; i < 128; i++) {
			expect(outputChannel[i]).to.equal(i);
		}
	});

	it("returns false from process() when disposed", () => {
		const proc = new MockProcessor();
		const inputChannel = new Float32Array(128);
		const outputChannel = new Float32Array(128);

		expect(proc.process([[inputChannel]], [[outputChannel]], {})).to.equal(
			true
		);

		// Post dispose message
		if (proc.port.onmessage) {
			proc.port.onmessage({ data: "dispose" } as MessageEvent);
		}

		expect(proc.process([[inputChannel]], [[outputChannel]], {})).to.equal(
			false
		);
	});
});
