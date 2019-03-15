import ConstantOutput from "helper/ConstantOutput";
import Subtract from "Tone/signal/Subtract";
import Basic from "helper/Basic";
import Test from "helper/Test";
import Oscillator from "Tone/source/Oscillator";
import Signal from "Tone/signal/Signal";

describe("Subtract", function(){

	Basic(Subtract);

	context("Subtraction", function(){

		it("handles input and output connections", function(){
			var subtract = new Subtract();
			Test.connect(subtract, 0);
			Test.connect(subtract, 1);
			subtract.connect(Test);
			subtract.dispose();
		});

		it("correctly subtracts a signal and a number", function(){
			return ConstantOutput(function(){
				var signal = new Signal(0);
				var sub = new Subtract(3);
				signal.connect(sub);
				sub.toMaster();
			}, -3); 
		});

		it("can set the scalar value after construction", function(){
			return ConstantOutput(function(){
				var signal = new Signal(-2);
				var sub = new Subtract(0);
				sub.value = 4;
				signal.connect(sub);
				sub.toMaster();
			}, -6); 
		});

		it("can handle negative values", function(){
			return ConstantOutput(function(){
				var signal = new Signal(4);
				var sub = new Subtract(-2);
				signal.connect(sub);
				sub.toMaster();
			}, 6); 
		});

		it("can subtract two signals", function(){
			return ConstantOutput(function(){
				var sigA = new Signal(1);
				var sigB = new Signal(4);
				var sub = new Subtract();
				sigA.connect(sub, 0, 0);
				sigB.connect(sub, 0, 1);
				sub.toMaster();
			}, -3); 
		});
	});
});

