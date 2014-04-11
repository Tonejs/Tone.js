///////////////////////////////////////////////////////////////////////////////
//
//	FEEDBACK DELAY
//
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone", "Tone/effects/FeedbackEffect"], function(Tone){

	//@param {number} delayTime
	Tone.FeedbackDelay = function(delayTime){
		Tone.FeedbackEffect.call(this);

		this.delay = this.context.createDelay(4);
		this.delay.delayTime.value = this.toSeconds(this.defaultArg(delayTime, .25));

		//connect it up
		this.connectEffect(this.delay);
	}

	Tone.extend(Tone.FeedbackDelay, Tone.FeedbackEffect);

	Tone.FeedbackDelay.prototype.setDelayTime = function(delayTime){
		this.rampToValueNow(this.delay.delayTime, this.toSeconds(delayTime));
	}

	return Tone.FeedbackDelay;
});