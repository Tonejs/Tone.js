import { BasicTests } from "test/helper/Basic";
import { Pow } from "./Pow";
import { ConstantOutput } from "test/helper/ConstantOutput";
import { Signal } from ".";
import { connectFrom, connectTo } from "test/helper/Connect";

describe("Pow", () => {

	BasicTests(Pow);

	context("Exponential Scaling", () => {

		it("handles input and output connections", () => {
			var pow = new Pow();
			connectFrom().connect(pow);
			pow.connect(connectTo())
			pow.dispose();
		});

		it("can do powers of 2", () => {
			return ConstantOutput(() => {
				var signal = new Signal(0.3);
				var pow = new Pow(2);
				signal.connect(pow);
				pow.toDestination();
			}, 0.09); 
		});

		it("can compute negative values and powers less than 1", () => {
			return ConstantOutput(() => {
				var signal = new Signal(-0.49);
				var pow = new Pow(0.5);
				signal.connect(pow);
				pow.toDestination();
			}, 0.7); 
		});

		it("can set a new exponent", () => {
			return ConstantOutput(() => {
				var signal = new Signal(0.5);
				var pow = new Pow(1);
				pow.exponent = 3;
				signal.connect(pow);
				pow.toDestination();
			}, 0.125); 
		});
	});
});

