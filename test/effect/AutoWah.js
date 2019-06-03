import AutoWah from "Tone/effect/AutoWah";
import Basic from "helper/Basic";
import EffectTests from "helper/EffectTests";

describe("AutoWah", function(){

	Basic(AutoWah);
	EffectTests(AutoWah);

	context("API", function(){

		it("can pass in options in the constructor", function(){
			var autoWah = new AutoWah({
				"baseFrequency" : 150,
				"octaves" : 3,
				"sensitivity" : -10
			});
			expect(autoWah.baseFrequency).to.be.closeTo(150, 0.01);
			autoWah.baseFrequency = 250;
			expect(autoWah.baseFrequency).to.be.closeTo(250, 0.01);
			expect(autoWah.octaves).to.be.closeTo(3, 0.01);
			autoWah.octaves = 2;
			expect(autoWah.octaves).to.be.closeTo(2, 0.01);
			expect(autoWah.sensitivity).to.be.closeTo(-10, 0.1);
			autoWah.sensitivity = -20;
			expect(autoWah.sensitivity).to.be.closeTo(-20, 0.1);
			autoWah.dispose();
		});

		it("can get/set the options", function(){
			var autoWah = new AutoWah();
			autoWah.set({
				"Q" : 2.4,
			});
			expect(autoWah.get().Q).to.be.closeTo(2.4, 0.01);
			autoWah.dispose();
		});

		it("can set the gain and follower values", function(){
			var autoWah = new AutoWah();
			autoWah.gain.value = 1.2;
			autoWah.follower.attack = 0.4;
			autoWah.follower.release = 1;
			expect(autoWah.gain.value).to.be.closeTo(1.2, 0.01);
			expect(autoWah.follower.attack).to.be.closeTo(0.4, 0.01);
			expect(autoWah.follower.release).to.be.closeTo(1, 0.01);
			autoWah.dispose();
		});
	});
});

