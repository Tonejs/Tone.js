import ConstantOutput from "helper/ConstantOutput";
import Basic from "helper/Basic";
import Add from "Tone/signal/Add";
import Signal from "Tone/signal/Signal";
import Test from "helper/Test";
describe("Add", function(){

	Basic(Add);

	context("Addition", function(){

		it("handles input and output connections", function(){
			var add = new Add();
			Test.connect(add);
			Test.connect(add, 0);
			Test.connect(add, 1);
			add.connect(Test);
			add.dispose();
		});

		it("correctly sums a signal and a number", function(){
			return ConstantOutput(function(){
				var signal = new Signal(0);
				var adder = new Add(3);
				signal.connect(adder);
				adder.toMaster();
			}, 3);
		});

		it("can handle negative values", function(){
			return ConstantOutput(function(){
				var signal = new Signal(10);
				var adder = new Add(-1);
				signal.connect(adder);
				adder.toMaster();
			}, 9);
		});

		it("can sum two signals", function(){
			return ConstantOutput(function(){
				var sigA = new Signal(1);
				var sigB = new Signal(4);
				var adder = new Add();
				sigA.connect(adder, 0, 0);
				sigB.connect(adder, 0, 1);
				adder.toMaster();
			}, 5);
		});
	});
});

