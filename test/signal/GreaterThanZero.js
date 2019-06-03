import ConstantOutput from "helper/ConstantOutput";
import Basic from "helper/Basic";
import GreaterThanZero from "Tone/signal/GreaterThanZero";
import Signal from "Tone/signal/Signal";

describe("GreaterThanZero", function(){

	Basic(GreaterThanZero);

	describe("Comparison", function(){

		it("Outputs 0 when the value is less than 0", function(){
			return ConstantOutput(function(){
				var signal = new Signal(-1);
				var gtz = new GreaterThanZero();
				signal.connect(gtz);
				gtz.toMaster();
			}, 0);
		});

		it("Outputs 1 when the value is greater than 0", function(){
			return ConstantOutput(function(){
				var signal = new Signal(1);
				var gtz = new GreaterThanZero();
				signal.connect(gtz);
				gtz.toMaster();
			}, 1);
		});

		it("Outputs 0 when the value is equal to 0", function(){
			return ConstantOutput(function(){
				var signal = new Signal(0);
				var gtz = new GreaterThanZero();
				signal.connect(gtz);
				gtz.toMaster();
			}, 0);
		});

		it("Outputs 1 when the value is slightly above 0", function(){
			return ConstantOutput(function(){
				var signal = new Signal(0.001);
				var gtz = new GreaterThanZero();
				signal.connect(gtz);
				gtz.toMaster();
			}, 1);
		});
	});
});

