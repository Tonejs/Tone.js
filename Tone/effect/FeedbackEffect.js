define(["Tone/core/Tone", "Tone/effect/Effect", "Tone/signal/Signal", "Tone/signal/Multiply"], function(Tone){

	"use strict";
	
	/**
	 * 	@class  Tone.FeedbackEffect provides a loop between an 
	 * 	        audio source and its own output. This is a base-class
	 * 	        for feedback effects. 
	 *
	 *  @constructor
	 *  @extends {Tone.Effect}
	 *  @param {NormalRange|Object} [feedback] The initial feedback value.
	 */
	Tone.FeedbackEffect = function(){

		var options = this.optionsObject(arguments, ["feedback"]);
		options = this.defaultArg(options, Tone.FeedbackEffect.defaults);

		Tone.Effect.call(this, options);

		/**
		 *  The amount of signal which is fed back into the effect input. 
		 *  @type {NormalRange}
		 *  @signal
		 */
		this.feedback = new Tone.Signal(options.feedback, Tone.Type.NormalRange);
		
		/**
		 *  the gain which controls the feedback
		 *  @type {GainNode}
		 *  @private
		 */
		this._feedbackGain = this.context.createGain();

		//the feedback loop
		this.effectReturn.chain(this._feedbackGain, this.effectSend);
		this.feedback.connect(this._feedbackGain.gain);
		this._readOnly(["feedback"]);
	};

	Tone.extend(Tone.FeedbackEffect, Tone.Effect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.FeedbackEffect.defaults = {
		"feedback" : 0.125
	};

	/**
	 *  Clean up. 
	 *  @returns {Tone.FeedbackEffect} this
	 */
	Tone.FeedbackEffect.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._writable(["feedback"]);
		this.feedback.dispose();
		this.feedback = null;
		this._feedbackGain.disconnect();
		this._feedbackGain = null;
		return this;
	};

	return Tone.FeedbackEffect;
});
