import { expect } from "chai";
import { EffectTests } from "../../test/helper/EffectTests.js";
import { BasicTests } from "../../test/helper/Basic.js";
import { ReverseDelay } from "./ReverseDelay.js";

describe("ReverseDelay", () => {
  BasicTests(ReverseDelay);
  EffectTests(ReverseDelay, .01);

  context("API", () => {
    it("can pass in options in the constructor", () => {
      const reverse = new ReverseDelay({
        delayTime: 1.25,
        feedback: .75
      });
      expect(reverse.delayTime).to.equal(1.25);
      expect(reverse.feedback).to.equal(.75);
      reverse.dispose();
    });

    it("can get/set the options", () => {
      const reverse = new ReverseDelay(1.25, .75);
      expect(reverse.delayTime).to.equal(1.25);
      expect(reverse.feedback).to.equal(.75);
      reverse.set({
        delayTime: "2n",
        feedback: .5,
      });

      expect(reverse.get().delayTime).to.be.closeTo(1, .01);
      expect(reverse.get().feedback).to.be.closeTo(.5, .01);
      reverse.dispose();
    });
  });
});
