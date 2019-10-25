import { BasicTests } from "test/helper/Basic";
import { ScaledEnvelope } from "./ScaledEnvelope";
import { expect } from "chai";
import { Offline } from "test/helper/Offline";
import { Samples, Time } from "Tone/core/type/Units";

describe("ScaledEnvelope", () => {

	BasicTests(ScaledEnvelope);

	context("ScaledEnvelope", () => {

		it("can get and set values an Objects", () => {
			const scaledEnvelope = new ScaledEnvelope();
			const values = {
				attack: 0,
				release: "4n",
				min: 2,
				max: 4,
				exponent: 3
			};
			scaledEnvelope.set(values);
			expect(scaledEnvelope.get()).to.contain.keys(Object.keys(values));
			expect(scaledEnvelope.min).to.equal(2);
			expect(scaledEnvelope.max).to.equal(4);
			expect(scaledEnvelope.exponent).to.equal(3);
			scaledEnvelope.dispose();
		});

		it("can take parameters as both an object and as arguments", () => {
			const env0 = new ScaledEnvelope({
				attack: 0,
				decay: 0.5,
				sustain: 1
			});
			expect(env0.attack).to.equal(0);
			expect(env0.decay).to.equal(0.5);
			expect(env0.sustain).to.equal(1);
			env0.dispose();
			const env1 = new ScaledEnvelope(0.1, 0.2, 0.3);
			expect(env1.attack).to.equal(0.1);
			expect(env1.decay).to.equal(0.2);
			expect(env1.sustain).to.equal(0.3);
			env1.dispose();
		});

		it("goes to the scaled range", async () => {
			let scaledEnvelope: ScaledEnvelope;
			const buffer = await Offline(() => {
				scaledEnvelope = new ScaledEnvelope(0.01, 0.4, 1);
				scaledEnvelope.min = 5;
				scaledEnvelope.max = 10;
				scaledEnvelope.attackCurve = "exponential";
				scaledEnvelope.toDestination();
				scaledEnvelope.triggerAttack(0);
			}, 0.3);
			buffer.forEach((sample: Samples, time: Time) => {
				if (time < scaledEnvelope.attack) {
					expect(sample).to.be.within(5, 10);
				} else if (time < Math.round((scaledEnvelope.attack as number)) + (scaledEnvelope.decay as number)) {
					expect(sample).to.be.closeTo(10, 0.1);
				}
			});
		});
	});
});

