import { expect } from "chai";
import { connectFrom, connectTo } from "test/helper/Connect";
import { Offline } from "test/helper/Offline";
import { PassAudio } from "test/helper/PassAudio";
import { Merge } from "Tone/component/channel/Merge";
import { Effect } from "Tone/effect/Effect";
import { Signal } from "Tone/signal/Signal";

// tslint:disable-next-line: variable-name
export function EffectTests(Constr, args?, before?): void {

	context("Effect Tests", () => {

		it("extends Tone.Effect", () => {
			const instance = new Constr(args);
			expect(instance).to.be.an.instanceof(Effect);
			instance.dispose();
		});

		it("has an input and output", () => {
			const instance = new Constr(args);
			if (before) {
				before(instance);
			}
			instance.connect(connectTo());
			connectFrom().connect(instance);
			instance.dispose();
		});

		it("can set the dry/wet value", () => {
			const instance = new Constr(args);
			if (before) {
				before(instance);
			}
			instance.wet.value = 0;
			expect(instance.wet.value).to.equal(0);
			instance.wet.value = 0.5;
			expect(instance.wet.value).to.equal(0.5);
			instance.dispose();
		});

		it("can be constructed with an object", () => {
			const instance = new Constr({
				wet : "0.25",
			});
			if (before) {
				before(instance);
			}
			expect(instance.wet.value).to.equal(0.25);
			instance.dispose();
		});

		it("passes audio from input to output", () => {
			return PassAudio((input) => {
				const instance = new Constr(args);
				if (before) {
					before(instance);
				}
				input.connect(instance);
				instance.toDestination();
			});
		});

		// it("passes audio in both channels", () => {
		// 	return PassAudioStereo((input) => {
		// 		const instance = new Constr(args);
		// 		if (before) {
		// 			before(instance);
		// 		}
		// 		input.connect(instance);
		// 		instance.toDestination();
		// 	});
		// });

		it("can pass 100% dry signal", () => {
			return Offline(() => {
				const instance = new Constr(args).toDestination();
				if (before) {
					before(instance);
				}
				const merge = new Merge().connect(instance);
				const signalL = new Signal<number>(-1).connect(merge, 0, 0);
				const signalR = new Signal<number>(1).connect(merge, 0, 1);
				// make the signals ramp
				signalL.linearRampTo(1, 1);
				signalR.linearRampTo(-1, 1);
				instance.wet.value = 0;
			}, 0.5, 2).then((buffer) => {
				buffer.toArray()[0].forEach((sample, index) => {
					const time = index / buffer.sampleRate;
					const leftValue = (time * 2) - 1;
					expect(sample).to.be.closeTo(leftValue, 0.01);
				});
				buffer.toArray()[1].forEach((sample, index) => {
					const time = index / buffer.sampleRate;
					const rightValue = ((1 - time) * 2) - 1;
					expect(sample).to.be.closeTo(rightValue, 0.01);
				});
			});
		});

		it("effects the incoming signal", () => {
			return Offline(() => {
				const instance = new Constr(args).toDestination();
				if (before) {
					before(instance);
				}
				const merge = new Merge().connect(instance);
				const signalL = new Signal<number>(-1).connect(merge, 0, 0);
				const signalR = new Signal<number>(1).connect(merge, 0, 1);
				// make the signals ramp
				signalL.linearRampTo(1, 1);
				signalR.linearRampTo(-1, 1);
				if (instance.start) {
					instance.start();
				}
			}, 0.5, 2).then((buffer) => {
				let leftEffected = false;
				let rightEffected = false;
				buffer.toArray()[0].forEach((sample, index) => {
					const time = index / buffer.sampleRate;
					const leftValue = (time * 2) - 1;
					if (Math.abs(sample - leftValue) > 0.01) {
						leftEffected = true;
					}
				});
				buffer.toArray()[1].forEach((sample, index) => {
					const time = index / buffer.sampleRate;
					const rightValue = ((1 - time) * 2) - 1;
					if (Math.abs(sample - rightValue) > 0.01) {
						rightEffected = true;
					}
				});
				expect(leftEffected).to.be.true;
				expect(rightEffected).to.be.true;
			});
		});
	});
}
