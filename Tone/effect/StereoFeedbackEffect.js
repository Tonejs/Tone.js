define(["Tone/core/Tone", "Tone/effect/StereoEffect", "Tone/effect/FeedbackEffect"], 
function(Tone){

	"use strict";

	/**
	 *  @class A stereo feedback effect where the feedback is on the same channel
	 *
	 *	@constructor
	 *	@extends {Tone.FeedbackEffect}
	 */
	Tone.StereoFeedbackEffect = function(){

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
		this._feedbackL = this.context.createGain();

		/**
		 *  the right side feeback
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedbackR = this.context.createGain();

		//connect it up
		this.chain(this.effectReturnL, this._feedbackL, this.effectSendL);
		this.chain(this.effectReturnR, this._feedbackR, this.effectSendR);
		this.feedback.connect(this._half);
		this.fan(this._half, this._feedbackL.gain, this._feedbackR.gain);
	};

	Tone.extend(Tone.StereoFeedbackEffect, Tone.FeedbackEffect);

	/**
	 *  clean up
	 */
	Tone.StereoFeedbackEffect.prototype.dispose = function(){
		Tone.StereoEffect.prototype.dispose.call(this);
		this.feedback.dispose();
		this._half.dispose();
		this._feedbackL.disconnect();
		this._feedbackR.disconnect();
		this.feedback = null;
		this._feedbackL = null;
		this._feedbackR = null;
		this._half = null;
	};

	return Tone.StereoFeedbackEffect;
});