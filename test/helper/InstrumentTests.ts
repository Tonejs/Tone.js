import { expect } from "chai";
import { Instrument } from "Tone/instrument/Instrument";
import { connectTo } from "./Connect";
import { Offline } from "./Offline";
import { OutputAudio } from "./OutputAudio";
import { Monophonic } from "Tone/instrument/Monophonic";

export function InstrumentTest(Constr, note, constrArg?, optionsIndex?): void {

	context("Instrument Tests", () => {

		it("extends Tone.Instrument", () => {
			const instance = new Constr(constrArg);
			expect(instance).to.be.an.instanceof(Instrument);
			instance.dispose();
		});

		it("can connect the output", () => {
			const instance = new Constr(constrArg);
			instance.connect(connectTo());
			instance.dispose();
		});

		it("can set the volume", () => {
			let instance;
			if (!optionsIndex) {
				instance = new Constr({
					volume: -10,
				});
			} else if (optionsIndex === 1) {
				instance = new Constr(constrArg, {
					volume: -10,
				});
			}
			expect(instance.volume.value).to.be.closeTo(-10, 0.1);
			instance.dispose();
		});

		it("makes a sound", () => {
			return OutputAudio(() => {
				const instance = new Constr(constrArg);
				instance.toDestination();
				instance.triggerAttack(note);
			});
		});

		it("is silent before being triggered", () => {
			return Offline(() => {
				const instance = new Constr(constrArg);
				instance.toDestination();
			}).then((buffer) => {
				expect(buffer.isSilent()).to.be.true;
			});
		});

		if (Constr.prototype.triggerRelease) {

			it("can trigger release after attack", () => {
				return Offline(() => {
					const instance = new Constr(constrArg);
					instance.toDestination();
					if (note) {
						instance.triggerAttack(note, 0.05);
					} else {
						instance.triggerAttack(0.05);
					}
					instance.triggerRelease(0.1);
				}, 1).then((buffer) => {
					expect(buffer.getTimeOfFirstSound()).to.be.within(0.05, 0.1);
				});
			});

			it("can trigger another attack before the release has ended", () => {
				// compute the end time
				return Offline(() => {
					const instance = new Constr(constrArg);
					instance.toDestination();
					if (note) {
						instance.triggerAttack(note, 0.05);
					} else {
						instance.triggerAttack(0.05);
					}
					instance.triggerRelease(0.1);
				}, 1).then((buffer) => {
					const bufferDuration = buffer.getTimeOfLastSound();
					const secondTrigger = 0.15;
					return Offline(() => {
						const instance = new Constr(constrArg);
						instance.toDestination();
						if (note) {
							instance.triggerAttack(note, 0.05);
						} else {
							instance.triggerAttack(0.05);
						}
						instance.triggerRelease(0.1);
						// star the note again before the last one has finished
						if (note) {
							instance.triggerAttack(note, secondTrigger);
						} else {
							instance.triggerAttack(secondTrigger);
						}
					}, bufferDuration + secondTrigger * 2).then((resultingBuffer) => {
						expect(resultingBuffer.getTimeOfLastSound()).to.be.gt(bufferDuration);
					});
				});
			});

			it("can combine triggerAttack and triggerRelease", () => {
				return Offline(() => {
					const instance = new Constr(constrArg);
					instance.toDestination();
					if (note) {
						instance.triggerAttackRelease(note, 0.1, 0.05);
					} else {
						instance.triggerAttackRelease(0.1, 0.05);
					}
				}, 0.2).then((buffer) => {
					expect(buffer.getTimeOfFirstSound()).to.be.within(0.05, 0.1);
				});
			});
		}

		it("be scheduled to start in the future", () => {
			return Offline(() => {
				const instance = new Constr(constrArg);
				instance.toDestination();
				if (note) {
					instance.triggerAttack(note, 0.1);
				} else {
					instance.triggerAttack(0.1);
				}
			}, 0.2).then((buffer) => {
				expect(buffer.getTimeOfFirstSound()).to.be.within(0.1, 0.15);
			});
		});

		it("can sync triggerAttack to the Transport", () => {
			return Offline(({ transport }) => {
				const instance = new Constr(constrArg);
				instance.toDestination();
				instance.sync();
				if (note) {
					instance.triggerAttack(note, 0.1);
				} else {
					instance.triggerAttack(0.1);
				}
				transport.start(0.1);
			}, 0.3).then((buffer) => {
				expect(buffer.getTimeOfFirstSound()).to.be.within(0.19, 0.25);
			});
		});

		it("can unsync triggerAttack to the Transport", () => {
			return Offline(({ transport }) => {
				const instance = new Constr(constrArg);
				instance.toDestination();
				instance.sync();
				if (note) {
					instance.triggerAttack(note, 0.1);
				} else {
					instance.triggerAttack(0.1);
				}
				instance.unsync();
				transport.start(0.1);
			}, 0.3).then((buffer) => {
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("calling sync and unsync multiple times has no effect", () => {
			return Offline(({ transport }) => {
				const instance = new Constr(constrArg);
				instance.toDestination();
				instance.sync();
				instance.sync();
				if (note) {
					instance.triggerAttack(note, 0.1);
				} else {
					instance.triggerAttack(0.1);
				}
				instance.unsync();
				instance.unsync();
				transport.start(0.1);
			}, 0.3).then((buffer) => {
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("can sync triggerAttackRelease to the Transport", () => {
			return Offline(({ transport }) => {
				const instance = new Constr(constrArg);
				instance.toDestination();
				instance.sync();
				if (note) {
					instance.triggerAttackRelease(note, 0.25, 0.1);
				} else {
					instance.triggerAttackRelease(0.25, 0.1);
				}
				transport.start(0.1);
			}, 1).then((buffer) => {
				expect(buffer.getTimeOfFirstSound()).to.be.within(0.19, 0.25);
				// test a sample enough in the future for the decay to die down
				expect(buffer.getRmsAtTime(0.9)).to.be.closeTo(0, 0.1);
			});
		});

		it("invokes onsilence", (done) => {
			Offline(() => {
				const instance = new Constr(constrArg);
				if (instance instanceof Monophonic) {
					instance.triggerAttackRelease(note, 0.1, 0);
					instance.onsilence = (voice) => {
						expect(voice).to.equal(instance);
						done();
					};
				} else {
					done();
				}
			}, 3);
		});
	});
}
