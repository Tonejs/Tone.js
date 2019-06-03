import Vibrato from "Tone/effect/Vibrato";
import Basic from "helper/Basic";
import EffectTests from "helper/EffectTests";
describe("Effect", function(){
	Basic(Vibrato);
	EffectTests(Vibrato);

	context("API", function(){

		it("can pass in options in the constructor", function(){
			var vibrato = new Vibrato({
				"maxDelay" : 0.02,
				"depth" : 0.25,
				"type" : "sawtooth"
			});
			expect(vibrato.depth.value).to.be.closeTo(0.25, 0.001);
			expect(vibrato.type).to.equal("sawtooth");
			vibrato.dispose();
		});
		
		it("can get/set the options", function(){
			var vibrato = new Vibrato();
			vibrato.set({
				"frequency" : 2.4,
				"type" : "triangle"
			});
			expect(vibrato.get().frequency).to.be.closeTo(2.4, 0.01);
			expect(vibrato.get().type).to.equal("triangle");
			vibrato.dispose();
		});

		it("can set the frequency and depth", function(){
			var vibrato = new Vibrato();
			vibrato.depth.value = 0.4;
			vibrato.frequency.value = 0.4;
			expect(vibrato.depth.value).to.be.closeTo(0.4, 0.01);
			expect(vibrato.frequency.value).to.be.closeTo(0.4, 0.01);
			vibrato.dispose();
		});
	});
});

