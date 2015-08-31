define(["Tone/effect/Effect", "Tone/effect/StereoXFeedbackEffect", "helper/Basic"], function (Effect, StereoXFeedbackEffect, Basic) {

	describe("StereoXFeedbackEffect", function(){

		Basic(StereoXFeedbackEffect);

		context("Feedback Effect", function(){

			it ("extends Effect", function(){
				var stereoFeedback = new StereoXFeedbackEffect();
				expect(stereoFeedback).to.be.instanceOf(Effect);
				stereoFeedback.dispose();
			});

			it ("has a feedback signal", function(){
				var stereoFeedback = new StereoXFeedbackEffect();
				expect(stereoFeedback).to.have.property("feedback");
				expect(stereoFeedback.feedback).to.have.property("value");
				stereoFeedback.dispose();
			});

			it ("has a mid and a side send and return", function(){
				var stereoFeedback = new StereoXFeedbackEffect();
				expect(stereoFeedback).to.have.property("effectSendL");
				expect(stereoFeedback).to.have.property("effectSendR");
				expect(stereoFeedback).to.have.property("effectReturnL");
				expect(stereoFeedback).to.have.property("effectReturnR");
				stereoFeedback.dispose();
			});
		});
	});
});