import Chorus from "Tone/effect/Chorus";
import Basic from "helper/Basic";
import EffectTests from "helper/EffectTests";

describe("Chorus", function(){

	Basic(Chorus);
	EffectTests(Chorus);

	context("API", function(){

		it("can pass in options in the constructor", function(){
			var chorus = new Chorus({
				"frequency" : 2,
				"delayTime" : 1,
				"depth" : 0.4,
				"spread" : 90
			});
			expect(chorus.frequency.value).to.be.closeTo(2, 0.01);
			expect(chorus.delayTime).to.be.closeTo(1, 0.01);
			expect(chorus.depth).to.be.closeTo(0.4, 0.01);
			expect(chorus.spread).to.be.equal(90);
			chorus.dispose();
		});

		it("can get/set the options", function(){
			var chorus = new Chorus();
			chorus.set({
				"type" : "square",
			});
			expect(chorus.get().type).to.equal("square");
			chorus.dispose();
		});

		it("can get/set the delayTime", function(){
			var chorus = new Chorus();
			chorus.delayTime = 3;
			expect(chorus.delayTime).to.equal(3);
			chorus.dispose();
		});
	});
});

