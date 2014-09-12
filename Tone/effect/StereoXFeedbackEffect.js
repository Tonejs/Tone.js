define(["Tone/core/Tone", "Tone/effect/StereoEffect", "Tone/effect/FeedbackEffect"], 
function(Tone){

	"use strict";

	/**
	 *  @class Just like a stereo feedback effect, but the feedback is routed from left to right
	 *         and right to left instead of on the same channel.
	 *
	 *	@constructor
	 *	@extends {Tone.FeedbackEffect}
	 */
	Tone.StereoXFeedbackEffect = function(){

		var options = this.optionsObject(arguments, ["feedback"], Tone.FeedbackEffect.defaults);
		Tone.StereoEffect.call(this, options);

		/**
		 *  controls the amount of feedback
		 *  @type {Tone.Signal}
		 */
		this.feedback = new Tone.Signal(options.feedback);

		/**
		 *  scales the feedback in half
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._half = new Tone.Multiply(0.5);

		/**
		 *  the left side feeback
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedbackLR = this.context.createGain();

		/**
		 *  the right side feeback
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedbackRL = this.context.createGain();

		//connect it up
		this.chain(this.effectReturnL, this._feedbackLR, this.effectSendR);
		this.chain(this.effectReturnR, this._feedbackRL, this.effectSendL);
		this.feedback.connect(this._half);
		this.fan(this._half, this._feedbackLR.gain, this._feedbackRL.gain);
	};

	Tone.extend(Tone.StereoXFeedbackEffect, Tone.FeedbackEffect);

	/**
	 *  clean up
	 */
	Tone.StereoXFeedbackEffect.prototype.dispose = function(){
		Tone.StereoEffect.prototype.dispose.call(this);
		this.feedback.dispose();
		this._half.dispose();
		this._feedbackLR.disconnect();
		this._feedbackRL.disconnect();
		this.feedback = null;
		this._feedbackLR = null;
		this._feedbackRL = null;
		this._half = null;
	};

	return Tone.StereoXFeedbackEffect;
});