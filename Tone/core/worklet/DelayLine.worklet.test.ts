import { expect } from "chai";

import { DelayLine } from "./DelayLine.worklet.js";

describe("DelayLine", () => {
	it("initializes buffer to zeros for each channel", () => {
		const delay = new DelayLine(5, 2);
		expect(delay.get(0, 0)).to.equal(0);
		expect(delay.get(0, 1)).to.equal(0);
		expect(delay.get(1, 0)).to.equal(0);
		expect(delay.get(1, 1)).to.equal(0);
	});

	it("pushes and retrieves samples with delay = 0 for the most recent sample", () => {
		const delay = new DelayLine(10, 1);
		delay.push(0, 0.5);
		expect(delay.get(0, 0)).to.equal(0.5);

		delay.push(0, -0.25);
		expect(delay.get(0, 0)).to.equal(-0.25);
		expect(delay.get(0, 1)).to.equal(0.5);
	});

	it("retrieves samples at past delays", () => {
		const delay = new DelayLine(10, 1);
		const samples = [0.1, 0.2, 0.3, 0.4, 0.5];
		for (const sample of samples) {
			delay.push(0, sample);
		}

		expect(delay.get(0, 0)).to.be.closeTo(0.5, 1e-6);
		expect(delay.get(0, 1)).to.be.closeTo(0.4, 1e-6);
		expect(delay.get(0, 2)).to.be.closeTo(0.3, 1e-6);
		expect(delay.get(0, 3)).to.be.closeTo(0.2, 1e-6);
		expect(delay.get(0, 4)).to.be.closeTo(0.1, 1e-6);
	});

	it("floors fractional delay values in get()", () => {
		const delay = new DelayLine(10, 1);
		delay.push(0, 0.2);
		delay.push(0, 0.8);

		expect(delay.get(0, 0.7)).to.be.closeTo(0.8, 1e-6);
		expect(delay.get(0, 1.4)).to.be.closeTo(0.2, 1e-6);
	});

	it("wraps around the circular buffer correctly", () => {
		const delay = new DelayLine(4, 1);
		// Push 6 values into a buffer of size 4: [1, 2, 3, 4, 5, 6]
		for (let i = 1; i <= 6; i++) {
			delay.push(0, i);
		}

		// Most recent is 6, then 5, 4, 3. 1 and 2 should have been overwritten.
		expect(delay.get(0, 0)).to.equal(6);
		expect(delay.get(0, 1)).to.equal(5);
		expect(delay.get(0, 2)).to.equal(4);
		expect(delay.get(0, 3)).to.equal(3);
	});

	it("handles multiple channels independently", () => {
		const delay = new DelayLine(5, 2);
		delay.push(0, 0.7);
		delay.push(1, -0.4);

		expect(delay.get(0, 0)).to.be.closeTo(0.7, 1e-6);
		expect(delay.get(1, 0)).to.be.closeTo(-0.4, 1e-6);

		delay.push(0, 0.9);
		expect(delay.get(0, 0)).to.be.closeTo(0.9, 1e-6);
		expect(delay.get(0, 1)).to.be.closeTo(0.7, 1e-6);
		expect(delay.get(1, 0)).to.be.closeTo(-0.4, 1e-6);
	});
});
