define(["Tone/core/Tone", "Tone/component/LFO", "Tone/effect/StereoXFeedbackEffect"], 
function(Tone){

	"use strict";

	/**
	 *  @class A Chorus effect with feedback. inspiration from https://github.com/Dinahmoe/tuna/blob/master/tuna.js
	 *
	 *	@constructor
	 *	@extends {Tone.StereoXFeedbackEffect}
	 *	@param {number|Object=} [rate=2] the rate of the effect
	 *	@param {number=} [delayTime=3.5] the delay of the chorus effect in ms
	 *	@param {number=} [depth=0.7] the depth of the chorus
	 */
	Tone.Chorus = function(){

		var options = this.optionsObject(arguments, ["rate", "delayTime", "depth"], Tone.Chorus.defaults);
		Tone.StereoXFeedbackEffect.call(this, options);

		/**
		 *  the depth of the chorus
		 *  @type {number}
		 *  @private
		 */
		this._depth = options.depth;

		/**
		 *  the delayTime
		 *  @type {number}
		 *  @private
		 */
		this._delayTime = options.delayTime / 1000;

		/**
		 *  the lfo which controls the delayTime
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfoL = new Tone.LFO(options.rate, 0, 1);

		/**
		 *  another LFO for the right side with a 180 degree phase diff
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfoR = new Tone.LFO(options.rate, 0, 1);
		this._lfoR.setPhase(180);

		/**
		 *  delay for left
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delayNodeL = this.context.createDelay();

		/**
		 *  delay for right
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delayNodeR = this.context.createDelay();

		//connections
		this.chain(this.effectSendL, this._delayNodeL, this.effectReturnL);
		this.chain(this.effectSendR, this._delayNodeR, this.effectReturnR);
		//and pass through
		this.effectSendL.connect(this.effectReturnL);
		this.effectSendR.connect(this.effectReturnR);
		//lfo setup
		this._lfoL.connect(this._delayNodeL.delayTime);
		this._lfoR.connect(this._delayNodeR.delayTime);
		//start the lfo
		this._lfoL.start();
		this._lfoR.start();
		//have one LFO frequency control the other
		this._lfoL.frequency.connect(this._lfoR.frequency);
		//set the initial values
		this.setDepth(this._depth);
		this.setRate(options.rate);
		this.setType(options.type);
	};

	Tone.extend(Tone.Chorus, Tone.StereoXFeedbackEffect);

	/**
	 *  @static
	 *  @type {Object}
	 */
	Tone.Chorus.defaults = {
		"rate" : 1.5, 
		"delayTime" : 3.5,
		"depth" : 0.7,
		"feedback" : 0.4,
		"type" : "sine"
	};

	/**
	 *  set the depth of the chorus
	 *  @param {number} depth
	 */
	Tone.Chorus.prototype.setDepth = function(depth){
		this._depth = depth;
		var deviation = this._delayTime * depth;
		this._lfoL.setMin(this._delayTime - deviation);
		this._lfoL.setMax(this._delayTime + deviation);
		this._lfoR.setMin(this._delayTime - deviation);
		this._lfoR.setMax(this._delayTime + deviation);
	};

	/**
	 *  set the delay time
	 *  @param {number} delayTime in milliseconds
	 */
	Tone.Chorus.prototype.setDelayTime = function(delayTime){
		this._delayTime = delayTime / 1000;
		this.setDepth(this._depth);
	};

	/**
	 *  set the chorus rate
	 *  @param {number} rate in hertz
	 */
	Tone.Chorus.prototype.setRate = function(rate){
		this._lfoL.setFrequency(rate);
	};

	/**
	 *  set the LFO type
	 *  @param {number} type
	 */
	Tone.Chorus.prototype.setType = function(type){
		this._lfoL.setType(type);
		this._lfoR.setType(type);
	};

	/**
	 *  set multiple parameters at once with an object
	 *  @param {Object} params the parameters as an object
	 */
	Tone.Chorus.prototype.set = function(params){
		if (!this.isUndef(params.rate)) this.setRate(params.rate);
		if (!this.isUndef(params.delayTime)) this.setDelayTime(params.delayTime);
		if (!this.isUndef(params.depth)) this.setDepth(params.depth);
		if (!this.isUndef(params.type)) this.setType(params.type);
		Tone.FeedbackEffect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.Chorus.prototype.dispose = function(){
		Tone.StereoXFeedbackEffect.prototype.dispose.call(this);
		this._lfoL.dispose();
		this._lfoR.dispose();
		this._delayNodeL.disconnect();
		this._delayNodeR.disconnect();
		this._lfoL = null;
		this._lfoR = null;
		this._delayNodeL = null;
		this._delayNodeR = null;
	};

	return Tone.Chorus;
});