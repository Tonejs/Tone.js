///////////////////////////////////////////////////////////////////////////////
//
//  FEEDBACK EFFECTS
//
// 	an effect with feedback
///////////////////////////////////////////////////////////////////////////////


Tone.FeedbackEffect = function(){
	//extends Unit
	Tone.Effect.call(this);

	this.feedback = this.context.createGain();
	//feedback loop
	this.chain(this.effectReturn, this.feedback, this.effectSend);

	//some initial values
	this.setDry(.5);
}

Tone.extend(Tone.FeedbackEffect, Tone.Effect);


Tone.Effect.prototype.setFeedback = function(fback){
	this.rampToValue(this.feedback.gain, fback);
}
