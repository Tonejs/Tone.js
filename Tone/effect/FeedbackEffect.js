define(["Tone/core/Tone", "Tone/effect/Effect", "Tone/signal/Signal"], function(Tone){
	/**
	 * Feedback Effect (a sound loop between an audio source and its own output)
	 *
	 *  @constructor
	 *  @extends {Tone.Effect}
	 *  @param {number=} [initialFeedback=0.25] the initial feedback value (defaults to 0.25)
	 */
	Tone.FeedbackEffect = function(initialFeedback){
		Tone.Effect.call(this);

		/**
		 *  controls the amount of feedback
		 *  @type {Tone.Signal}
		 */
		this.feedback = new Tone.Signal(this.defaultArg(initialFeedback, 0.25));
		
		/**
		 *  the gain which controls the feedback
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedbackGain = this.context.createGain();

		//the feedback loop
		this.chain(this.effectReturn, this._feedbackGain, this.effectSend);
		this.feedback.connect(this._feedbackGain.gain);
	};

	Tone.extend(Tone.FeedbackEffect, Tone.Effect);

	/**
	 *  set the feedback amount
	 *
	 *  @param {number} value  the amount of feedback
	 *  @param {Tone.Time=} rampTime (optionally) set the ramp time it takes 
	 *                               to reach the new feedback value
	 */
	Tone.FeedbackEffect.prototype.setFeedback = function(value, rampTime){
		if (rampTime){
			this.feedback.linearRampToValueNow(value, rampTime);
		} else {
			this.feedback.setValue(value);
		}
	};

	/**
	 *  the parents dispose method
	 *  @private
	 *  @borrows Tone.Effect.dispose as Tone.FeedbackEffect._effectDispose
	 */
	Tone.FeedbackEffect.prototype._effectDispose = Tone.Effect.prototype.dispose;

	/**
	 *  clean up
	 */
	Tone.FeedbackEffect.prototype.dispose = function(){
		this._effectDispose();
		this.feedback.dispose();
		this._feedbackGain.disconnect();
		this.feedback = null;
		this._feedbackGain = null;
	};

	return Tone.FeedbackEffect;
});
