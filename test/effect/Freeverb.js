import Freeverb from "Tone/effect/Freeverb";
import Basic from "helper/Basic";
import EffectTests from "helper/EffectTests";
import CompareToFile from "helper/CompareToFile";
import Oscillator from "Tone/source/Oscillator";

describe("Freeverb", function(){

	Basic(Freeverb);
	EffectTests(Freeverb);

	it("matches a file basic", function(){
		return CompareToFile(function(){
			var reverb = new Freeverb(0.9, 7000).toMaster();
			var osc = new Oscillator().connect(reverb);
			osc.start(0).stop(0.01);
		}, "freeverb.wav", 1.5);
	});

	context("API", function(){

		it("can pass in options in the constructor", function(){
			var reverb = new Freeverb({
				"dampening" : 2000,
				"roomSize" : 0.2,
			});
			expect(reverb.dampening.value).to.be.closeTo(2000, 0.01);
			expect(reverb.roomSize.value).to.be.closeTo(0.2, 0.01);
			reverb.dispose();
		});

		it("can get/set the options", function(){
			var reverb = new Freeverb();
			reverb.set({
				"roomSize" : 0.23,
			});
			expect(reverb.get().roomSize).to.be.closeTo(0.23, 0.01);
			reverb.dispose();
		});
	});
});

