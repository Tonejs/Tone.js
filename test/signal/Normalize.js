import ConstantOutput from "helper/ConstantOutput";
import Normalize from "Tone/signal/Normalize";
import Basic from "helper/Basic";
import Test from "helper/Test";
import Oscillator from "Tone/source/Oscillator";
import Signal from "Tone/signal/Signal";
import Offline from "helper/Offline";

describe("Normalize", function(){

	Basic(Normalize);

	context("Normalizing", function(){

		it("handles input and output connections", function(){
			var norm = new Normalize();
			Test.connect(norm);
			norm.connect(Test);
			norm.dispose();
		});

		it("normalizes an oscillator to 0,1", function(){
			return Offline(function(){
				var osc = new Oscillator(1000);
				var norm = new Normalize(-1, 1);
				osc.connect(norm);
				norm.toMaster();
			}).then(function(buffer){
				buffer.forEach(function(sample){
					expect(sample).to.be.within(0, 1);
				});
			});
		});

		it("normalizes an input at the max range to 1", function(){
			return ConstantOutput(function(){
				var sig = new Signal(1000);
				var norm = new Normalize(0, 1000);
				sig.connect(norm);
				norm.toMaster();
			}, 1); 
		});

		it("normalizes an input at the min range to 0", function(){
			return ConstantOutput(function(){
				var sig = new Signal(-10);
				var norm = new Normalize(-10, 1000);
				sig.connect(norm);
				norm.toMaster();
			}, 0); 
		});

		it("can set the min and max", function(){
			return ConstantOutput(function(){
				var sig = new Signal(10);
				var norm = new Normalize(0, 1);
				norm.min = 5;
				norm.max = 15;
				expect(norm.min).to.be.closeTo(5, 0.1);
				expect(norm.max).to.be.closeTo(15, 0.1);
				sig.connect(norm);
				norm.toMaster();
			}, 0.5); 
		});
	});
});

