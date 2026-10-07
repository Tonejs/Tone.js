import { expect } from "chai";

import { BasicTests } from "../../test/helper/Basic.js";
import { EffectTests } from "../../test/helper/EffectTests.js";
import { Offline } from "../../test/helper/Offline.js";
import { Signal } from "../signal/Signal.js";
import { Oscillator } from "../source/oscillator/Oscillator.js";
import { RingModulator } from "./RingModulator.js";

describe("RingModulator", () => {
	BasicTests(RingModulator);
	EffectTests(RingModulator);

	context("API", () => {
		it("can pass in options in the constructor", () => {
			const ringMod = new RingModulator({
				frequency: 200,
				type: "square",
			});
			expect(ringMod.frequency.value).to.be.closeTo(200, 0.001);
			expect(ringMod.type).to.equal("square");
			ringMod.dispose();
		});

		it("can get/set the options", () => {
			const ringMod = new RingModulator(300);
			expect(ringMod.frequency.value).to.be.closeTo(300, 0.001);
			ringMod.set({
				frequency: 50,
				type: "triangle",
			});
			expect(ringMod.get().frequency).to.be.closeTo(50, 0.001);
			expect(ringMod.get().type).to.equal("triangle");
			ringMod.dispose();
		});

		it("multiplies the input by the carrier", async () => {
			const carrier = await Offline(() => {
				new Oscillator(100).toDestination().start(0);
			}, 0.05);
			const output = await Offline(() => {
				const ringMod = new RingModulator(100).toDestination();
				new Signal(0.5).connect(ringMod);
			}, 0.05);
			const carrierData = carrier.toArray()[0];
			const outputData = output.toArray()[0];
			// the carrier is bipolar, so the output swings below zero
			expect(output.min()).to.be.closeTo(-0.5, 0.01);
			expect(output.max()).to.be.closeTo(0.5, 0.01);
			outputData.forEach((sample, i) => {
				expect(sample).to.be.closeTo(carrierData[i] * 0.5, 0.001);
			});
		});
	});
});
