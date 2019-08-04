import { BasicTests } from "test/helper/Basic";
import { connectFrom, connectTo } from "test/helper/Connect";
import { ConstantOutput } from "test/helper/ConstantOutput";
import { Abs } from "./Abs";
import { Signal } from "./Signal";

describe("Abs", () => {

	BasicTests(Abs);

	context("Absolute Value", () => {

		it("outputs the same value for positive values", () => {
			return ConstantOutput(() => {
				const signal = new Signal(0.4);
				const abs = new Abs();
				signal.connect(abs);
				abs.toDestination();
			}, 0.4);
		});

		it("outputs 0 when the input is 0", () => {
			return ConstantOutput(() => {
				const signal = new Signal(0);
				const abs = new Abs();
				signal.connect(abs);
				abs.toDestination();
			}, 0);
		});

		it("outputs the absolute value for negative numbers", () => {
			return ConstantOutput(() => {
				const signal = new Signal(-0.3);
				const abs = new Abs();
				signal.connect(abs);
				abs.toDestination();
			}, 0.3);
		});

	});

});
