import Offline from "helper/Offline";
import AudioToGain from "Tone/signal/AudioToGain";
import Basic from "helper/Basic";
import Test from "helper/Test";
import Oscillator from "Tone/source/Oscillator";
import Signal from "Tone/signal/Signal";
import Zero from "Tone/signal/Zero";
import ConstantOutput from "helper/ConstantOutput";

describe("AudioToGain", function(){

	Basic(AudioToGain);

	it("handles input and output connections", function(){
		var a2g = new AudioToGain();
		a2g.connect(Test);
		Test.connect(a2g);
		a2g.dispose();
	});

	it("normalizes an oscillator to 0,1", function(){
		return Offline(function(){
			var osc = new Oscillator(1000);
			var a2g = new AudioToGain();
			osc.connect(a2g);
			a2g.toMaster();
		}).then(function(buffer){
			buffer.forEach(function(sample){
				expect(sample).to.be.within(0, 1);
			});
		});
	});

	it("outputs 0.5 for an input value of 0", function(){
		return ConstantOutput(function(){
			var sig = new Zero();
			var a2g = new AudioToGain();
			sig.connect(a2g);
			a2g.toMaster();
		}, 0.5);
	});

	it("outputs 1 for an input value of 1", function(){
		return ConstantOutput(function(){
			var sig = new Signal(1);
			var a2g = new AudioToGain();
			sig.connect(a2g);
			a2g.toMaster();
		}, 1);
	});

	it("outputs 0 for an input value of -1", function(){
		return ConstantOutput(function(){
			var sig = new Signal(-1);
			var a2g = new AudioToGain();
			sig.connect(a2g);
			a2g.toMaster();
		}, 0);
	});
});

