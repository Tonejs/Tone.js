import { BasicTests } from "@tone/test/helper/Basic.js";
import { ConstantOutput } from "@tone/test/helper/ConstantOutput.js";

import { Negate } from "./Negate.js";
import { Signal } from "./Signal.js";

describe("Negate", () => {
	BasicTests(Negate);

	context("Negating", () => {
		it("negates a positive value", () => {
			return ConstantOutput(() => {
				const signal = new Signal(1);
				const negate = new Negate();
				signal.connect(negate);
				negate.toDestination();
			}, -1);
		});

		it("makes a negative value positive", () => {
			return ConstantOutput(() => {
				const signal = new Signal(-10);
				const negate = new Negate();
				signal.connect(negate);
				negate.toDestination();
			}, 10);
		});
	});
});
