define(["Tone/effect/Effect", "Tone/effect/StereoEffect", "helper/Basic"], function (Effect, StereoEffect, Basic) {

	describe("StereoEffect", function(){

		Basic(StereoEffect);

		context("Stereo", function(){

			it ("extends Effect", function(){
				var stereo = new StereoEffect();
				expect(stereo).to.be.instanceOf(Effect);
				stereo.dispose();
			});

			it ("has a mid and a side send and return", function(){
				var stereo = new StereoEffect();
				expect(stereo).to.have.property("effectSendL");
				expect(stereo).to.have.property("effectSendR");
				expect(stereo).to.have.property("effectReturnL");
				expect(stereo).to.have.property("effectReturnR");
				stereo.dispose();
			});
		});
	});
});