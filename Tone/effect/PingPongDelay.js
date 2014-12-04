define(["Tone/core/Tone", "Tone/effect/StereoXFeedbackEffect", "Tone/signal/Signal", "Tone/signal/Multiply"], 
function(Tone){

	"use strict";

	/**
	 *  @class  PingPongDelay is a dual delay effect where the echo is heard
	 *          first in one channel and next in the opposite channel
	 *
	 * 	@constructor
	 * 	@extends {Tone.StereoXFeedbackEffect}
	 *  @param {Tone.Time|Object} [delayTime=0.25] is the interval between consecutive echos
	 */
	Tone.PingPongDelay = function(){
		
		var options = this.optionsObject(arguments, ["delayTime"], Tone.PingPongDelay.defaults);
		Tone.StereoXFeedbackEffect.call(this, options);

		/**
		 *  the delay node on the left side
		 *  @type {DelayNode}
		 *  @private
		 */
		this._leftDelay = this.context.createDelay(options.maxDelayTime);

		/**
		 *  the delay node on the right side
		 *  @type {DelayNode}
		 *  @private
		 */
		this._rightDelay = this.context.createDelay(options.maxDelayTime);

		/**
		 *  the predelay on the left side
		 *  @private
		 *  @type {DelayNode}
		 */
		this._leftPreDelay = this.context.createDelay(options.maxDelayTime);

		/**
		 *  the delay time signal
		 *  @type {Tone.Signal}
		 */
		this.delayTime = new Tone.Signal(0);

		//connect it up
		this.effectSendL.chain(this._leftPreDelay, this._leftDelay, this.effectReturnL);
		this.effectSendR.chain(this._rightDelay, this.effectReturnR);
		this.delayTime.fan(this._leftDelay.delayTime, this._rightDelay.delayTime, this._leftPreDelay.delayTime);
		//rearranged the feedback to be after the leftPreDelay
		this._feedbackRL.disconnect();
		this._feedbackRL.connect(this._leftDelay);

		this.setDelayTime(options.delayTime);
	};

	Tone.extend(Tone.PingPongDelay, Tone.StereoXFeedbackEffect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.PingPongDelay.defaults = {
		"delayTime" : 0.25,
		"maxDelayTime" : 1
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
		this._leftPreDelay.disconnect();
		this.delayTime.dispose();
		this._leftDelay = null;
		this._rightDelay = null;
		this._leftPreDelay = null;
		this.delayTime = null;
	};

	return Tone.PingPongDelay;
});