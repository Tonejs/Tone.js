import ConstantOutput from "helper/ConstantOutput";
import Modulo from "Tone/signal/Modulo";
import Basic from "helper/Basic";
import Test from "helper/Test";
import Signal from "Tone/signal/Signal";

describe("Modulo", function(){

	Basic(Modulo);

	context("Exponential Scaling", function(){

		it("handles input and output connections", function(){
			var mod = new Modulo();
			Test.connect(mod);
			mod.connect(Test);
			mod.dispose();
		});

		it("can evaluate 0.45 % 0.3", function(){
			return ConstantOutput(function(){
				var signal = new Signal(0.45);
				var mod = new Modulo(0.3);
				signal.connect(mod);
				mod.toMaster();
			}, 0.15);
		});

		it("can evaluate 0.1 % 0.2", function(){
			return ConstantOutput(function(){
				var signal = new Signal(0.1);
				var mod = new Modulo(0.2);
				signal.connect(mod);
				mod.toMaster();
			}, 0.1);
		});

		it("can set a new modulo value", function(){
			return ConstantOutput(function(){
				var signal = new Signal(0.4);
				var mod = new Modulo(0.1);
				mod.value = 0.35;
				expect(mod.value).to.be.closeTo(0.35, 0.001);
				signal.connect(mod);
				mod.toMaster();
			}, 0.05); 
		});
	});
});

