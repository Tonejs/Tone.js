define(["Tone/core/Tone", "Tone/effect/FeedbackEffect", "Tone/signal/Signal"], function(Tone){

	"use strict";
	
	/**
	 *  @class  A feedback delay
	 *
	 *  @constructor
	 *  @extends {Tone.FeedbackEffect}
	 *  @param {Tone.Time|Object} [delayTime=0.25]
	 */
	Tone.FeedbackDelay = function(){
		
		var options = this.optionsObject(arguments, ["delayTime"], Tone.FeedbackDelay.defaults);
		Tone.FeedbackEffect.call(this, options);

		/**
		 *  Tone.Signal to control the delay amount
		 *  @type {Tone.Signal}
		 */
		this.delayTime = new Tone.Signal(options.delayTime, Tone.Signal.Units.Time);

		/**
		 *  the delay node
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delayNode = this.context.createDelay(4);

		// connect it up
		this.connectEffect(this._delayNode);
		this.delayTime.connect(this._delayNode.delayTime);
	};

	Tone.extend(Tone.FeedbackDelay, Tone.FeedbackEffect);

	/**
	 *  [defaults description]
	 *  @type {Object}
	 */
	Tone.FeedbackDelay.defaults = {
		"delayTime" : 0.25
	};
	
	/**
	 *  clean up
	 *  @returns {Tone.FeedbackDelay} `this`
	 */
	Tone.FeedbackDelay.prototype.dispose = function(){
		Tone.FeedbackEffect.prototype.dispose.call(this);
		this.delayTime.dispose();
		this._delayNode.disconnect();
		this._delayNode = null;
		this.delayTime = null;
		return this;
	};

	return Tone.FeedbackDelay;
});