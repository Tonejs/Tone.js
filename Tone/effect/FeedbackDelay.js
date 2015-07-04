define(["Tone/core/Tone", "Tone/effect/FeedbackEffect", "Tone/signal/Signal"], function(Tone){

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
		
		var options = this.optionsObject(arguments, ["delayTime", "feedback"], Tone.FeedbackDelay.defaults);
		Tone.FeedbackEffect.call(this, options);

		/**
		 *  The delayTime of the DelayNode. 
		 *  @type {Time}
		 *  @signal
		 */
		this.delayTime = new Tone.Signal(options.delayTime, Tone.Type.Time);

		/**
		 *  the delay node
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delayNode = this.context.createDelay(4);

		// connect it up
		this.connectEffect(this._delayNode);
		this.delayTime.connect(this._delayNode.delayTime);
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
	};

	/**
	 *  clean up
	 *  @returns {Tone.FeedbackDelay} this
	 */
	Tone.FeedbackDelay.prototype.dispose = function(){
		Tone.FeedbackEffect.prototype.dispose.call(this);
		this.delayTime.dispose();
		this._delayNode.disconnect();
		this._delayNode = null;
		this._writable(["delayTime"]);
		this.delayTime = null;
		return this;
	};

	return Tone.FeedbackDelay;
});