define(["Tone/core/Tone", "Tone/effects/FeedbackEffect"], function(Tone){
	/**
	 * Feedback Delay creates a effect whose feedback is delayed at a given interval
	 *
	 * @param {Tone.Time=} delayTime
	 */
	Tone.FeedbackDelay = function(delayTime){
		Tone.FeedbackEffect.call(this);

		this.delay = this.context.createDelay(4);
		this.delay.delayTime.value = this.toSeconds(this.defaultArg(delayTime, 0.25));

		// connect it up
		this.connectEffect(this.delay);
	};

	Tone.extend(Tone.FeedbackDelay, Tone.FeedbackEffect);

	/**
	 *  Sets the delay time
	 *  
	 *  @param {Tone.Time} time 
	 */
	Tone.FeedbackDelay.prototype.setDelayTime = function(time){
		this.rampToValueNow(this.delay.delayTime, this.toSeconds(time));
	};

	return Tone.FeedbackDelay;
});