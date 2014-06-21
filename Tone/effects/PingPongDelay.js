define(["Tone/core/Tone", "Tone/effects/FeedbackDelay"], function(Tone){
	/**
	 * PingPongDelay is a dual delay effect where the echo is heard first in one channel and next in the opposite channel
	 * 
	 * @param {Tone.Time} delayTime is the interval between consecutive echos
	 */
	Tone.PingPongDelay = function(delayTime){
		Tone.StereoSplit.call(this);

		//components
		this.leftDelay = new Tone.FeedbackDelay(delayTime);
		this.rightDelay = new Tone.FeedbackDelay(delayTime);

		//connect it up
		this.connectLeft(this.leftDelay);
		this.connectRight(this.rightDelay);

		//disconnect the feedback lines to connect them to the other delay
		// http://jvzaudio.files.wordpress.com/2011/04/delay-f43.gif
		this.leftDelay.feedback.disconnect();
		this.rightDelay.feedback.disconnect();
		this.leftDelay.feedback.connect(this.rightDelay.effectSend);
		this.rightDelay.feedback.connect(this.leftDelay.effectSend);

		//initial vals;
		this.setDelayTime(delayTime);
	};

	Tone.extend(Tone.PingPongDelay, Tone.StereoSplit);

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