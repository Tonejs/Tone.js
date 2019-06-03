import FeedbackDelay from "Tone/effect/FeedbackDelay";
import Basic from "helper/Basic";
import EffectTests from "helper/EffectTests";
import FeedbackEffect from "Tone/effect/FeedbackEffect";

describe("FeedbackDelay", function(){

	Basic(FeedbackDelay);
	EffectTests(FeedbackDelay, 0.01);

	context("API", function(){

		it("extends FeedbackEffect", function(){
			var feedbackDelay = new FeedbackDelay(0.2, 0.3);
			expect(feedbackDelay).to.be.instanceOf(FeedbackEffect);
			feedbackDelay.dispose();
		});

		it("parses constructor arguments correctly", function(){
			var feedbackDelay = new FeedbackDelay(0.1, 0.4);
			expect(feedbackDelay.delayTime.value).to.be.closeTo(0.1, 0.01);
			expect(feedbackDelay.feedback.value).to.be.closeTo(0.4, 0.01);
			feedbackDelay.dispose();
		});

		it("can pass in options in the constructor", function(){
			var feedbackDelay = new FeedbackDelay({
				"delayTime" : 0.2,
				"feedback" : 0.3
			});
			expect(feedbackDelay.delayTime.value).to.be.closeTo(0.2, 0.01);
			expect(feedbackDelay.feedback.value).to.be.closeTo(0.3, 0.01);
			feedbackDelay.dispose();
		});

		it("can get/set the options", function(){
			var feedbackDelay = new FeedbackDelay();
			feedbackDelay.set({
				"feedback" : 0.4,
			});
			expect(feedbackDelay.get().feedback).to.be.closeTo(0.4, 0.01);
			feedbackDelay.dispose();
		});
	});
});

