import { expect } from "chai";

import { BasicTests } from "../../test/helper/Basic.js";
import { Offline } from "../../test/helper/Offline.js";
import { LFOStereoEffect, LFOStereoEffectOptions } from "./LFOStereoEffect.js";

describe("LFOStereoEffect", () => {
	class LFOStereoEffectTest extends LFOStereoEffect<LFOStereoEffectOptions> {
		getLfoState() {
			return this._lfoL.state;
		}
	}

	BasicTests(LFOStereoEffectTest);

	context("API", () => {
		it("can pass in options in the constructor", () => {
			const stereoEffect = new LFOStereoEffectTest({
				frequency: 0.2,
			});
			expect(stereoEffect.frequency.value).to.be.closeTo(0.2, 0.01);
			stereoEffect.dispose();
		});

		it("can be started and stopped", () => {
			const stereoEffect = new LFOStereoEffectTest();
			stereoEffect.start().stop("+0.2");
			stereoEffect.dispose();
		});

		it("can get/set the options", () => {
			const stereoEffect = new LFOStereoEffectTest();
			stereoEffect.set({
				frequency: 2.4,
			});
			expect(stereoEffect.get().frequency).to.be.closeTo(2.4, 0.01);
			stereoEffect.dispose();
		});

		it("can set the frequency and depth", () => {
			const stereoEffect = new LFOStereoEffectTest();
			stereoEffect.frequency.value = 0.4;
			expect(stereoEffect.frequency.value).to.be.closeTo(0.4, 0.01);
			stereoEffect.dispose();
		});

		it("can sync the frequency to the transport", async () => {
			const buffer = await Offline(({ transport }) => {
				const stereoEffect = new LFOStereoEffectTest({
					frequency: 2,
				});
				stereoEffect.sync();
				stereoEffect.frequency.toDestination();
				transport.bpm.setValueAtTime(transport.bpm.value * 2, 0.05);
			}, 0.1);
			expect(buffer.getValueAtTime(0)).to.be.closeTo(2, 0.1);
			expect(buffer.getValueAtTime(0.05)).to.be.closeTo(4, 0.1);
		});

		it("can unsync the frequency to the transport", async () => {
			const buffer = await Offline(({ transport }) => {
				const stereoEffect = new LFOStereoEffectTest({
					frequency: 2,
				});
				stereoEffect.sync();
				stereoEffect.frequency.toDestination();
				transport.bpm.setValueAtTime(transport.bpm.value * 2, 0.05);
				stereoEffect.unsync();
			}, 0.1);
			expect(buffer.getValueAtTime(0)).to.be.closeTo(2, 0.1);
			expect(buffer.getValueAtTime(0.05)).to.be.closeTo(2, 0.1);
		});

		it("autostart the LFO", () => {
			const stereoEffect = new LFOStereoEffectTest({
				frequency: 0.2,
				autostart: true,
			});
			expect(stereoEffect.frequency.value).to.be.closeTo(0.2, 0.01);

			expect(stereoEffect.getLfoState()).to.equal("started");
			stereoEffect.dispose();
		});
	});
});
