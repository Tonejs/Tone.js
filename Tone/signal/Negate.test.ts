import { BasicTests } from "test/helper/Basic";
import { ConstantOutput } from "test/helper/ConstantOutput";
import { Negate } from "./Negate";
import { Signal } from "./Signal";

describe("Negate", () => {

	BasicTests(Negate);

	context("Negating", () => {

		it("negateates a positive value", () => {
			return ConstantOutput(() => {
				const signal = new Signal(1);
				const negate = new Negate();
				signal.connect(negate);
				negate.toDestination();
			}, -1);
		});

		it("makes a negateative value positive", () => {
			return ConstantOutput(() => {
				const signal = new Signal(-10);
				const negate = new Negate();
				signal.connect(negate);
				negate.toDestination();
			}, 10);
		});
	});
});
