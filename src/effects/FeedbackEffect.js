///////////////////////////////////////////////////////////////////////////////
//
//  FEEDBACK EFFECTS
//
// 	an effect with feedback
///////////////////////////////////////////////////////////////////////////////


AudioUnit.FeedbackEffect = function(){
	//extends Unit
	AudioUnit.Effect.call(this);

	this.feedback = this.context.createGain();
	//feedback loop
	this.chain(this.effectReturn, this.feedback, this.effectSend);

	//some initial values
	this.setDry(.5);
}

AudioUnit.extend(AudioUnit.FeedbackEffect, AudioUnit.Effect);


AudioUnit.Effect.prototype.setFeedback = function(fback){
	this.rampToValue(this.feedback.gain, fback);
}
