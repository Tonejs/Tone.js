///////////////////////////////////////////////////////////////////////////////
//
//	PING PONG DELAY
//
///////////////////////////////////////////////////////////////////////////////

//@param {number=} delayTime
WebAudio.PingPongDelay = function(delayTime){
	WebAudio.StereoSplit.call(this);

	//components
	this.leftDelay = new WebAudio.FeedbackDelay(delayTime);
	this.rightDelay = new WebAudio.FeedbackDelay(delayTime);


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
}

WebAudio.extend(WebAudio.PingPongDelay, WebAudio.StereoSplit);

//@param {number} delayTime
WebAudio.PingPongDelay.prototype.setDelayTime = function(delayTime){
	this.leftDelay.setDelayTime(delayTime);
	this.rightDelay.setDelayTime(delayTime * 2);
}

//@param {number} feedback (0 - 1)
WebAudio.PingPongDelay.prototype.setFeedback = function(feedback){
	this.leftDelay.setFeedback(feedback);
	this.rightDelay.setFeedback(feedback);
}

//@param {number} wet (0 - 1)
WebAudio.PingPongDelay.prototype.setWet = function(wet){
	this.leftDelay.setWet(wet);
	this.rightDelay.setWet(wet);
}

//@param {number} dry (0 - 1)
WebAudio.PingPongDelay.prototype.setDry = function(dry){
	this.leftDelay.setDry(dry);
	this.rightDelay.setDry(dry);
}