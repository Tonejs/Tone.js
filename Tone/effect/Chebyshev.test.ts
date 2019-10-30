import { Chebyshev } from "./Chebyshev";
import { BasicTests } from "test/helper/Basic";
import { EffectTests } from "test/helper/EffectTests";
import { expect } from "chai";
import { CompareToFile } from "test/helper/CompareToFile";
import { Synth } from "Tone/instrument";

describe("Chebyshev", () => {

	BasicTests(Chebyshev);
	EffectTests(Chebyshev, 51);

	it("matches a file", () => {
		return CompareToFile(() => {
			const cheby = new Chebyshev(100).toDestination();
			const synth = new Synth().connect(cheby);
			synth.triggerAttackRelease("C2", 0.2);
		}, "chebyshev.wav", 0.01);
	});

	context("API", () => {

		it("can pass in options in the constructor", () => {
			const cheby = new Chebyshev({
				order: 2,
			});
			expect(cheby.order).to.equal(2);
			cheby.dispose();
		});

		it("can get/set the options", () => {
			const cheby = new Chebyshev();
			cheby.set({
				order: 40,
			});
			expect(cheby.get().order).to.equal(40);
			cheby.dispose();
		});
	});
});

