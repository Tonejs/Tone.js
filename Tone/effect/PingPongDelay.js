define(["Tone/core/Tone", "Tone/effect/FeedbackDelay", "Tone/signal/Split", "Tone/signal/Merge"], function(Tone){
	/**
	 *  PingPongDelay is a dual delay effect where the echo is heard first in one channel and next in the opposite channel
	 *
	 * 	@constructor
	 * 	@extends {Tone.Effect}
	 *  @param {Tone.Time=} delayTime is the interval between consecutive echos
	 */
	Tone.PingPongDelay = function(delayTime){
		Tone.call(this);

		/**
		 *  merge the delayed signal
		 */
		this._merger = new Tone.Merge();
		/**
		 *  each channel (left/right) gets a feedback delay
		 *  @type {Tone.FeedbackDelay}
		 */
		this.leftDelay = new Tone.FeedbackDelay(delayTime);
		/**
		 *  @type {Tone.FeedbackDelay}
		 */
		this.rightDelay = new Tone.FeedbackDelay(delayTime);

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
		this.setDelayTime(this.defaultArg(delayTime, 0.25));
	};

	Tone.extend(Tone.PingPongDelay);

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

	return Tone.PingPongDelay;
});