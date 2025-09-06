import { expect } from "chai";

import { Frequency } from "../../Tone/core/type/Units.js";
import { Instrument } from "../../Tone/instrument/Instrument.js";
import { Monophonic } from "../../Tone/instrument/Monophonic.js";
import { connectTo } from "./Connect.js";
import { Offline } from "./Offline.js";
import { OutputAudio } from "./OutputAudio.js";

function wait(time) {
	return new Promise((done) => setTimeout(done, time));
}

export function InstrumentTest(
	Constr,
	note?: Frequency,
	constrArg?: any,
	optionsIndex?: any,
	noPortamento = false
): void {
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

		it("is silent before being triggered", async () => {
			const buffer = await Offline(() => {
				const instance = new Constr(constrArg);
				instance.toDestination();
			});
			expect(buffer.isSilent()).to.be.true;
		});

		if (Constr.prototype.triggerRelease) {
			it("can trigger release after attack", async () => {
				const buffer = await Offline(() => {
					const instance = new Constr(constrArg);
					instance.toDestination();
					if (note) {
						instance.triggerAttack(note, 0.05);
					} else {
						instance.triggerAttack(0.05);
					}
					instance.triggerRelease(0.1);
				}, 1);
				expect(buffer.getTimeOfFirstSound()).to.be.within(0.05, 0.1);
			});

			it("can trigger another attack before the release has ended", async () => {
				// compute the end time
				const buffer = await Offline(() => {
					const instance = new Constr(constrArg);
					instance.toDestination();
					if (note) {
						instance.triggerAttack(note, 0.05);
					} else {
						instance.triggerAttack(0.05);
					}
					instance.triggerRelease(0.1);
				}, 1);
				const bufferDuration = buffer.getTimeOfLastSound();
				const secondTrigger = 0.15;
				const resultingBuffer = await Offline(
					() => {
						const instance_1 = new Constr(constrArg);
						instance_1.toDestination();
						if (note) {
							instance_1.triggerAttack(note, 0.05);
						} else {
							instance_1.triggerAttack(0.05);
						}
						instance_1.triggerRelease(0.1);
						// star the note again before the last one has finished
						if (note) {
							instance_1.triggerAttack(note, secondTrigger);
						} else {
							instance_1.triggerAttack(secondTrigger);
						}
					},
					bufferDuration + secondTrigger * 2
				);
				expect(resultingBuffer.getTimeOfLastSound()).to.be.gt(
					bufferDuration
				);
			});

			it("can combine triggerAttack and triggerRelease", async () => {
				const buffer = await Offline(() => {
					const instance = new Constr(constrArg);
					instance.toDestination();
					if (note) {
						instance.triggerAttackRelease(note, 0.1, 0.05);
					} else {
						instance.triggerAttackRelease(0.1, 0.05);
					}
				}, 0.2);
				expect(buffer.getTimeOfFirstSound()).to.be.within(0.05, 0.1);
			});
		}

		it("be scheduled to start in the future", async () => {
			const buffer = await Offline(() => {
				const instance = new Constr(constrArg);
				instance.toDestination();
				if (note) {
					instance.triggerAttack(note, 0.1);
				} else {
					instance.triggerAttack(0.1);
				}
			}, 0.2);
			expect(buffer.getTimeOfFirstSound()).to.be.within(0.1, 0.15);
		});

		it("can sync triggerAttack to the Transport", async () => {
			const buffer = await Offline(({ transport }) => {
				const instance = new Constr(constrArg);
				instance.toDestination();
				instance.sync();
				if (note) {
					instance.triggerAttack(note, 0.1);
				} else {
					instance.triggerAttack(0.1);
				}
				transport.start(0.1);
			}, 0.3);
			expect(buffer.getTimeOfFirstSound()).to.be.within(0.19, 0.25);
		});

		it("can unsync triggerAttack to the Transport", async () => {
			const buffer = await Offline(({ transport }) => {
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
			}, 0.3);
			expect(buffer.isSilent()).to.be.true;
		});

		it("can unsync and re-sync triggerAttack to the Transport", async () => {
			const buffer = await Offline(async ({ transport }) => {
				const instance = new Constr(constrArg);
				instance.toDestination();

				instance.sync();
				if (note) {
					instance.triggerAttack(note, 0.1);
				} else {
					instance.triggerAttack(0.1);
				}
				transport.start(0.1);
				await wait(100);
				instance.unsync();
				transport.stop();

				instance.sync();
				if (note) {
					instance.triggerAttack(note, 0.1);
				} else {
					instance.triggerAttack(0.1);
				}
				transport.start(0.1);
			}, 1);
			expect(buffer.getTimeOfFirstSound()).to.be.within(0.19, 0.25);
		});

		it("calling sync and unsync multiple times has no effect", async () => {
			const buffer = await Offline(({ transport }) => {
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
			}, 0.3);
			expect(buffer.isSilent()).to.be.true;
		});

		it("can sync triggerAttackRelease to the Transport", async () => {
			const buffer = await Offline(({ transport }) => {
				const instance = new Constr(constrArg);
				instance.toDestination();
				instance.sync();
				if (note) {
					instance.triggerAttackRelease(note, 0.25, 0.1);
				} else {
					instance.triggerAttackRelease(0.25, 0.1);
				}
				transport.start(0.1);
			}, 1);
			expect(buffer.getTimeOfFirstSound()).to.be.within(0.19, 0.25);
			// test a sample enough in the future for the decay to die down
			expect(buffer.getRmsAtTime(0.9)).to.be.closeTo(0, 0.1);
		});

		it("invokes onsilence", (done) => {
			Offline(() => {
				const instance = new Constr(constrArg);
				if (instance instanceof Monophonic) {
					instance.triggerAttackRelease(note!, 0.1, 0);
					instance.onsilence = (voice) => {
						expect(voice).to.equal(instance);
						done();
					};
				} else {
					done();
				}
			}, 3);
		});

		if (!noPortamento) {
			it("can do portamento glide between notes", () => {
				return Offline(() => {
					const instance = new Constr(constrArg);
					if (instance instanceof Monophonic) {
						instance.portamento = 0.5;
						instance.triggerAttackRelease("C4", 0.2, 0);
						expect(instance.getLevelAtTime(0.4)).to.be.greaterThan(
							0
						);
						instance.triggerAttackRelease("C2", 0.2, 0.4);
					}
				}, 0.5);
			});
		}
	});
}
