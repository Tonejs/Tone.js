define(["Tone/core/Tone", "Tone/effect/FeedbackEffect", "Tone/signal/Signal"], function(Tone){
	/**
	 *  A feedback delay
	 *
	 *  @constructor
	 *  @extends {Tone.FeedbackEffect}
	 *  @param {Tone.Time=} delayTime
	 */
	Tone.FeedbackDelay = function(delayTime){
		
		Tone.FeedbackEffect.call(this);

		/**
		 *  Tone.Signal to control the delay amount
		 *  @type {Tone.Signal}
		 */
		this.delayTime = new Tone.Signal();

		/**
		 *  the delay node
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delayNode = this.context.createDelay(4);

		// connect it up
		this.connectEffect(this._delayNode);
		this.delayTime.connect(this._delayNode.delayTime);
		//set the initial delay
		this.setDelayTime(this.defaultArg(delayTime, 0.25));
	};

	Tone.extend(Tone.FeedbackDelay, Tone.FeedbackEffect);

	/**
	 *  Sets the delay time
	 *  
	 *  @param {Tone.Time} delayTime 
	 *  @param {Tone.Time=} rampTime time it takes to reach the desired delayTime
	 */
	Tone.FeedbackDelay.prototype.setDelayTime = function(delayTime, rampTime){
		if (rampTime){
			this.delayTime.linearRampToValueNow(this.toSeconds(delayTime), rampTime);
		} else {
			this.delayTime.setValue(this.toSeconds(delayTime));
		}
	};

	/**
	 *  pointer to the feedback effects dispose method
	 *  @borrows Tone.FeedbackDelay._feedbackEffectDispose as Tone.FeedbackEffect.dispose;
	 */
	Tone.FeedbackDelay.prototype._feedbackEffectDispose = Tone.FeedbackEffect.prototype.dispose;

	/**
	 *  clean up
	 */
	Tone.FeedbackDelay.prototype.dispose = function(){
		this._feedbackEffectDispose();
		this.delayTime.dispose();
		this._delayNode.disconnect();
		this._delayNode = null;
		this.delayTime = null;
	};

	return Tone.FeedbackDelay;
});