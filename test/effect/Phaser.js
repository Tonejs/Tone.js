import Phaser from "Tone/effect/Phaser";
import Basic from "helper/Basic";
import EffectTests from "helper/EffectTests";

describe("Phaser", function(){

	Basic(Phaser);
	EffectTests(Phaser);

	context("API", function(){

		it("can pass in options in the constructor", function(){
			var phaser = new Phaser({
				"frequency" : 0.2,
			});
			expect(phaser.frequency.value).to.be.closeTo(0.2, 0.01);
			phaser.dispose();
		});

		it("can get/set the options", function(){
			var phaser = new Phaser();
			phaser.set({
				"octaves" : 0.21,
				"baseFrequency" : 300,
			});
			expect(phaser.get().baseFrequency).to.be.closeTo(300, 0.01);
			expect(phaser.get().octaves).to.be.closeTo(0.21, 0.01);
			phaser.dispose();
		});
	});
});

