define(["Tone/core/Tone", "Tone/component/LFO", "Tone/effect/FeedbackEffect", "Tone/component/Filter"], 
function(Tone){

	"use strict";

	/**
	 *  @class A Phaser effect with feedback
	 *
	 *	@extends {Tone.FeedbackEffect}
	 *	@constructor
	 *	@param {number|object=} rate the speed of the phasing
	 *	@param {number=} depth the depth of the effect
	 *	@param {number} baseFrequency the base frequency of the filters
	 */
	Tone.Phaser = function(){

		//set the defaults
		var options = this.optionsObject(arguments, ["rate", "depth", "baseFrequency"], Tone.Phaser.defaults);

		Tone.FeedbackEffect.call(this, options);

		/**
		 *  the lfo which controls the frequency
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfo = new Tone.LFO(options.rate, 0, 1);

		/**
		 *  the base modulation frequency
		 *  @type {number}
		 *  @private
		 */
		this._baseFrequency = options.baseFrequency;

		/**
		 *  the depth of the phasing
		 *  @type {number}
		 *  @private
		 */
		this._depth = options.depth;
		
		/**
		 *  the array of filters
		 *  @type {Array.<Tone.Filter>}
		 *  @private
		 */
		this._filters = new Array(options.stages);

		//make all the filters
		for (var i = 0; i < options.stages; i++){
			var filter = new Tone.Filter(0, "allpass");
			// filter.Q.value = 10;
			this._lfo.connect(filter.frequency);
			this._filters[i] = filter;
		}
		//connect them up
		this.chain.apply(this, this._filters);
		this.effectSend.connect(this._filters[0]);
		this.effectSend.connect(this.effectReturn);
		this._filters[options.stages - 1].connect(this.effectReturn);
		//set the options
		this.setBaseFrequency(options.baseFrequency);
		this.setDepth(options.depth);
		//start the lfo
		this._lfo.start();
	};

	Tone.extend(Tone.Phaser, Tone.FeedbackEffect);

	/**
	 *  defaults
	 *  @static
	 *  @type {object}
	 */
	Tone.Phaser.defaults = {
		"rate" : 1,
		"depth" : 0.6,
		"stages" : 4,
		"baseFrequency" : 750
	};

	/**
	 *  set the depth of the chorus
	 *  @param {number} depth
	 */
	Tone.Phaser.prototype.setDepth = function(depth){
		this._depth = depth;
		this._lfo.setMax(this._baseFrequency + this._baseFrequency * depth);
	};

	/**
	 *  set the base frequency of the filters
	 *  @param {number} freq
	 */
	Tone.Phaser.prototype.setBaseFrequency = function(freq){
		this._baseFrequency = freq;	
		this._lfo.setMin(freq);
		this.setDepth(this._depth);
	};

	/**
	 *  set the phaser rate
	 *  @param {number} rate in hertz
	 */
	Tone.Phaser.prototype.setRate = function(rate){
		this._lfo.setFrequency(rate);
	};

	/**
	 *  bulk setter
	 *  @param {object} params
	 */
	Tone.Phaser.prototype.set = function(params){
		if (!this.isUndef(params.rate)) this.setRate(params.rate);
		if (!this.isUndef(params.baseFrequency)) this.setBaseFrequency(params.baseFrequency);
		if (!this.isUndef(params.depth)) this.setDepth(params.depth);
		Tone.FeedbackEffect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.Phaser.prototype.dispose = function(){
		Tone.FeedbackEffect.prototype.dispose.call(this);
		this._lfo.dispose();
		for (var i = 0; i < this._filters.length; i++){
			this._filters[i].dispose();
			this._filters[i] = null;
		}
		this._filters = null;
	};

	return Tone.Phaser;
});