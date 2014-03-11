///////////////////////////////////////////////////////////////////////////////
//
//	FEEDBACK DELAY
//
///////////////////////////////////////////////////////////////////////////////

//@param {number} delayTime
WebAudio.FeedbackDelay = function(delayTime){
	WebAudio.Effect.call(this);

	this.delay = WebAudio.createDelay(4);
	this.delay.delayTime.value = this.defaultArgument(delayTime, .25);

	//connect it up
	this.connectEffect(this.delay);
}

WebAudio.extend(WebAudio.FeedbackDelay, WebAudio.Effect);

WebAudio.FeedbackDelay.prototype.setDelayTime = function(delayTime){
	this.rampToValue(this.delay.delayTime, delayTime);
}