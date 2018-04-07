define(["Tone/core/Tone", "Tone/effect/StereoEffect", "Tone/effect/FeedbackEffect", "Tone/core/Gain"], function(Tone){

	"use strict";

	/**
	 *  @class Base class for stereo feedback effects where the effectReturn
	 *         is fed back into the same channel.
	 *
	 *	@constructor
	 *	@extends {Tone.StereoEffect}
	 */
	Tone.StereoFeedbackEffect = function(){

		var options = Tone.defaults(arguments, ["feedback"], Tone.FeedbackEffect);
		Tone.StereoEffect.call(this, options);

		/**
		 *  controls the amount of feedback
		 *  @type {NormalRange}
		 *  @signal
		 */
		this.feedback = new Tone.Signal(options.feedback, Tone.Type.NormalRange);

		/**
		 *  the left side feeback
		 *  @type {Tone.Gain}
		 *  @private
		 */
		this._feedbackL = new Tone.Gain();

		/**
		 *  the right side feeback
		 *  @type {Tone.Gain}
		 *  @private
		 */
		this._feedbackR = new Tone.Gain();

		//connect it up
		this.effectReturnL.chain(this._feedbackL, this.effectSendL);
		this.effectReturnR.chain(this._feedbackR, this.effectSendR);
		this.feedback.fan(this._feedbackL.gain, this._feedbackR.gain);
		this._readOnly(["feedback"]);
	};

	Tone.extend(Tone.StereoFeedbackEffect, Tone.StereoEffect);

	/**
	 *  clean up
	 *  @returns {Tone.StereoFeedbackEffect} this
	 */
	Tone.StereoFeedbackEffect.prototype.dispose = function(){
		Tone.StereoEffect.prototype.dispose.call(this);
		this._writable(["feedback"]);
		this.feedback.dispose();
		this.feedback = null;
		this._feedbackL.dispose();
		this._feedbackL = null;
		this._feedbackR.dispose();
		this._feedbackR = null;
		return this;
	};

	return Tone.StereoFeedbackEffect;
});
