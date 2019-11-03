import { BasicTests } from "test/helper/Basic";
import { InstrumentTest } from "test/helper/InstrumentTests";
import { DuoSynth } from "./DuoSynth";
import { CHROME_AUDIO_RENDERING } from "test/helper/Supports";
import { CompareToFile } from "test/helper/CompareToFile";
import { expect } from "chai";
import { MonophonicTest } from "test/helper/MonophonicTests";

describe("DuoSynth", () => {

	BasicTests(DuoSynth);
	MonophonicTest(DuoSynth, "C4");
	InstrumentTest(DuoSynth, "C4", {
		voice0: {
			oscillator: {
				type: "square"
			},
			envelope: {
				decay: 0.1,
				sustain: 0.5,
				release: 0.2
			}
		},
		voice1: {
			oscillator: {
				type: "square"
			},
			envelope: {
				decay: 0.1,
				sustain: 0.5,
				release: 0.2
			}
		}
	});

	if (CHROME_AUDIO_RENDERING) {
		it("matches a file", () => {
			return CompareToFile(() => {
				let synth = new DuoSynth().toDestination();
				synth.triggerAttackRelease("C5", 0.1, 0.1);
			}, "duoSynth.wav", 0.01);
		});
	}

	context("API", () => {

		it("can get and set voice0 attributes", () => {
			let duoSynth = new DuoSynth();
			duoSynth.voice0.oscillator.type = "triangle";
			expect(duoSynth.voice0.oscillator.type).to.equal("triangle");
			duoSynth.dispose();
		});

		it("can get and set voice1 attributes", () => {
			let duoSynth = new DuoSynth();
			duoSynth.voice1.envelope.attack = 0.24;
			expect(duoSynth.voice1.envelope.attack).to.equal(0.24);
			duoSynth.dispose();
		});

		it("can get and set harmonicity", () => {
			let duoSynth = new DuoSynth();
			duoSynth.harmonicity.value = 2;
			expect(duoSynth.harmonicity.value).to.equal(2);
			duoSynth.dispose();
		});

		it("can get and set vibratoRate", () => {
			let duoSynth = new DuoSynth();
			duoSynth.vibratoRate.value = 2;
			expect(duoSynth.vibratoRate.value).to.equal(2);
			duoSynth.dispose();
		});

		it("can be constructed with an options object", () => {
			let duoSynth = new DuoSynth({
				voice0: {
					filter: {
						rolloff: -24
					}
				}
			});
			expect(duoSynth.voice0.filter.rolloff).to.equal(-24);
			duoSynth.dispose();
		});

		it("can get/set attributes", () => {
			let duoSynth = new DuoSynth();
			duoSynth.set({
				harmonicity: 1.5
			});
			expect(duoSynth.get().harmonicity).to.equal(1.5);
			duoSynth.dispose();
		});

	});
});

