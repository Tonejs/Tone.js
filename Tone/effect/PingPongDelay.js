define(["Tone/core/Tone", "Tone/effect/StereoXFeedbackEffect", "Tone/signal/Signal", "Tone/core/Delay"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.PingPongDelay is a feedback delay effect where the echo is heard
	 *          first in one channel and next in the opposite channel. In a stereo
	 *          system these are the right and left channels.
	 *          PingPongDelay in more simplified terms is two Tone.FeedbackDelays
	 *          with independent delay values. Each delay is routed to one channel
	 *          (left or right), and the channel triggered second will always
	 *          trigger at the same interval after the first.
	 *
	 * 	@constructor
	 * 	@extends {Tone.StereoXFeedbackEffect}
	 *  @param {Time|Object} [delayTime] The delayTime between consecutive echos.
	 *  @param {NormalRange=} feedback The amount of the effected signal which
	 *                                 is fed back through the delay.
	 *  @example
	 * var pingPong = new Tone.PingPongDelay("4n", 0.2).toMaster();
	 * var drum = new Tone.DrumSynth().connect(pingPong);
	 * drum.triggerAttackRelease("C4", "32n");
	 */
	Tone.PingPongDelay = function(){

		var options = Tone.defaults(arguments, ["delayTime", "feedback"], Tone.PingPongDelay);
		Tone.StereoXFeedbackEffect.call(this, options);

		/**
		 *  the delay node on the left side
		 *  @type {Tone.Delay}
		 *  @private
		 */
		this._leftDelay = new Tone.Delay(0, options.maxDelayTime);

		/**
		 *  the delay node on the right side
		 *  @type {Tone.Delay}
		 *  @private
		 */
		this._rightDelay = new Tone.Delay(0, options.maxDelayTime);

		/**
		 *  the predelay on the right side
		 *  @type {Tone.Delay}
		 *  @private
		 */
		this._rightPreDelay = new Tone.Delay(0, options.maxDelayTime);

		/**
		 *  the delay time signal
		 *  @type {Time}
		 *  @signal
		 */
		this.delayTime = new Tone.Signal(options.delayTime, Tone.Type.Time);

		//connect it up
		this.effectSendL.chain(this._leftDelay, this.effectReturnL);
		this.effectSendR.chain(this._rightPreDelay, this._rightDelay, this.effectReturnR);
		this.delayTime.fan(this._leftDelay.delayTime, this._rightDelay.delayTime, this._rightPreDelay.delayTime);
		//rearranged the feedback to be after the rightPreDelay
		this._feedbackLR.disconnect();
		this._feedbackLR.connect(this._rightDelay);
		this._readOnly(["delayTime"]);
	};

	Tone.extend(Tone.PingPongDelay, Tone.StereoXFeedbackEffect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.PingPongDelay.defaults = {
		"delayTime" : 0.25,
		"maxDelayTime" : 1
	};

	/**
	 *  Clean up.
	 *  @returns {Tone.PingPongDelay} this
	 */
	Tone.PingPongDelay.prototype.dispose = function(){
		Tone.StereoXFeedbackEffect.prototype.dispose.call(this);
		this._leftDelay.dispose();
		this._leftDelay = null;
		this._rightDelay.dispose();
		this._rightDelay = null;
		this._rightPreDelay.dispose();
		this._rightPreDelay = null;
		this._writable(["delayTime"]);
		this.delayTime.dispose();
		this.delayTime = null;
		return this;
	};

	return Tone.PingPongDelay;
});
