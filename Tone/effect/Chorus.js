define(["Tone/core/Tone", "Tone/component/LFO", "Tone/effect/FeedbackEffect"], function(Tone){

	/**
	 *  @class A Chorus effect with feedback
	 *
	 *	@constructor
	 *	@extends {Tone.FeedbackEffect}
	 *	@param {number=} [rate=2] the rate of the effect
	 *	@param {number=} [delay=3.5] the delay of the chorus effect in ms
	 *	@param {number=} [depth=0.7] the depth of the chorus
	 */
	Tone.Chorus = function(rate, delay, depth){

		Tone.FeedbackEffect.call(this);

		/**
		 *  the depth of the chorus
		 *  @type {number}
		 *  @private
		 */
		this._depth = this.defaultArg(depth, 0.7);

		/**
		 *  the delayTime
		 *  @type {number}
		 *  @private
		 */
		this._delayTime = this.defaultArg(delay, 0.0035);

		/**
		 *  the lfo which controls the delayTime
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfo = new Tone.LFO(this.defaultArg(rate, 2), 0, 1);

		/**
		 *  @type {DelayNode}
		 *  @private
		 */
		this._delayNode = this.context.createDelay();

		//connections
		this.connectEffect(this._delayNode);
		this.effectSend.connect(this.effectReturn);
		this._lfo.connect(this._delayNode.delayTime);
		this._lfo.start();
		this.setDepth(this.defaultArg(depth, 0.5));
		this.setFeedback(0.25);
	};

	Tone.extend(Tone.Chorus, Tone.FeedbackEffect);

	/**
	 *  set the depth of the chorus
	 *  @param {number} depth
	 */
	Tone.Chorus.prototype.setDepth = function(depth){
		this._depth = depth;
		var deviation = this._delayTime * depth;
		this._lfo.setMin(this._delayTime - deviation);
		this._lfo.setMax(this._delayTime + deviation);
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
		this._lfo.setFrequency(rate);
	};

	/**
	 *  set multiple parameters at once with an object
	 *  @param {Object} params the parameters as an object
	 */
	Tone.Chorus.prototype.set = function(params){
		if (!this.isUndef(params.rate)) this.setRate(params.rate);
		if (!this.isUndef(params.delayTime)) this.setDelayTime(params.delayTime);
		if (!this.isUndef(params.depth)) this.setDepth(params.depth);
		Tone.FeedbackEffect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.Chorus.prototype.dispose = function(){
		Tone.FeedbackEffect.prototype.dispose.call(this);
		this._lfo.dispose();
		this._delayNode.disconnect();
		this._lfo = null;
		this._delayNode = null;
	};

	return Tone.Chorus;
});