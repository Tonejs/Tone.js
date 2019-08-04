import { expect } from "chai";
import { BasicTests } from "test/helper/Basic";
import { connectFrom, connectTo } from "test/helper/Connect";
import { ConstantOutput } from "test/helper/ConstantOutput";
import { Scale } from "./Scale";
import { Signal } from "./Signal";

describe("Scale", () => {

	BasicTests(Scale);

	context("Scaling", () => {

		it("handles input and output connections", () => {
			const scale = new Scale({ outputMin: 0, outputMax: 100 });
			connectFrom().connect(scale);
			scale.connect(connectTo());
			scale.dispose();
		});

		it("can set the min and max values", () => {
			const scale = new Scale({ outputMin: 0, outputMax: 100 });
			scale.setMin = -0.01;
			expect(scale.getMin).to.be.closeTo(-0.01, 0.001);
			scale.setMax = 1000;
			expect(scale.getMax).to.be.closeTo(1000, 0.001);
			scale.dispose();
		});

		it("scales to the min when the input is 0", () => {
			return ConstantOutput(() => {
				const signal = new Signal(0);
				const scale = new Scale({ outputMin: -10, outputMax: 8 });
				signal.connect(scale);
				scale.toDestination();
			}, -10);
		});

		it("scales to the max when the input is 1", () => {
			return ConstantOutput(() => {
				const signal = new Signal(1);
				const scale = new Scale({ outputMin: -10, outputMax: 0 });
				scale.setMax = 8;
				signal.connect(scale);
				scale.toDestination();
			}, 8);
		});

		it("scales an input of 0.5 to 15 (10, 20)", () => {
			return ConstantOutput(() => {
				const signal = new Signal(0.5);
				const scale = new Scale({ outputMin: 10, outputMax: 20 });
				signal.connect(scale);
				scale.toDestination();
			}, 15);
		});
	});
});
