define(["Tone/effect/Freeverb", "helper/Basic", "helper/EffectTests"], function (Freeverb, Basic, EffectTests) {
	
	describe("Freeverb", function(){

		Basic(Freeverb);
		EffectTests(Freeverb);

		context("API", function(){

			it ("can pass in options in the constructor", function(){
				var reverb = new Freeverb({
					"dampening" : 2000,
					"roomSize" : 0.2,
				});
				expect(reverb.dampening.value).to.be.closeTo(2000, 0.01);
				expect(reverb.roomSize.value).to.be.closeTo(0.2, 0.01);
				reverb.dispose();
			});

			it ("can get/set the options", function(){
				var reverb = new Freeverb();
				reverb.set({
					"roomSize" : 0.23,
				});
				expect(reverb.get().roomSize).to.be.closeTo(0.23, 0.01);
				reverb.dispose();
			});
		});
	});
});