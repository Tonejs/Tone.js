import { expect } from "chai";
import { BasicTests } from "test/helper/Basic";
import { ConstantOutput } from "test/helper/ConstantOutput";
import { Zero } from "./Zero";

describe("Zero", () => {

	BasicTests(Zero);

	context("Zero", () => {

		it("has 0 inputs and 1 output", () => {
			const zero = new Zero();
			expect(zero.numberOfInputs).to.equal(0);
			expect(zero.numberOfOutputs).to.equal(1);
			zero.dispose();
		});

		it("always outputs 0", () => {
			return ConstantOutput(() => {
				new Zero().toDestination();
			}, 0, 0);
		});
	});
});
