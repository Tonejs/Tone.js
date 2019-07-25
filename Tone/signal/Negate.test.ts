import { BasicTests } from "test/helper/Basic";
import { connectFrom, connectTo } from "test/helper/Connect";
import { ConstantOutput } from "test/helper/ConstantOutput";
import { Negate } from "./Negate";
import { Signal } from "./Signal";

describe("Negate", () => {

	BasicTests(Negate);

	context("Negating", () => {

		it("handles input and output connections", () => {
			const negate = new Negate();
			connectFrom().connect(negate);
			negate.connect(connectTo());
			negate.dispose();
		});

		it("negateates a positive value", () => {
			return ConstantOutput(() => {
				const signal = new Signal(1);
				const negate = new Negate();
				signal.connect(negate);
				negate.toMaster();
			}, -1);
		});

		it("makes a negateative value positive", () => {
			return ConstantOutput(() => {
				const signal = new Signal(-10);
				const negate = new Negate();
				signal.connect(negate);
				negate.toMaster();
			}, 10);
		});
	});
});
