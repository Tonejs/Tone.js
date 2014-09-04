define(["Tone/core/Tone", "Tone/effect/StereoXFeedbackEffect", "Tone/signal/Signal", "Tone/signal/Multiply"], 
function(Tone){

	"use strict";

	/**
	 *  @class  PingPongDelay is a dual delay effect where the echo is heard
	 *          first in one channel and next in the opposite channel
	 *
	 * 	@constructor
	 * 	@extends {Tone.StereoXFeedbackEffect}
	 *  @param {Tone.Time|Object=} delayTime is the interval between consecutive echos
	 */
	Tone.PingPongDelay = function(){
		
		var options = this.optionsObject(arguments, ["delayTime"], Tone.PingPongDelay.defaults);
		Tone.StereoXFeedbackEffect.call(this, options);

		/**
		 *  the delay node on the left side
		 *  @type {DelayNode}
		 *  @private
		 */
		this._leftDelay = this.context.createDelay();

		/**
		 *  the delay node on the right side
		 *  @type {DelayNode}
		 *  @private
		 */
		this._rightDelay = this.context.createDelay();

		/**
		 *  the delay time signal
		 *  @type {Tone.Signal}
		 */
		this.delayTime = new Tone.Signal(0);

		/**
		 *  double the delayTime
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._timesTwo = new Tone.Multiply(2);

		//connect it up
		this.chain(this.effectSendL, this._leftDelay, this.effectReturnL);
		this.chain(this.effectSendR, this._rightDelay, this.effectReturnR);

		this.delayTime.connect(this._leftDelay.delayTime);
		this.chain(this.delayTime, this._timesTwo, this._rightDelay.delayTime);

		this.setDelayTime(options.delayTime);
	};

	Tone.extend(Tone.PingPongDelay, Tone.StereoXFeedbackEffect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.PingPongDelay.defaults = {
		"delayTime" : 0.25,
	};

	/**
	 * setDelayTime
	 * 
	 * @param {Tone.Time} delayTime
	 */
	Tone.PingPongDelay.prototype.setDelayTime = function(delayTime){
		this.delayTime.setValue(this.toSeconds(delayTime));
	};

	/**
	 *  set all of the parameters with an object
	 *  @param {Object} params 
	 */
	Tone.PingPongDelay.prototype.set = function(params){
		if (!this.isUndef(params.delayTime)) this.setDelayTime(params.delayTime);
		Tone.StereoXFeedbackEffect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.PingPongDelay.prototype.dispose = function(){
		Tone.StereoXFeedbackEffect.prototype.dispose.call(this);
		this._leftDelay.disconnect();
		this._rightDelay.disconnect();
		this._timesTwo.dispose();
		this.delayTime.dispose();
		this._leftDelay = null;
		this._rightDelay = null;
		this._timesTwo = null;
		this.delayTime = null;
	};

	return Tone.PingPongDelay;
});