import { expect } from "chai";
import { BasicTests } from "test/helper/Basic";
import { CompareToFile } from "test/helper/CompareToFile";
import { InstrumentTest } from "test/helper/InstrumentTests";
import { PluckSynth } from "./PluckSynth";

describe("PluckSynth", () => {

	BasicTests(PluckSynth);
	InstrumentTest(PluckSynth, "C3");

	it("matches a file", () => {
		return CompareToFile(() => {
			const synth = new PluckSynth().toDestination();
			synth.triggerAttack("C4");
		}, "pluckSynth.wav", 0.26);
	});
	
	context("API", () => {

		it("can get and set resonance", () => {
			const pluck = new PluckSynth();
			pluck.resonance.value = 0.4;
			expect(pluck.resonance.value).to.be.closeTo(0.4, 0.001);
			pluck.dispose();
		});

		it("can get and set dampening", () => {
			const pluck = new PluckSynth();
			pluck.dampening.value = 2000;
			expect(pluck.dampening.value).to.be.closeTo(2000, 0.1);
			pluck.dispose();
		});

		it("can get and set the attackNoise", () => {
			const pluck = new PluckSynth();
			pluck.attackNoise = 0.2;
			expect(pluck.attackNoise).to.be.closeTo(0.2, 0.1);
			pluck.dispose();
		});

		it("can be constructed with an options object", () => {
			const pluck = new PluckSynth({
				dampening: 300,
				resonance: 0.5,
			});
			expect(pluck.dampening.value).to.be.closeTo(300, 0.1);
			expect(pluck.resonance.value).to.be.closeTo(0.5, 0.001);
			pluck.dispose();
		});
	});
});
