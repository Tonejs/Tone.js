///////////////////////////////////////////////////////////////////////////////
//
//  FEEDBACK EFFECTS
//
// 	an effect with feedback
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone", "Tone/effects/Effect"], function(Tone){

	Tone.FeedbackEffect = function(){
		//extends Unit
		Tone.Effect.call(this);

		this.feedback = this.context.createGain();
		//feedback loop
		this.chain(this.effectReturn, this.feedback, this.effectSend);

		//some initial values
		this.setFeedback(0);
	}

	Tone.extend(Tone.FeedbackEffect, Tone.Effect);

	Tone.FeedbackEffect.prototype.setFeedback = function(fback){
		this.rampToValue(this.feedback.gain, fback);
	}

	return Tone.FeedbackEffect;
});
