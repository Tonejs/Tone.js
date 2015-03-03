define(["Tone/core/Tone", "Tone/effect/StereoXFeedbackEffect", "Tone/signal/Signal"], 
function(Tone){

	"use strict";

	/**
	 *  @class  PingPongDelay is a dual delay effect where the echo is heard
	 *          first in one channel and next in the opposite channel
	 *
	 * 	@constructor
	 * 	@extends {Tone.StereoXFeedbackEffect}
	 *  @param {Tone.Time|Object} [delayTime=0.25] is the interval between consecutive echos
	 *  @param {number=} feedback The amount of the effected signal which 
	 *                            is fed back through the delay.
	 *  @example
	 *  var pingPong = new Tone.PingPongDelay("4n", 0.2);
	 */
	Tone.PingPongDelay = function(){
		
		var options = this.optionsObject(arguments, ["delayTime", "feedback"], Tone.PingPongDelay.defaults);
		Tone.StereoXFeedbackEffect.call(this, options);

		/**
		 *  the delay node on the left side
		 *  @type {DelayNode}
		 *  @private
		 */
		this._leftDelay = this.context.createDelay(options.maxDelayTime);

		/**
		 *  the delay node on the right side
		 *  @type {DelayNode}
		 *  @private
		 */
		this._rightDelay = this.context.createDelay(options.maxDelayTime);

		/**
		 *  the predelay on the right side
		 *  @type {DelayNode}
		 *  @private
		 */
		this._rightPreDelay = this.context.createDelay(options.maxDelayTime);

		/**
		 *  the delay time signal
		 *  @type {Tone.Signal}
		 */
		this.delayTime = new Tone.Signal(options.delayTime, Tone.Signal.Units.Time);

		//connect it up
		this.effectSendL.chain(this._leftDelay, this.effectReturnL);
		this.effectSendR.chain(this._rightPreDelay, this._rightDelay, this.effectReturnR);
		this.delayTime.fan(this._leftDelay.delayTime, this._rightDelay.delayTime, this._rightPreDelay.delayTime);
		//rearranged the feedback to be after the rightPreDelay
		this._feedbackLR.disconnect();
		this._feedbackLR.connect(this._rightDelay);
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
	 *  clean up
	 *  @returns {Tone.PingPongDelay} `this`
	 */
	Tone.PingPongDelay.prototype.dispose = function(){
		Tone.StereoXFeedbackEffect.prototype.dispose.call(this);
		this._leftDelay.disconnect();
		this._leftDelay = null;
		this._rightDelay.disconnect();
		this._rightDelay = null;
		this._rightPreDelay.disconnect();
		this._rightPreDelay = null;
		this.delayTime.dispose();
		this.delayTime = null;
		return this;
	};

	return Tone.PingPongDelay;
});