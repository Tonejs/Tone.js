import ConstantOutput from "helper/ConstantOutput";
import Basic from "helper/Basic";
import GreaterThan from "Tone/signal/GreaterThan";
import Signal from "Tone/signal/Signal";
import Test from "helper/Test";
describe("GreaterThan", function(){

	Basic(GreaterThan);

	context("Comparison", function(){

		it("handles input and output connections", function(){
			var gt = new GreaterThan();
			Test.connect(gt);
			Test.connect(gt, 0);
			Test.connect(gt, 1);
			gt.connect(Test);
			gt.dispose();
		});

		it("outputs 0 when signal is less than value", function(){
			return ConstantOutput(function(){
				var signal = new Signal(1);
				var gt = new GreaterThan(20);
				signal.connect(gt);
				gt.toMaster();
			}, 0);
		});

		it("outputs 0 when signal is equal to the value", function(){
			return ConstantOutput(function(){
				var signal = new Signal(10);
				var gt = new GreaterThan(10);
				signal.connect(gt);
				gt.toMaster();
			}, 0);
		});

		it("outputs 1 value is greater than", function(){
			return ConstantOutput(function(){
				var signal = new Signal(0.8);
				var gt = new GreaterThan(0.4);
				signal.connect(gt);
				gt.toMaster();
			}, 1);
		});

		it("can handle negative values", function(){
			return ConstantOutput(function(){
				var signal = new Signal(-2);
				var gt = new GreaterThan(-4);
				signal.connect(gt);
				gt.toMaster();
			}, 1);
		});

		it("can set a new value", function(){
			return ConstantOutput(function(){
				var signal = new Signal(2);
				var gt = new GreaterThan(-100);
				gt.value = 1;
				signal.connect(gt);
				gt.toMaster();
			}, 1);
		});

		it("outputs 0 when first signal is less than second", function(){
			return ConstantOutput(function(){
				var sigA = new Signal(1);
				var sigB = new Signal(4);
				var gt = new GreaterThan();
				sigA.connect(gt, 0, 0);
				sigB.connect(gt, 0, 1);
				gt.toMaster();
			}, 0);
		});

		it("outputs 1 when first signal is greater than second", function(){
			return ConstantOutput(function(){
				var sigA = new Signal(2.01);
				var sigB = new Signal(2);
				var gt = new GreaterThan();
				sigA.connect(gt, 0, 0);
				sigB.connect(gt, 0, 1);
				gt.toMaster();
			}, 1);
		});
	});
});

