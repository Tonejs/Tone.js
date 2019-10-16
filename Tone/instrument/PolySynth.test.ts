import { expect } from "chai";
import { BasicTests, warns } from "test/helper/Basic";
import { CompareToFile } from "test/helper/CompareToFile";
import { atTime, Offline } from "test/helper/Offline";
import { OutputAudio } from "test/helper/OutputAudio";
import { PolySynth } from "./PolySynth";
import { Synth } from "./Synth";
import { FMSynth } from "./FMSynth";
import { PluckSynth } from "./PluckSynth";
import { MetalSynth } from "./MetalSynth";
import { MembraneSynth } from "./MembraneSynth";

describe("PolySynth", () => {

	BasicTests(PolySynth);

	it("matches a file", () => {
		return CompareToFile(() => {
			const synth = new PolySynth().toDestination();
			synth.triggerAttackRelease("C4", 0.2, 0);
			synth.triggerAttackRelease("C4", 0.1, 0.1);
			synth.triggerAttackRelease("E4", 0.1, 0.2);
			synth.triggerAttackRelease("E4", 0.1, 0.3);
			synth.triggerAttackRelease("G4", 0.1, 0.4);
			synth.triggerAttackRelease("B4", 0.1, 0.4);
			synth.triggerAttackRelease("C4", 0.2, 0.5);
		}, "polySynth.wav", 0.6);
	});

	it("matches another file", () => {
		return CompareToFile(() => {
			const synth = new PolySynth().toDestination();
			synth.triggerAttackRelease(["C4", "E4", "G4", "B4"], 0.2, 0);
			synth.triggerAttackRelease(["C4", "E4", "G4", "B4"], 0.2, 0.3);
		}, "polySynth2.wav", 0.6);
	});

	it("matches a file and chooses the right voice", () => {
		return CompareToFile(() => {
			const synth = new PolySynth().toDestination();
			synth.triggerAttackRelease(["C4", "E4"], 1, 0);
			synth.triggerAttackRelease("G4", 0.1, 0.2);
			synth.triggerAttackRelease("B4", 0.1, 0.4);
			synth.triggerAttackRelease("G4", 0.1, 0.6);
		}, "polySynth3.wav", 0.5);
	});

	it("can be constructed with monophonic synths", () => {
		expect(() => {
			const polySynth = new PolySynth(Synth);
			polySynth.dispose();
		}).to.not.throw(Error);
		expect(() => {
			const polySynth = new PolySynth(FMSynth);
			polySynth.dispose();
		}).to.not.throw(Error);
		expect(() => {
			const polySynth = new PolySynth(MetalSynth);
			polySynth.dispose();
		}).to.not.throw(Error);
		expect(() => {
			const polySynth = new PolySynth(MembraneSynth);
			polySynth.dispose();
		}).to.not.throw(Error);
	});

	context("Playing Notes", () => {

		it("triggerAttackRelease can take an array of durations", () => {
			return OutputAudio(() => {
				const polySynth = new PolySynth();
				polySynth.toDestination();
				polySynth.triggerAttackRelease(["C4", "D4"], [0.1, 0.2]);
			});
		});

		it("triggerAttack and triggerRelease can be invoked without arrays", () => {
			return Offline(() => {
				const polySynth = new PolySynth();
				polySynth.set({ envelope: { release: 0.1 } });
				polySynth.toDestination();
				polySynth.triggerAttack("C4", 0);
				polySynth.triggerRelease("C4", 0.1);
			}, 0.3).then(buffer => {
				expect(buffer.getTimeOfFirstSound()).to.be.closeTo(0, 0.01);
				expect(buffer.getValueAtTime(0.2)).to.be.closeTo(0, 0.01);
			});
		});

		it("can stop all of the currently playing sounds", () => {
			return Offline(() => {
				const polySynth = new PolySynth();
				polySynth.set({ envelope: { release: 0.1 } });
				polySynth.toDestination();
				polySynth.triggerAttack(["C4", "E4", "G4", "B4"], 0);
				return atTime(0.1, () => {
					polySynth.releaseAll();
				});
			}, 0.3).then((buffer) => {
				expect(buffer.getTimeOfFirstSound()).to.be.closeTo(0, 0.01);
				expect(buffer.getTimeOfLastSound()).to.be.closeTo(0.2, 0.01);
			});
		});

		it("is silent before being triggered", () => {
			return Offline(() => {
				const polySynth = new PolySynth();
				polySynth.toDestination();
			}).then((buffer) => {
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("can be scheduled to start in the future", () => {
			return Offline(() => {
				const polySynth = new PolySynth();
				polySynth.toDestination();
				polySynth.triggerAttack("C4", 0.1);
			}, 0.3).then((buffer) => {
				expect(buffer.getTimeOfFirstSound()).to.be.closeTo(0.1, 0.01);
			});
		});

		it("can be synced to the transport", () => {
			return Offline(({ transport }) => {
				const polySynth = new PolySynth(Synth, {
					envelope: {
						release: 0.1,
					},
				}).sync();
				polySynth.toDestination();
				polySynth.triggerAttackRelease("C4", 0.1, 0.1);
				polySynth.triggerAttackRelease("E4", 0.1, 0.3);
				transport.start(0.1);
			}, 0.8).then((buffer) => {
				expect(buffer.getTimeOfFirstSound()).to.be.closeTo(0.2, 0.01);
				expect(buffer.getTimeOfLastSound()).to.be.closeTo(0.6, 0.01);
			});
		});

		it("disposes voices when they are no longer used", () => {
			return Offline(() => {
				const polySynth = new PolySynth(Synth, {
					envelope: {
						release: 0.1,
					},
				});
				polySynth.toDestination();
				polySynth.triggerAttackRelease(["C4", "E4", "G4", "B4", "D5"], 0.1, 0);
				return [
					atTime(0, () => {
						expect(polySynth.activeVoices).to.equal(5);
					}),
					atTime(0.3, () => {
						expect(polySynth.activeVoices).to.equal(0);
					}),
				];
			}, 10);
		});

		it("warns when too much polyphony is attempted and notes are dropped", () => {
			warns(() => {
				return Offline(() => {
					const polySynth = new PolySynth({
						maxPolyphony: 2,
					});
					polySynth.toDestination();
					polySynth.triggerAttack(["C4", "D4", "G4"], 0.1);
				}, 0.3);
			});
		});

		it("reports the active notes", () => {
			return Offline(() => {
				const polySynth = new PolySynth();
				polySynth.set({ envelope: { release: 0.1 } });
				polySynth.toDestination();
				polySynth.triggerAttackRelease("C4", 0.1, 0.1);
				polySynth.triggerAttackRelease("D4", 0.1, 0.2);
				polySynth.triggerAttackRelease("C4", 0.1, 0.5);
				polySynth.triggerAttackRelease("C4", 0.1, 0.6);
				return [
					atTime(0, () => {
						expect(polySynth.activeVoices).to.equal(0);
					}),
					atTime(0.1, () => {
						expect(polySynth.activeVoices).to.equal(1);
					}),
					atTime(0.2, () => {
						expect(polySynth.activeVoices).to.equal(2);
					}),
					atTime(0.3, () => {
						expect(polySynth.activeVoices).to.equal(1);
					}),
					atTime(0.4, () => {
						expect(polySynth.activeVoices).to.equal(0);
					}),
					atTime(0.5, () => {
						expect(polySynth.activeVoices).to.equal(1);
					}),
					atTime(0.6, () => {
						expect(polySynth.activeVoices).to.equal(2);
					}),
					atTime(0.7, () => {
						expect(polySynth.activeVoices).to.equal(1);
					}),
					atTime(0.8, () => {
						expect(polySynth.activeVoices).to.equal(0);
					}),
				];
			}, 1);
		});

		it("can trigger another attack before the release has ended", () => {
			// compute the end time
			return Offline(() => {
				const synth = new PolySynth(Synth, {
					envelope: {
						release: 0.1,
					},
				});
				synth.toDestination();
				synth.triggerAttack("C4", 0.05);
				synth.triggerRelease("C4", 0.1);
				synth.triggerAttack("C4", 0.15);
				synth.triggerRelease("C4", 0.2);
			}, 1).then((buffer) => {
				expect(buffer.getTimeOfLastSound()).to.be.closeTo(0.3, 0.01);
			});
		});

		it("can trigger another attack right after the release has ended", () => {
			// compute the end time
			return Offline(() => {
				const synth = new PolySynth(Synth, {
					envelope: {
						release: 0.1,
					},
				});
				synth.toDestination();
				synth.triggerAttack("C4", 0.05);
				synth.triggerRelease("C4", 0.1);
				synth.triggerAttack("C4", 0.2);
				synth.triggerRelease("C4", 0.3);
				return atTime(0.41, () => {
					expect(synth.activeVoices).to.equal(0);
				});
			}, 1).then((buffer) => {
				expect(buffer.getTimeOfLastSound()).to.be.closeTo(0.4, 0.01);
			});
		});

	});

	context("API", () => {

		it("can be constructed with an options object", () => {
			const polySynth = new PolySynth(Synth, {
				envelope: {
					sustain: 0.3,
				},
			});
			expect(polySynth.get().envelope.sustain).to.equal(0.3);
			polySynth.dispose();
		});

		it("can pass in the volume", () => {
			const polySynth = new PolySynth({
				volume: -12,
			});
			expect(polySynth.volume.value).to.be.closeTo(-12, 0.1);
			polySynth.dispose();
		});

		it("can get/set attributes", () => {
			const polySynth = new PolySynth();
			polySynth.set({
				envelope: { decay: 3 },
			});
			expect(polySynth.get().envelope.decay).to.equal(3);
			polySynth.dispose();
		});
	});
});
