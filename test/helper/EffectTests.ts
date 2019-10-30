import { expect } from "chai";
import { connectFrom, connectTo } from "test/helper/Connect";
import { Offline } from "test/helper/Offline";
import { PassAudio } from "test/helper/PassAudio";
import { Signal } from "Tone/signal/Signal";

export function EffectTests(Constr, args?, before?): void {

	context("Effect Tests", () => {

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
				wet: 0.25,
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

		it("has no sound when not connected to any inputs", () => {
			return Offline(() => {
				const instance = new Constr(args).toDestination();
				if (before) {
					before(instance);
				}
			}, 0.5, 1).then((buffer) => {
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it.skip("can pass 100% dry signal", () => {
			return Offline(() => {
				const instance = new Constr(args).toDestination();
				if (before) {
					before(instance);
				}
				const signal = new Signal(-1).connect(instance);
				// make the signals ramp
				signal.linearRampTo(1, 1, 0);
				instance.wet.value = 0;
			}, 0.5, 1).then((buffer) => {
				buffer.forEach((sample, time) => {
					const value = (time * 2) - 1;
					expect(sample).to.be.closeTo(value, 0.1);
				});
			});
		});

		it.skip("effects the incoming signal", () => {
			return Offline(() => {
				const instance = new Constr(args).toDestination();
				if (before) {
					before(instance);
				}
				const signal = new Signal(-1).connect(instance);
				// make the signals ramp
				signal.linearRampTo(1, 1);
				instance.wet.value = 1;
			}, 0.5, 1).then((buffer) => {
				let affected = false;
				buffer.forEach((sample, time) => {
					const value = (time * 2) - 1;
					if (Math.abs(value - sample) > 0.01) {
						affected = true;
					}
				});
				expect(affected).to.be.true;
			});
		});
	});
}
