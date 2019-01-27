import ConstantOutput from "helper/ConstantOutput";
import ScaleExp from "Tone/signal/ScaleExp";
import Basic from "helper/Basic";
import Test from "helper/Test";
import Oscillator from "Tone/source/Oscillator";
import Signal from "Tone/signal/Signal";

describe("ScaleExp", function(){

	Basic(ScaleExp);

	context("Scaling", function(){

		it("handles input and output connections", function(){
			var scale = new ScaleExp(0, 100, 2);
			Test.connect(scale);
			scale.connect(Test);
			scale.dispose();
		});

		it("can set the min and max values", function(){
			var scale = new ScaleExp(-20, 10, 2);
			scale.min = -0.01;
			expect(scale.min).to.be.closeTo(-0.01, 0.001);
			scale.max = 1000;
			expect(scale.max).to.be.closeTo(1000, 0.001);
			scale.dispose();
		});

		it("can set the exponent value", function(){
			var scale = new ScaleExp(0, 100, 2);
			expect(scale.exponent).to.be.closeTo(2, 0.001);
			scale.exponent = 3;
			expect(scale.exponent).to.be.closeTo(3, 0.001);
			scale.dispose();
		});

		it("scales a signal exponentially", function(){
			return ConstantOutput(function(){
				var signal = new Signal(0.5);
				var scale = new ScaleExp(0, 1, 2);
				signal.connect(scale);
				scale.toMaster();
			}, 0.25); 
		});
	});
});

