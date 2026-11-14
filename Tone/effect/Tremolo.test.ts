import { expect } from "chai";

import { BasicTests } from "../../test/helper/Basic.js";
import { CompareToFile } from "../../test/helper/CompareToFile.js";
import { EffectTests } from "../../test/helper/EffectTests.js";
import { Oscillator } from "../source/index.js";
import { Tremolo } from "./Tremolo.js";

describe("Tremolo", () => {
	BasicTests(Tremolo);
	EffectTests(Tremolo);

	it("matches a file", () => {
		return CompareToFile(
			() => {
				const tremolo = new Tremolo().toDestination().start(0.2);
				const osc = new Oscillator().connect(tremolo).start();
			},
			"tremolo.wav",
			0.05
		);
	});

	context("API", () => {
		it("can pass in options in the constructor", () => {
			const tremolo = new Tremolo({
				depth: 0.2,
				type: "sawtooth",
				spread: 160,
			});
			expect(tremolo.depth.value).to.be.closeTo(0.2, 0.001);
			expect(tremolo.type).to.equal("sawtooth");
			expect(tremolo.spread).to.equal(160);
			tremolo.dispose();
		});

		it("can be started and stopped", () => {
			const tremolo = new Tremolo();
			tremolo.start().stop("+0.2");
			tremolo.dispose();
		});

		it("can get/set the options", () => {
			const tremolo = new Tremolo();
			tremolo.set({
				frequency: 2.4,
				type: "triangle",
			});
			expect(tremolo.get().frequency).to.be.closeTo(2.4, 0.01);
			expect(tremolo.get().type).to.equal("triangle");
			tremolo.dispose();
		});

		it("can set the frequency and depth", () => {
			const tremolo = new Tremolo();
			tremolo.depth.value = 0.4;
			tremolo.frequency.value = 0.4;
			expect(tremolo.depth.value).to.be.closeTo(0.4, 0.01);
			expect(tremolo.frequency.value).to.be.closeTo(0.4, 0.01);
			tremolo.dispose();
		});
	});
});
