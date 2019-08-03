import { expect } from "chai";
import { BasicTests } from "test/helper/Basic";
import { connectTo } from "test/helper/Connect";
import { ConstantOutput } from "test/helper/ConstantOutput";
import { Signal } from "Tone/signal/Signal";
import { InputOutput } from "./InputOutput";
import { Merge } from "./Merge";

describe("InputOutput", () => {

	BasicTests(InputOutput);

	context("I/O", () => {

		it("defaults to two channels", () => {
			const io = new InputOutput();
			expect(io.numberOfOutputs).to.equal(2);
			io.dispose();
		});

		it("can pass in more channels", () => {
			const io = new InputOutput(4);
			expect(io.numberOfInputs).to.equal(4);
			expect(io.numberOfOutputs).to.equal(4);
			io.connect(connectTo(), 0, 0);
			io.connect(connectTo(), 1, 0);
			io.connect(connectTo(), 2, 0);
			io.connect(connectTo(), 3, 0);
			connectTo().connect(io, 0, 0);
			connectTo().connect(io, 0, 1);
			connectTo().connect(io, 0, 2);
			connectTo().connect(io, 0, 3);
			io.dispose();
		});

		it("passes the incoming signal through the first channel", () => {
			return ConstantOutput(({destination}) => {
				const io = new InputOutput();
				const signal = new Signal(2).connect(io, 0, 0);
				io.connect(destination, 0, 0);
			}, 2);
		});

		it("first signal does not come through the second channel", () => {
			return ConstantOutput(({destination}) => {
				const io = new InputOutput();
				const signal = new Signal(2).connect(io, 0, 0);
				io.connect(destination, 1, 0);
			}, 0);
		});

		it("passes the incoming signal through on the second", () => {
			return ConstantOutput(({destination}) => {
				const io = new InputOutput();
				const signal = new Signal(2).connect(io, 0, 1);
				io.connect(destination, 1, 0);
			}, 2);
		});

		it("can output on the third channel", () => {
			return ConstantOutput(({destination}) => {
				const io = new InputOutput(3);
				const signal = new Signal(3).connect(io, 0, 2);
				io.connect(destination, 2, 0);
			}, 3);
		});
	});
});
