import ConstantOutput from "helper/ConstantOutput";
import Negate from "Tone/signal/Negate";
import Basic from "helper/Basic";
import Test from "helper/Test";
import Oscillator from "Tone/source/Oscillator";
import Signal from "Tone/signal/Signal";

describe("Negate", function(){

	Basic(Negate);

	context("Negating", function(){

		it("handles input and output connections", function(){
			var negate = new Negate();
			Test.connect(negate);
			negate.connect(Test);
			negate.dispose();
		});

		it("negateates a positive value", function(){
			return ConstantOutput(function(){
				var signal = new Signal(1);
				var negate = new Negate();
				signal.connect(negate);
				negate.toMaster();
			}, -1);
		});

		it("makes a negateative value positive", function(){
			return ConstantOutput(function(){
				var signal = new Signal(-10);
				var negate = new Negate();
				signal.connect(negate);
				negate.toMaster();
			}, 10);
		});			
	});
});

