define(["../core/Tone", "../effect/FeedbackEffect", "../signal/Signal", "../core/Delay"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.FeedbackDelay is a DelayNode in which part of output
	 *          signal is fed back into the delay.
	 *
	 *  @constructor
	 *  @extends {Tone.FeedbackEffect}
	 *  @param {Time|Object} [delayTime] The delay applied to the incoming signal.
	 *  @param {NormalRange=} feedback The amount of the effected signal which
	 *                            is fed back through the delay.
	 *  @example
	 * var feedbackDelay = new Tone.FeedbackDelay("8n", 0.5).toMaster();
	 * var tom = new Tone.DrumSynth({
	 * 	"octaves" : 4,
	 * 	"pitchDecay" : 0.1
	 * }).connect(feedbackDelay);
	 * tom.triggerAttackRelease("A2","32n");
	 */
	Tone.FeedbackDelay = function(){

		var options = Tone.defaults(arguments, ["delayTime", "feedback"], Tone.FeedbackDelay);
		Tone.FeedbackEffect.call(this, options);

		/**
		 *  the delay node
		 *  @type {Tone.Delay}
		 *  @private
		 */
		this._delayNode = new Tone.Delay(options.delayTime, options.maxDelay);

		/**
		 *  The delayTime of the DelayNode.
		 *  @type {Time}
		 *  @signal
		 */
		this.delayTime = this._delayNode.delayTime;

		// connect it up
		this.connectEffect(this._delayNode);
		this._readOnly(["delayTime"]);
	};

	Tone.extend(Tone.FeedbackDelay, Tone.FeedbackEffect);

	/**
	 *  The default values.
	 *  @const
	 *  @static
	 *  @type {Object}
	 */
	Tone.FeedbackDelay.defaults = {
		"delayTime" : 0.25,
		"maxDelay" : 1
	};

	/**
	 *  clean up
	 *  @returns {Tone.FeedbackDelay} this
	 */
	Tone.FeedbackDelay.prototype.dispose = function(){
		Tone.FeedbackEffect.prototype.dispose.call(this);
		this._delayNode.dispose();
		this._delayNode = null;
		this._writable(["delayTime"]);
		this.delayTime = null;
		return this;
	};

	return Tone.FeedbackDelay;
});
