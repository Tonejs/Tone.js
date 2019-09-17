import { expect } from "chai";
import { BasicTests } from "test/helper/Basic";
import { CompareToFile } from "test/helper/CompareToFile";
import { InstrumentTest } from "test/helper/InstrumentTests";
import { MonophonicTest } from "test/helper/MonophonicTests";
import { Offline } from "test/helper/Offline";
import { Frequency } from "Tone/core/type/Frequency";
import { Synth } from "./Synth";

describe("Synth", () => {

	BasicTests(Synth);
	InstrumentTest(Synth, "C4");
	MonophonicTest(Synth, "C4");

	it("matches a file basic", () => {
		return CompareToFile(() => {
			const synth = new Synth().toDestination();
			synth.triggerAttackRelease("C4", 0.1, 0.05);
		}, "synth_basic.wav", 0.3);
	});

	it("matches a file melody", () => {
		return CompareToFile(() => {
			const synth = new Synth().toDestination();
			synth.triggerAttack("C4", 0);
			synth.triggerAttack("E4", 0.1, 0.5);
			synth.triggerAttackRelease("G4", 0.5, 0.3);
			synth.triggerAttackRelease("B4", 0.5, 0.5, 0.2);
		}, "synth_melody.wav", 0.3);
	});

	context("API", () => {

		it("can get and set oscillator attributes", () => {
			const simple = new Synth();
			simple.oscillator.type = "triangle";
			expect(simple.oscillator.type).to.equal("triangle");
			simple.dispose();
		});

		it("can get and set envelope attributes", () => {
			const simple = new Synth();
			simple.envelope.attack = 0.24;
			expect(simple.envelope.attack).to.equal(0.24);
			simple.dispose();
		});

		it("can be constructed with an options object", () => {
			const simple = new Synth({
				envelope: {
					sustain: 0.3,
				},
				oscillator: {
					type: "sine",
				},
				volume: -5,
			});
			expect(simple.envelope.sustain).to.equal(0.3);
			expect(simple.oscillator.type).to.equal("sine");
			expect(simple.volume.value).to.be.closeTo(-5, 0.1);
			simple.dispose();
		});

		it("can get/set attributes", () => {
			const simple = new Synth();
			simple.set({
				envelope: {
					decay: 0.24,
				},
			});
			expect(simple.get().envelope.decay).to.equal(0.24);
			simple.dispose();
		});

		it("can get does not include omited oscillator attributes", () => {
			const simple = new Synth();
			expect(simple.get().oscillator).to.not.have.key("frequency");
			expect(simple.get().oscillator).to.not.have.key("detune");
			expect(Object.keys(simple.get().oscillator)).to.include("type");
			simple.dispose();
		});

		it("can be trigged with a Tone.Frequency", () => {
			return Offline(() => {
				const synth = new Synth().toDestination();
				synth.triggerAttack(Frequency("C4"), 0);
			}).then((buffer) => {
				expect(buffer.isSilent()).to.be.false;
			});
		});

		it("is silent after triggerAttack if sustain is 0", () => {
			return Offline(() => {
				const synth = new Synth({
					envelope: {
						attack: 0.1,
						decay: 0.1,
						sustain: 0,
					},
				}).toDestination();
				synth.triggerAttack("C4", 0);
			}, 0.5).then((buffer) => {
				expect(buffer.getTimeOfLastSound()).to.be.closeTo(0.2, 0.01);
			});
		});
	});

	context("Portamento", () => {
		it("can play notes with a portamento", () => {
			return Offline(() => {
				const synth = new Synth({
					portamento: 0.1,
				});
				expect(synth.portamento).to.equal(0.1);
				synth.frequency.toDestination();
				synth.triggerAttack(440, 0);
				synth.triggerAttack(880, 0.1);
			}, 0.2).then((buffer) => {
				buffer.forEach((val, time) => {
					if (time < 0.1) {
						expect(val).to.be.closeTo(440, 1);
					} else if (time < 0.2) {
						expect(val).to.within(440, 880);
					} else {
						expect(val).to.be.closeTo(880, 1);
					}
				});
			});
		});
	});
});
