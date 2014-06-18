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

	/**
	 *  sets the delay time
	 *  @param {Tone.Time} time 
	 */
	Tone.FeedbackDelay.prototype.setDelayTime = function(time){
		this.rampToValueNow(this.delay.delayTime, this.toSeconds(time));
	}

	return Tone.FeedbackDelay;
});