import { BasicTests } from "test/helper/Basic";
import { connectFrom, connectTo } from "test/helper/Connect";
import { ConstantOutput } from "test/helper/ConstantOutput";
import { Add } from "./Add";
import { Signal } from "./Signal";

describe("Add", () => {

	BasicTests(Add);

	context("Addition", () => {

		it("handles input and output connections", () => {
			const add = new Add();
			connectFrom().connect(add);
			connectFrom().connect(add, 0);
			connectFrom().connect(add, 1);
			add.connect(connectTo());
			add.dispose();
		});

		it("correctly sums a signal and a number", () => {
			return ConstantOutput(() => {
				const signal = new Signal(0);
				const adder = new Add(3);
				signal.connect(adder);
				adder.toDestination();
			}, 3);
		});

		it("can handle negative values", () => {
			return ConstantOutput(() => {
				const signal = new Signal(10);
				const adder = new Add(-1);
				signal.connect(adder);
				adder.toDestination();
			}, 9);
		});

		it("can sum two signals", () => {
			return ConstantOutput(() => {
				const sigA = new Signal(1);
				const sigB = new Signal(4);
				const adder = new Add();
				sigA.connect(adder, 0, 0);
				sigB.connect(adder, 0, 1);
				adder.toDestination();
			}, 5);
		});
	});
});
