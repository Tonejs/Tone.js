import { expect } from "chai";
import { BasicTests } from "../../../test/helper/Basic.js";
import { CompareToFile } from "../../../test/helper/CompareToFile.js";
import { atTime, Offline, whenBetween } from "../../../test/helper/Offline.js";
import { SourceTests } from "../../../test/helper/SourceTests.js";
import { ToneAudioBuffer } from "../../core/context/ToneAudioBuffer.js";
import { getContext } from "../../core/Global.js";
import { Player } from "./Player.js";

describe("Player", () => {
	const buffer = new ToneAudioBuffer();

	beforeEach(() => {
		return buffer.load("./test/audio/sine.wav");
	});

	// run the common tests
	BasicTests(Player, buffer);
	SourceTests(Player, buffer);

	it("matches a file", () => {
		return CompareToFile(
			() => {
				const player = new Player(buffer).toDestination();
				player.start(0.1).stop(0.2);
				player.playbackRate = 2;
			},
			"player.wav",
			0.005
		);
	});

	context("Reverse", () => {
		it("can be played in reverse", async () => {
			const shorterBuffer = buffer.slice(0, buffer.duration / 2);
			const audioBuffer = (
				shorterBuffer.get() as AudioBuffer
			).getChannelData(0);
			const lastSample = audioBuffer[audioBuffer.length - 1];
			expect(lastSample).to.not.equal(0);
			const buff = await Offline(() => {
				const player = new Player({
					reverse: true,
					url: shorterBuffer.get(),
				}).toDestination();
				player.start(0);
			});
			const firstSample = buff.toArray()[0][0];
			expect(firstSample).to.equal(lastSample);
		});
	});

	context("Looping", () => {
		beforeEach(() => {
			return buffer.load("./test/audio/short_sine.wav");
		});

		it("loops the audio", async () => {
			const buff = await Offline(() => {
				const player = new Player(buffer);
				player.loop = true;
				player.toDestination();
				player.start(0);
			}, buffer.duration * 1.5);
			expect(buff.getRmsAtTime(0)).to.be.above(0);
			expect(buff.getRmsAtTime(buffer.duration * 0.5)).to.be.above(0);
			expect(buff.getRmsAtTime(buffer.duration)).to.be.above(0);
			expect(buff.getRmsAtTime(buffer.duration * 1.2)).to.be.above(0);
		});

		it("loops the audio when loop is set after start", async () => {
			const buff = await Offline(() => {
				const player = new Player(buffer);
				player.toDestination();
				player.start(0);
				player.loop = true;
			}, buffer.duration * 1.5);
			expect(buff.getRmsAtTime(0)).to.be.above(0);
			expect(buff.getRmsAtTime(buffer.duration * 0.5)).to.be.above(0);
			expect(buff.getRmsAtTime(buffer.duration)).to.be.above(0);
			expect(buff.getRmsAtTime(buffer.duration * 1.2)).to.be.above(0);
		});
	});

	context("PlaybackRate", () => {
		it("reports itself as completed after the stop time when playbackRate = 1", async () => {
			await Offline(() => {
				const player = new Player(buffer);
				player.start(0);
				return atTime(buffer.duration + 0.1, () => {
					expect(player.state).to.equal("stopped");
				});
			}, buffer.duration * 1.1);
		});
	});

	context("Start Scheduling", () => {
		it("can be start with an offset", async () => {
			const testSample =
				buffer.toArray(0)[Math.floor(0.1 * getContext().sampleRate)];
			const buff = await Offline(() => {
				const player = new Player(buffer.get());
				player.toDestination();
				player.start(0, 0.1);
			});
			expect(buff.toArray()[0][0]).to.equal(testSample);
		});

		it("is stopped and restarted when start is called twice", async () => {
			const output = await Offline(() => {
				// make a ramp between 0-1
				const ramp = new Float32Array(
					Math.floor(getContext().sampleRate * 0.3)
				);
				for (let i = 0; i < ramp.length; i++) {
					ramp[i] = i / (ramp.length - 1);
				}
				const buff = new ToneAudioBuffer().fromArray(ramp);
				const player = new Player(buff).toDestination();
				player.start(0);
				player.start(0.1);
			}, 0.31);
			expect(output.max()).to.be.lessThan(1);
		});

		it("only seeks if player is started", async () => {
			const buff = await Offline(() => {
				const player = new Player(buffer).toDestination();
				player.seek(0.2, 0.01);
			}, 0.05);
			expect(buff.isSilent()).to.be.true;
		});

		it("can seek to a position at the given time", async () => {
			const output = await Offline(() => {
				const ramp = new Float32Array(
					Math.floor(getContext().sampleRate * 0.3)
				);
				for (let i = 0; i < ramp.length; i++) {
					ramp[i] = (i / ramp.length) * 0.3;
				}
				const buff = new ToneAudioBuffer().fromArray(ramp);
				const player = new Player(buff).toDestination();
				player.start(0);
				player.seek(0.2, 0.1);
			}, 0.3);
			output.forEach((sample, time) => {
				if (time < 0.09) {
					expect(sample).to.be.within(0, 0.1);
				} else if (time > 0.1 && time < 0.19) {
					expect(sample).to.be.within(0.2, 0.3);
				}
			});
		});

		it("can be play for a specific duration", async () => {
			const buff = await Offline(() => {
				const player = new Player(buffer);
				player.toDestination();
				player.start(0).stop(0.1);
				return (time) => {
					whenBetween(time, 0.1, Infinity, () => {
						expect(player.state).to.equal("stopped");
					});
					whenBetween(time, 0, 0.1, () => {
						expect(player.state).to.equal("started");
					});
				};
			}, 0.3);
			buff.forEachBetween(
				(sample) => {
					expect(sample).to.equal(0);
				},
				0.11,
				0.15
			);
		});

		it("stops playing if invoked with 'stop' at a sooner time", async () => {
			const buff = await Offline(() => {
				const player = new Player(buffer);
				player.toDestination();
				player.start(0).stop(0.1).stop(0.05);
			}, 0.3);
			expect(buff.getTimeOfLastSound()).to.be.closeTo(0.05, 0.02);
		});

		it("stops playing if at the last scheduled 'stop' time", async () => {
			const buff = await Offline(() => {
				const player = new Player(buffer);
				player.toDestination();
				player
					.start(0, 0, 0.05)
					.start(0.1, 0, 0.05)
					.start(0.2, 0, 0.05);
				player.stop(0.1);
			}, 0.3);
			expect(buff.getTimeOfLastSound()).to.be.closeTo(0.1, 0.02);
		});

		it("can retrigger multiple sources which all stop at the stop time", async () => {
			const buff = await Offline(() => {
				const player = new Player(buffer);
				player.toDestination();
				player.loop = true;
				player.start(0).start(0.1).start(0.2).stop(0.25);
			}, 0.4);
			expect(buff.getTimeOfLastSound()).to.be.closeTo(0.25, 0.02);
		});

		it("can be play for a specific duration passed in the 'start' method", async () => {
			const buff = await Offline(() => {
				const player = new Player(buffer);
				player.toDestination();
				player.start(0, 0, 0.1);
				return (time) => {
					whenBetween(time, 0.1, Infinity, () => {
						expect(player.state).to.equal("stopped");
					});
					whenBetween(time, 0, 0.1, () => {
						expect(player.state).to.equal("started");
					});
				};
			}, 0.3);
			expect(buff.getTimeOfLastSound()).to.be.closeTo(0.1, 0.02);
		});

		it("reports itself as stopped after a single iterations of the buffer", async () => {
			await Offline(() => {
				const player = new Player(buffer).toDestination();
				player.start();

				return (time) => {
					whenBetween(time, buffer.duration, Infinity, () => {
						expect(player.state).to.equal("stopped");
					});
					whenBetween(time, 0, buffer.duration, () => {
						expect(player.state).to.equal("started");
					});
				};
			}, buffer.duration * 1.1);
		});

		it("plays synced to the Transport", async () => {
			const buff = await Offline(({ transport }) => {
				const player = new Player(buffer)
					.sync()
					.start(0)
					.toDestination();
				transport.start(0);
			}, 0.05);
			expect(buff.isSilent()).to.be.false;
		});

		it("does not play twice when the offset is very small", async () => {
			// addresses #999 and #944
			await CompareToFile(
				() => {
					const player = new Player(buffer).toDestination();
					player.sync().start(0);
					getContext().transport.bpm.value = 125;
					getContext().transport.setLoopPoints(0, "1:0:0");
					getContext().transport.loop = true;
					getContext().transport.start(0);
				},
				"playerSyncLoop.wav",
				0.01
			);
		});

		it("offsets correctly when started by the Transport", async () => {
			const testSample =
				buffer.toArray(0)[
					Math.floor(0.13125 * getContext().sampleRate)
				];
			const buff = await Offline(({ transport }) => {
				const player = new Player(buffer)
					.sync()
					.start(0, 0.1)
					.toDestination();
				transport.start(0, 0.03125);
			}, 0.05);
			expect(buff.toArray()[0][0]).to.equal(testSample);
		});

		it("starts at the correct position when Transport is offset and playbackRate is not 1", async () => {
			const output = await Offline(({ transport }) => {
				// make a ramp between 0-1
				const ramp = new Float32Array(
					Math.floor(getContext().sampleRate * 0.3)
				);
				for (let i = 0; i < ramp.length; i++) {
					ramp[i] = i / ramp.length;
				}
				const buff = ToneAudioBuffer.fromArray(ramp);
				const player = new Player(buff).toDestination();
				player.playbackRate = 0.5;
				player.sync().start(0);
				// start halfway through
				transport.start(0, 0.15);
			}, 0.05);
			expect(output.getValueAtTime(0)).to.be.closeTo(0.5, 0.05);
		});

		it("starts with an offset when synced and started after Transport is running", async () => {
			const output = await Offline(({ transport }) => {
				const ramp = new Float32Array(
					Math.floor(getContext().sampleRate * 0.3)
				);
				for (let i = 0; i < ramp.length; i++) {
					ramp[i] = (i / ramp.length) * 0.3;
				}
				const buff = new ToneAudioBuffer().fromArray(ramp);
				const player = new Player(buff).toDestination();
				transport.start(0);
				return atTime(0.1, () => {
					player.sync().start(0);
				});
			}, 0.3);
			expect(output.getValueAtTime(0)).to.equal(0);
			expect(output.getValueAtTime(0.05)).to.equal(0);
			expect(output.getValueAtTime(0.11)).to.be.closeTo(0.11, 0.01);
			expect(output.getValueAtTime(0.2)).to.be.closeTo(0.2, 0.01);
		});

		it("can pass in an offset when synced and started after Transport is running", async () => {
			const output = await Offline(({ transport }) => {
				const ramp = new Float32Array(
					Math.floor(getContext().sampleRate * 0.3)
				);
				for (let i = 0; i < ramp.length; i++) {
					ramp[i] = (i / ramp.length) * 0.3;
				}
				const buff = new ToneAudioBuffer().fromArray(ramp);
				const player = new Player(buff).toDestination();
				player.loop = true;
				transport.start(0);
				return atTime(0.1, () => {
					player.sync().start(0, 0.1);
				});
			}, 0.3);
			expect(output.getValueAtTime(0)).to.equal(0);
			expect(output.getValueAtTime(0.05)).to.equal(0);
			expect(output.getValueAtTime(0.11)).to.be.closeTo(0.21, 0.01);
			expect(output.getValueAtTime(0.15)).to.be.closeTo(0.25, 0.01);
			expect(output.getValueAtTime(0.2)).to.be.closeTo(0.0, 0.01);
			expect(output.getValueAtTime(0.25)).to.be.closeTo(0.05, 0.01);
		});

		it("fades in and out correctly", async () => {
			let duration = 0.5;
			const buff = await Offline(() => {
				const onesArray = new Float32Array(
					getContext().sampleRate * duration
				);
				onesArray.forEach((sample, index) => {
					onesArray[index] = 1;
				});
				const onesBuffer = ToneAudioBuffer.fromArray(onesArray);
				const player = new Player({
					url: onesBuffer,
					fadeOut: 0.1,
					fadeIn: 0.1,
				}).toDestination();
				player.start(0);
			}, 0.6);
			expect(buff.getRmsAtTime(0)).to.be.closeTo(0, 0.1);
			expect(buff.getRmsAtTime(0.05)).to.be.closeTo(0.5, 0.1);
			expect(buff.getRmsAtTime(0.1)).to.be.closeTo(1, 0.1);
			duration -= 0.1;
			expect(buff.getRmsAtTime(duration)).to.be.closeTo(1, 0.1);
			expect(buff.getRmsAtTime(duration + 0.05)).to.be.closeTo(0.5, 0.1);
			expect(buff.getRmsAtTime(duration + 0.1)).to.be.closeTo(0, 0.1);
		});

		it("stops only last activeSource when restarting at intervals < latencyHint", (done) => {
			const originalLookAhead = getContext().lookAhead;
			getContext().lookAhead = 0.3;
			const player = new Player({
				onload(): void {
					player.start(undefined, undefined, 1);
					setTimeout(
						() => player.restart(undefined, undefined, 1),
						50
					);
					setTimeout(
						() => player.restart(undefined, undefined, 1),
						100
					);
					setTimeout(
						() => player.restart(undefined, undefined, 1),
						150
					);
					setTimeout(() => {
						player.restart(undefined, undefined, 1);
						const checkStopTimes = new Set();
						// @ts-ignore
						player._activeSources.forEach((source) => {
							// @ts-ignore
							checkStopTimes.add(source._stopTime);
						});
						getContext().lookAhead = originalLookAhead;
						// ensure each source has a different stopTime
						expect(checkStopTimes.size).to.equal(
							// @ts-ignore
							player._activeSources.size
						);
						done();
					}, 250);
				},
				url: "./test/audio/sine.wav",
			});
		});
	});
});
