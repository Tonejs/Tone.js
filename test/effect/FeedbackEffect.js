import Effect from "Tone/effect/Effect";
import FeedbackEffect from "Tone/effect/FeedbackEffect";
import Basic from "helper/Basic";
describe("FeedbackEffect", function(){
	Basic(FeedbackEffect);

	context("API", function(){

		it("extends Effect", function(){
			var feedbackEffect = new FeedbackEffect();
			expect(feedbackEffect).to.be.instanceOf(Effect);
			feedbackEffect.dispose();
		});

		it("has a feedback signal", function(){
			var feedbackEffect = new FeedbackEffect();
			expect(feedbackEffect).to.have.property("feedback");
			feedbackEffect.dispose();
		});

		it("can set the feedback amount", function(){
			var feedbackEffect = new FeedbackEffect();
			feedbackEffect.feedback.value = 1;
			expect(feedbackEffect.feedback.value).to.be.closeTo(1, 0.001);
			feedbackEffect.feedback.value = 0.22;
			expect(feedbackEffect.feedback.value).to.be.closeTo(0.22, 0.001);
			feedbackEffect.dispose();
		});
	});
});

