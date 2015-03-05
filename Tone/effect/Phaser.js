define(["Tone/core/Tone", "Tone/component/LFO", "Tone/component/Filter", "Tone/effect/StereoEffect"], 
function(Tone){

	"use strict";

	/**
	 *  @class A Phaser effect. inspiration from https://github.com/Dinahmoe/tuna/
	 *
	 *	@extends {Tone.StereoEffect}
	 *	@constructor
	 *	@param {number|Object} [frequency=0.5] the speed of the phasing
	 *	@param {number} [depth=10] the depth of the effect
	 *	@param {number} [baseFrequency=400] the base frequency of the filters
	 *	@example
	 * 	var phaser = new Tone.Phaser(0.4, 12, 550);
	 */
	Tone.Phaser = function(){

		//set the defaults
		var options = this.optionsObject(arguments, ["frequency", "depth", "baseFrequency"], Tone.Phaser.defaults);
		Tone.StereoEffect.call(this, options);

		/**
		 *  the lfo which controls the frequency on the left side
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfoL = new Tone.LFO(options.frequency, 0, 1);

		/**
		 *  the lfo which controls the frequency on the right side
		 *  @type {Tone.LFO}
		 *  @private
		 */
		this._lfoR = new Tone.LFO(options.frequency, 0, 1);
		this._lfoR.phase = 180;

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
		 *  the array of filters for the left side
		 *  @type {Array.<Tone.Filter>}
		 *  @private
		 */
		this._filtersL = this._makeFilters(options.stages, this._lfoL, options.Q);

		/**
		 *  the array of filters for the left side
		 *  @type {Array.<Tone.Filter>}
		 *  @private
		 */
		this._filtersR = this._makeFilters(options.stages, this._lfoR, options.Q);

		/**
		 * the frequency of the effect
		 * @type {Tone.Signal}
		 */
		this.frequency = this._lfoL.frequency;
		this.frequency.value = options.frequency;
		
		//connect them up
		this.effectSendL.connect(this._filtersL[0]);
		this.effectSendR.connect(this._filtersR[0]);
		this._filtersL[options.stages - 1].connect(this.effectReturnL);
		this._filtersR[options.stages - 1].connect(this.effectReturnR);
		this.effectSendL.connect(this.effectReturnL);
		this.effectSendR.connect(this.effectReturnR);
		//control the frequency with one LFO
		this._lfoL.frequency.connect(this._lfoR.frequency);
		//set the options
		this.baseFrequency = options.baseFrequency;
		this.depth = options.depth;
		//start the lfo
		this._lfoL.start();
		this._lfoR.start();
	};

	Tone.extend(Tone.Phaser, Tone.StereoEffect);

	/**
	 *  defaults
	 *  @static
	 *  @type {object}
	 */
	Tone.Phaser.defaults = {
		"frequency" : 0.5,
		"depth" : 10,
		"stages" : 4,
		"Q" : 100,
		"baseFrequency" : 400,
	};

	/**
	 *  @param {number} stages
	 *  @returns {Array} the number of filters all connected together
	 *  @private
	 */
	Tone.Phaser.prototype._makeFilters = function(stages, connectToFreq, Q){
		var filters = new Array(stages);
		//make all the filters
		for (var i = 0; i < stages; i++){
			var filter = this.context.createBiquadFilter();
			filter.type = "allpass";
			filter.Q.value = Q;
			connectToFreq.connect(filter.frequency);
			filters[i] = filter;
		}
		this.connectSeries.apply(this, filters);
		return filters;
	};

	/**
	 * The depth of the effect. 
	 * @memberOf Tone.Phaser#
	 * @type {number}
	 * @name depth
	 */
	Object.defineProperty(Tone.Phaser.prototype, "depth", {
		get : function(){
			return this._depth;
		},
		set : function(depth){
			this._depth = depth;
			var max = this._baseFrequency + this._baseFrequency * depth;
			this._lfoL.max = max;
			this._lfoR.max = max;
		}
	});

	/**
	 * The the base frequency of the filters. 
	 * @memberOf Tone.Phaser#
	 * @type {string}
	 * @name baseFrequency
	 */
	Object.defineProperty(Tone.Phaser.prototype, "baseFrequency", {
		get : function(){
			return this._baseFrequency;
		},
		set : function(freq){
			this._baseFrequency = freq;	
			this._lfoL.min = freq;
			this._lfoR.min = freq;
			this.depth = this._depth;
		}
	});

	/**
	 *  clean up
	 *  @returns {Tone.Phaser} `this`
	 */
	Tone.Phaser.prototype.dispose = function(){
		Tone.StereoEffect.prototype.dispose.call(this);
		this._lfoL.dispose();
		this._lfoL = null;
		this._lfoR.dispose();
		this._lfoR = null;
		for (var i = 0; i < this._filtersL.length; i++){
			this._filtersL[i].disconnect();
			this._filtersL[i] = null;
		}
		this._filtersL = null;
		for (var j = 0; j < this._filtersR.length; j++){
			this._filtersR[j].disconnect();
			this._filtersR[j] = null;
		}
		this._filtersR = null;
		this.frequency = null;
		return this;
	};

	return Tone.Phaser;
});