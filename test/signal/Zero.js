import Test from "helper/Test";
import Zero from "Tone/signal/Zero";
import BasicTest from "helper/Basic";
import Signal from "Tone/signal/Signal";
import ConstantOutput from "helper/ConstantOutput";

describe("Zero", function(){

	BasicTest(Zero);

	context("Zero", function(){

		it("handles output connections", function(){
			var abs = new Zero();
			abs.connect(Test);
			abs.dispose();
		});

		it("always outputs 0", function(){
			return ConstantOutput(function(){
				new Zero().toMaster();
			}, 0, 0);
		});

	});

});

