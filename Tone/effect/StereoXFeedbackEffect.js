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
		 *  The amount of feedback from the output
		 *  back into the input of the effect (routed
		 *  across left and right channels).
		 *  @type {NormalRange}
		 *  @signal
		 */
		this.feedback = new Tone.Signal(options.feedback, Tone.Type.NormalRange);

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
		this.effectReturnL.chain(this._feedbackLR, this.effectSendR);
		this.effectReturnR.chain(this._feedbackRL, this.effectSendL);
		this.feedback.fan(this._feedbackLR.gain, this._feedbackRL.gain);
		this._readOnly(["feedback"]);
	};

	Tone.extend(Tone.StereoXFeedbackEffect, Tone.FeedbackEffect);

	/**
	 *  clean up
	 *  @returns {Tone.StereoXFeedbackEffect} this
	 */
	Tone.StereoXFeedbackEffect.prototype.dispose = function(){
		Tone.StereoEffect.prototype.dispose.call(this);
		this._writable(["feedback"]);
		this.feedback.dispose();
		this.feedback = null;
		this._feedbackLR.disconnect();
		this._feedbackLR = null;
		this._feedbackRL.disconnect();
		this._feedbackRL = null;
		return this;
	};

	return Tone.StereoXFeedbackEffect;
});