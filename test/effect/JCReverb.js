import JCReverb from "Tone/effect/JCReverb";
import Basic from "helper/Basic";
import EffectTests from "helper/EffectTests";

describe("JCReverb", function(){

	Basic(JCReverb);
	EffectTests(JCReverb);

	context("API", function(){

		it("can pass in options in the constructor", function(){
			var reverb = new JCReverb({
				"roomSize" : 0.2,
			});
			expect(reverb.roomSize.value).to.be.closeTo(0.2, 0.01);
			reverb.dispose();
		});

		it("can get/set the options", function(){
			var reverb = new JCReverb();
			reverb.set({
				"roomSize" : 0.23,
			});
			expect(reverb.get().roomSize).to.be.closeTo(0.23, 0.01);
			reverb.dispose();
		});
	});
});

