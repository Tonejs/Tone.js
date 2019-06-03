import Tone from "../core/Tone";
import "../effect/StereoEffect";
import "../effect/FeedbackEffect";

/**
 *  @class Just like a stereo feedback effect, but the feedback is routed from left to right
 *         and right to left instead of on the same channel.
 *
 *	@constructor
 *	@extends {Tone.StereoEffect}
 */
Tone.StereoXFeedbackEffect = function(){

	var options = Tone.defaults(arguments, ["feedback"], Tone.FeedbackEffect);
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
	 *  @type {Tone.Gain}
	 *  @private
	 */
	this._feedbackLR = new Tone.Gain();

	/**
	 *  the right side feeback
	 *  @type {Tone.Gain}
	 *  @private
	 */
	this._feedbackRL = new Tone.Gain();

	//connect it up
	this.effectReturnL.chain(this._feedbackLR, this.effectSendR);
	this.effectReturnR.chain(this._feedbackRL, this.effectSendL);
	this.feedback.fan(this._feedbackLR.gain, this._feedbackRL.gain);
	this._readOnly(["feedback"]);
};

Tone.extend(Tone.StereoXFeedbackEffect, Tone.StereoEffect);

/**
 *  clean up
 *  @returns {Tone.StereoXFeedbackEffect} this
 */
Tone.StereoXFeedbackEffect.prototype.dispose = function(){
	Tone.StereoEffect.prototype.dispose.call(this);
	this._writable(["feedback"]);
	this.feedback.dispose();
	this.feedback = null;
	this._feedbackLR.dispose();
	this._feedbackLR = null;
	this._feedbackRL.dispose();
	this._feedbackRL = null;
	return this;
};

export default Tone.StereoXFeedbackEffect;

