import Offline from "helper/Offline";
import EqualPowerGain from "Tone/signal/EqualPowerGain";
import Basic from "helper/Basic";
import Test from "helper/Test";
import Oscillator from "Tone/source/Oscillator";
import Signal from "Tone/signal/Signal";
import PassAudio from "helper/PassAudio";
import Tone from "Tone/core/Tone";

describe("EqualPowerGain", function(){

	Basic(EqualPowerGain);

	context("Equal Power Gain", function(){

		it("handles input and output connections", function(){
			var eqGain = new EqualPowerGain();
			Test.connect(eqGain);
			eqGain.connect(Test);
			eqGain.dispose();
		});

		it("passes audio through", function(){
			return PassAudio(function(input){
				var eqGain = new EqualPowerGain().toMaster();
				input.connect(eqGain);
			});
		});

		it("scales the input on an equal power scale", function(){
			var eqGain;
			return Offline(function(){
				var sig = new Signal(0);
				eqGain = new EqualPowerGain();
				sig.connect(eqGain);
				eqGain.toMaster();
				sig.setValueAtTime(0, 0);
				sig.linearRampToValueAtTime(1, 0.1);
			}, 0.1).then(function(buffer){
				buffer.forEach(function(sample, time){
					expect(sample).to.be.closeTo(Tone.equalPowerScale(time*10), 0.01);
				});
			});
		});
	});
});

