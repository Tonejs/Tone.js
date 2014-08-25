define(["Tone/core/Tone", "Tone/effect/FeedbackDelay", "Tone/component/Split", "Tone/component/Merge"], function(Tone){
	/**
	 *  PingPongDelay is a dual delay effect where the echo is heard first in one channel and next in the opposite channel
	 *
	 * 	@constructor
	 * 	@extends {Tone}
	 *  @param {Tone.Time|Object=} delayTime is the interval between consecutive echos
	 */
	Tone.PingPongDelay = function(){
		
		var options = this.optionsObject(arguments, ["delayTime"], Tone.PingPongDelay.defaults);
		Tone.call(this);

		/**
		 *  merge the delayed signal
		 *  @type {Tone.Merge}
		 *  @private
		 */
		this._merger = new Tone.Merge();

		/**
		 *  each channel (left/right) gets a feedback delay
		 *  @type {Tone.FeedbackDelay}
		 */
		this.leftDelay = new Tone.FeedbackDelay();

		/**
		 *  @type {Tone.FeedbackDelay}
		 */
		this.rightDelay = new Tone.FeedbackDelay();

		//connect it up
		this.input.connect(this.leftDelay);
		this.input.connect(this.rightDelay);
		//disconnect the feedback lines to connect them to the other delay
		// http://jvzaudio.files.wordpress.com/2011/04/delay-f43.gif
		this.leftDelay._feedbackGain.disconnect();
		this.rightDelay._feedbackGain.disconnect();
		this.leftDelay._feedbackGain.connect(this.rightDelay.effectSend);
		this.rightDelay._feedbackGain.connect(this.leftDelay.effectSend);
		this.leftDelay.connect(this._merger.left);
		this.rightDelay.connect(this._merger.right);
		this._merger.connect(this.output);
		//initial vals;
		this.setDelayTime(options.delayTime);
		this.setFeedback(options.feedback);
	};

	Tone.extend(Tone.PingPongDelay);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.PingPongDelay.defaults = {
		"delayTime" : 0.25,
		"feedback" : 0.4,
	};

	/**
	 * setDelayTime
	 * 
	 * @param {Tone.Time} delayTime
	 */
	Tone.PingPongDelay.prototype.setDelayTime = function(delayTime){
		this.leftDelay.setDelayTime(delayTime);
		this.rightDelay.setDelayTime(delayTime * 2);
	};

	/**
	 * setFeedback
	 *
	 * @param {number} feedback (0 - 1)
	 */
	Tone.PingPongDelay.prototype.setFeedback = function(feedback){
		this.leftDelay.setFeedback(feedback);
		this.rightDelay.setFeedback(feedback);
	};

	/**
	 * setWet
	 *
	 * @param {number} wet (0 - 1)
	 */
	Tone.PingPongDelay.prototype.setWet = function(wet){
		this.leftDelay.setWet(wet);
		this.rightDelay.setWet(wet);
	};

	/**
	 * setDry
	 *
	 * @param {number} dry (0 - 1)
	 */
	Tone.PingPongDelay.prototype.setDry = function(dry){
		this.leftDelay.setDry(dry);
		this.rightDelay.setDry(dry);
	};

	/**
	 *  set all of the parameters with an object
	 *  @param {Object} params 
	 */
	Tone.PingPongDelay.prototype.set = function(params){
		if (!this.isUndef(params.feedback)) this.setFeedback(params.feedback);
		if (!this.isUndef(params.wet)) this.setWet(params.wet);
		if (!this.isUndef(params.dry)) this.setDry(params.dry);
		if (!this.isUndef(params.delayTime)) this.setDelayTime(params.delayTime);
	};

	/**
	 *  clean up
	 */
	Tone.PingPongDelay.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.leftDelay.dispose();
		this.rightDelay.dispose();
		this._merger.dispose();
		this.leftDelay = null;
		this.rightDelay = null;
		this._merger = null;
	};

	return Tone.PingPongDelay;
});