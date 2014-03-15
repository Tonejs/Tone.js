///////////////////////////////////////////////////////////////////////////////
//
//	FEEDBACK DELAY
//
///////////////////////////////////////////////////////////////////////////////

//@param {number} delayTime
AudioUnit.FeedbackDelay = function(delayTime){
	AudioUnit.FeedbackEffect.call(this);

	this.delay = this.context.createDelay(4);
	this.delay.delayTime.value = this.defaultArg(delayTime, .25);

	//connect it up
	this.connectEffect(this.delay);
}

AudioUnit.extend(AudioUnit.FeedbackDelay, AudioUnit.FeedbackEffect);

AudioUnit.FeedbackDelay.prototype.setDelayTime = function(delayTime){
	this.rampToValue(this.delay.delayTime, delayTime);
}