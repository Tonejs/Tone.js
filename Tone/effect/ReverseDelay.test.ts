import { expect } from "chai";

import { BasicTests } from "../../test/helper/Basic.js";
import { EffectTests } from "../../test/helper/EffectTests.js";
import { ReverseDelay } from "./ReverseDelay.js";

describe("ReverseDelay", () => {
	BasicTests(ReverseDelay);
	EffectTests(ReverseDelay, 0.01);

	context("API", () => {
		it("can pass in options in the constructor", () => {
			const reverse = new ReverseDelay({
				delayTime: 1.25,
				feedback: 0.75,
			});
			expect(reverse.delayTime).to.equal(1.25);
			expect(reverse.feedback).to.equal(0.75);
			reverse.dispose();
		});

		it("can get/set the options", () => {
			const reverse = new ReverseDelay(1.25, 0.75);
			expect(reverse.delayTime).to.equal(1.25);
			expect(reverse.feedback).to.equal(0.75);
			reverse.set({
				delayTime: "2n",
				feedback: 0.5,
			});

			expect(reverse.get().delayTime).to.be.closeTo(1, 0.01);
			expect(reverse.get().feedback).to.be.closeTo(0.5, 0.01);
			reverse.dispose();
		});
	});
});
