import { expect } from "chai";
import { BasicTests } from "test/helper/Basic";
import { CompareToFile } from "test/helper/CompareToFile";
import { EffectTests } from "test/helper/EffectTests";
import { Oscillator } from "Tone/source/oscillator/Oscillator";
import { Distortion } from "./Distortion";

describe("Distortion", () => {

	BasicTests(Distortion);
	EffectTests(Distortion);

	it("matches a file", () => {
		return CompareToFile(() => {
			const dist = new Distortion(0.8).toDestination();
			const osc = new Oscillator().connect(dist);
			osc.type = "square";
			osc.start(0).stop(0.4);
		}, "distortion.wav", 0.01);
	});

	context("API", () => {

		it("can pass in options in the constructor", () => {
			const dist = new Distortion({
				distortion: 0.2,
			});
			expect(dist.distortion).to.be.closeTo(0.2, 0.01);
			dist.dispose();
		});

		it("can get/set the options", () => {
			const dist = new Distortion();
			dist.set({
				oversample: "4x",
			});
			expect(dist.get().oversample).to.equal("4x");
			dist.dispose();
		});
	});
});
