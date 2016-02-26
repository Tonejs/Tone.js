define(["Tone/effect/StereoWidener", "helper/Basic", "helper/EffectTests"], function (StereoWidener, Basic, EffectTests) {
	
	describe("StereoWidener", function(){

		Basic(StereoWidener);
		EffectTests(StereoWidener, 0);

		context("API", function(){

			it ("can pass in options in the constructor", function(){
				var widener = new StereoWidener({
					"width" : 0.2,
				});
				expect(widener.width.value).to.be.closeTo(0.2, 0.001);
				widener.dispose();
			});

			it ("can get/set the options", function(){
				var widener = new StereoWidener();
				widener.set({
					"width" : 0.4,
				});
				expect(widener.width.value).to.be.closeTo(0.4, 0.001);
				widener.dispose();
			});
		});
	});
});