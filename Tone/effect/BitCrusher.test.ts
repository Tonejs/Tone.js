import { BitCrusher } from "./BitCrusher";
import { Oscillator } from "Tone/source/oscillator/Oscillator";
import { BasicTests } from "test/helper/Basic";
import { EffectTests } from "test/helper/EffectTests";
import { CompareToFile } from "test/helper/CompareToFile";
import { expect } from "chai";

describe("BitCrusher", () => {

	BasicTests(BitCrusher);
	EffectTests(BitCrusher);

	context("API", () => {

		it("matches a file", () => {
			return CompareToFile(() => {
				const crusher = new BitCrusher({ bits: 4 }).toDestination();
				const osc = new Oscillator(110).connect(crusher);
				osc.start(0);
			}, "bitCrusher.wav", 0.01);
		});

		it("can pass in options in the constructor", () => {
			const crusher = new BitCrusher({
				bits: 3,
			});
			expect(crusher.bits.value).to.equal(3);
			crusher.dispose();
		});

		it("can get/set the options", () => {
			const crusher = new BitCrusher(4);
			expect(crusher.bits.value).to.equal(4);
			crusher.set({
				bits: 5,
			});
			expect(crusher.get().bits).to.equal(5);
			crusher.dispose();
		});
	});
});

