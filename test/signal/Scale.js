import ConstantOutput from "helper/ConstantOutput";
import Scale from "Tone/signal/Scale";
import Basic from "helper/Basic";
import Test from "helper/Test";
import Oscillator from "Tone/source/Oscillator";
import Signal from "Tone/signal/Signal";

describe("Scale", function(){

	Basic(Scale);

	context("Scaling", function(){

		it("handles input and output connections", function(){
			var scale = new Scale(0, 100);
			Test.connect(scale);
			scale.connect(Test);
			scale.dispose();
		});

		it("can set the min and max values", function(){
			var scale = new Scale(0, 100);
			scale.min = -0.01;
			expect(scale.min).to.be.closeTo(-0.01, 0.001);
			scale.max = 1000;
			expect(scale.max).to.be.closeTo(1000, 0.001);
			scale.dispose();
		});

		it("scales to the min when the input is 0", function(){
			return ConstantOutput(function(){
				var signal = new Signal(0);
				var scale = new Scale(-10, 8);
				signal.connect(scale);
				scale.toMaster();
			}, -10); 
		});

		it("scales to the max when the input is 1", function(){
			return ConstantOutput(function(){
				var signal = new Signal(1);
				var scale = new Scale(-10, 0);
				scale.max = 8;
				signal.connect(scale);
				scale.toMaster();
			}, 8); 
		});

		it("scales an input of 0.5 to 15 (10, 20)", function(){
			return ConstantOutput(function(){
				var signal = new Signal(0.5);
				var scale = new Scale(10, 20);
				signal.connect(scale);
				scale.toMaster();
			}, 15); 
		});
	});
});

