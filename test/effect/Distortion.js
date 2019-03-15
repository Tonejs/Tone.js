import Distortion from "Tone/effect/Distortion";
import Basic from "helper/Basic";
import EffectTests from "helper/EffectTests";

describe("Distortion", function(){

	Basic(Distortion);
	EffectTests(Distortion);

	context("API", function(){

		it("can pass in options in the constructor", function(){
			var dist = new Distortion({
				"distortion" : 0.2,
			});
			expect(dist.distortion).to.be.closeTo(0.2, 0.01);
			dist.dispose();
		});

		it("can get/set the options", function(){
			var dist = new Distortion();
			dist.set({
				"oversample" : "4x",
			});
			expect(dist.get().oversample).to.equal("4x");
			dist.dispose();
		});
	});
});

