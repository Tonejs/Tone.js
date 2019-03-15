import ConstantOutput from "helper/ConstantOutput";
import Pow from "Tone/signal/Pow";
import Basic from "helper/Basic";
import Test from "helper/Test";
import Signal from "Tone/signal/Signal";

describe("Pow", function(){

	Basic(Pow);

	context("Exponential Scaling", function(){

		it("handles input and output connections", function(){
			var pow = new Pow();
			Test.connect(pow);
			pow.connect(Test);
			pow.dispose();
		});

		it("can do powers of 2", function(){
			return ConstantOutput(function(){
				var signal = new Signal(0.3);
				var pow = new Pow(2);
				signal.connect(pow);
				pow.toMaster();
			}, 0.09); 
		});

		it("can compute negative values and powers less than 1", function(){
			return ConstantOutput(function(){
				var signal = new Signal(-0.49);
				var pow = new Pow(0.5);
				signal.connect(pow);
				pow.toMaster();
			}, 0.7); 
		});

		it("can set a new exponent", function(){
			return ConstantOutput(function(){
				var signal = new Signal(0.5);
				var pow = new Pow(1);
				pow.value = 3;
				signal.connect(pow);
				pow.toMaster();
			}, 0.125); 
		});
	});
});

