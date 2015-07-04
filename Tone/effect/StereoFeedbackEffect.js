define(["Tone/core/Tone", "Tone/effect/StereoEffect", "Tone/effect/FeedbackEffect"], 
function(Tone){

	"use strict";

	/**
	 *  @class Base class for stereo feedback effects where the effectReturn
	 *         is fed back into the same channel. 
	 *
	 *	@constructor
	 *	@extends {Tone.FeedbackEffect}
	 */
	Tone.StereoFeedbackEffect = function(){

		var options = this.optionsObject(arguments, ["feedback"], Tone.FeedbackEffect.defaults);
		Tone.StereoEffect.call(this, options);

		/**
		 *  controls the amount of feedback
		 *  @type {NormalRange}
		 *  @signal
		 */
		this.feedback = new Tone.Signal(options.feedback, Tone.Type.NormalRange);

		/**
		 *  the left side feeback
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedbackL = this.context.createGain();

		/**
		 *  the right side feeback
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedbackR = this.context.createGain();

		//connect it up
		this.effectReturnL.chain(this._feedbackL, this.effectSendL);
		this.effectReturnR.chain(this._feedbackR, this.effectSendR);
		this.feedback.fan(this._feedbackL.gain, this._feedbackR.gain);
		this._readOnly(["feedback"]);
	};

	Tone.extend(Tone.StereoFeedbackEffect, Tone.FeedbackEffect);

	/**
	 *  clean up
	 *  @returns {Tone.StereoFeedbackEffect} this
	 */
	Tone.StereoFeedbackEffect.prototype.dispose = function(){
		Tone.StereoEffect.prototype.dispose.call(this);
		this._writable(["feedback"]);
		this.feedback.dispose();
		this.feedback = null;
		this._feedbackL.disconnect();
		this._feedbackL = null;
		this._feedbackR.disconnect();
		this._feedbackR = null;
		return this;
	};

	return Tone.StereoFeedbackEffect;
});