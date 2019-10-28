import { BasicTests } from "test/helper/Basic";
import { MonoSynth } from "./MonoSynth";
import { InstrumentTest } from "test/helper/InstrumentTests";
import { CompareToFile } from "test/helper/CompareToFile";
import { expect } from "chai";
import { Offline } from "test/helper/Offline";
import { CHROME_AUDIO_RENDERING } from "test/helper/Supports";

describe("MonoSynth", () => {

	BasicTests(MonoSynth);
	InstrumentTest(MonoSynth, "C4");

	if (CHROME_AUDIO_RENDERING) {
		it("matches a file", () => {
			return CompareToFile(() => {
				let synth = new MonoSynth().toDestination();
				synth.triggerAttackRelease("C4", 0.1, 0.05);
			}, "monoSynth.wav", 1.75);
		});
	}

	context("API", () => {

		it("can get and set oscillator attributes", () => {
			let monoSynth = new MonoSynth();
			monoSynth.oscillator.type = "triangle";
			expect(monoSynth.oscillator.type).to.equal("triangle");
			monoSynth.dispose();
		});

		it("can get and set envelope attributes", () => {
			let monoSynth = new MonoSynth();
			monoSynth.envelope.attack = 0.24;
			expect(monoSynth.envelope.attack).to.equal(0.24);
			monoSynth.dispose();
		});

		it("can get and set filter attributes", () => {
			let monoSynth = new MonoSynth();
			monoSynth.filter.Q.value = 0.4;
			expect(monoSynth.filter.Q.value).to.be.closeTo(0.4, 0.001);
			monoSynth.dispose();
		});

		it("can get and set filterEnvelope attributes", () => {
			let monoSynth = new MonoSynth();
			monoSynth.filterEnvelope.baseFrequency = 400;
			expect(monoSynth.filterEnvelope.baseFrequency).to.equal(400);
			monoSynth.dispose();
		});

		it("can be constructed with an options object", () => {
			let monoSynth = new MonoSynth({
				envelope: {
					sustain: 0.3
				}
			});
			expect(monoSynth.envelope.sustain).to.equal(0.3);
			monoSynth.dispose();
		});

		it("can get/set attributes", () => {
			let monoSynth = new MonoSynth();
			monoSynth.set({
				envelope: {
					decay: 0.24
				}
			});
			expect(monoSynth.get().envelope.decay).to.equal(0.24);
			monoSynth.dispose();
		});

		it("is silent after triggerAttack if sustain is 0", async () => {
			return await Offline(() => {
				let synth = new MonoSynth({
					envelope: {
						attack: 0.1,
						decay: 0.1,
						sustain: 0,
					}
				}).toDestination();
				synth.triggerAttack("C4", 0);
			}, 0.5).then((buffer) => {
				expect(buffer.getTimeOfLastSound()).to.be.closeTo(0.2, 0.01);
			});
		});

	});
});
