import { BitCrusher } from "./BitCrusher";
import { FeedbackCombFilter } from "Tone/component/filter/FeedbackCombFilter";
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

	it("should be usable with the FeedbackCombFilter", (done) => {
		new BitCrusher(4);
		new FeedbackCombFilter();

		const handle = setTimeout(() => {
			window.onunhandledrejection = null;
			done();
		}, 100);

		window.onunhandledrejection = (event) => {
			done(event.reason);
			clearTimeout(handle);
		};
	});
});

