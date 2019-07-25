import { BasicTests } from "test/helper/Basic";
import { connectTo } from "test/helper/Connect";
import { ConstantOutput } from "test/helper/ConstantOutput";
import { Zero } from "./Zero";

describe("Zero", () => {

	BasicTests(Zero);

	context("Zero", () => {

		it("handles output connections", () => {
			const abs = new Zero();
			abs.connect(connectTo());
			abs.dispose();
		});

		it("always outputs 0", () => {
			return ConstantOutput(() => {
				new Zero().toDestination();
			}, 0, 0);
		});
	});
});
