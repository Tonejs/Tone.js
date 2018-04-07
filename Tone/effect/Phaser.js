define(["Tone/core/Tone", "Tone/component/LFO", "Tone/component/Filter", "Tone/effect/StereoEffect"], function(Tone){

	"use strict";

	/**
	 *  @class Tone.Phaser is a phaser effect. Phasers work by changing the phase
	 *         of different frequency components of an incoming signal. Read more on
	 *         [Wikipedia](https://en.wikipedia.org/wiki/Phaser_(effect)).
	 *         Inspiration for this phaser comes from [Tuna.js](https://github.com/Dinahmoe/tuna/).
	 *
	 *	@extends {Tone.StereoEffect}
	 *	@constructor
	 *	@param {Frequency|Object} [frequency] The speed of the phasing.
	 *	@param {number} [octaves] The octaves of the effect.
	 *	@param {Frequency} [baseFrequency] The base frequency of the filters.
	 *	@example
	 * var phaser = new Tone.Phaser({
	 * 	"frequency" : 15,
	 * 	"octaves" : 5,
	 * 	"baseFrequency" : 1000
	 * }).toMaster();
	 * var synth = new Tone.FMSynth().connect(phaser);
	 * synth.triggerAttackRelease("E3", "2n");
	 */
	Tone.Phaser = function(){

		//set the defaults
		var options = Tone.defaults(arguments, ["frequency", "octaves", "baseFrequency"], Tone.Phaser);
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
		 *  the octaves of the phasing
		 *  @type {number}
		 *  @private
		 */
		this._octaves = options.octaves;

		/**
		 *  The quality factor of the filters
		 *  @type {Positive}
		 *  @signal
		 */
		this.Q = new Tone.Signal(options.Q, Tone.Type.Positive);

		/**
		 *  the array of filters for the left side
		 *  @type {Array}
		 *  @private
		 */
		this._filtersL = this._makeFilters(options.stages, this._lfoL, this.Q);

		/**
		 *  the array of filters for the left side
		 *  @type {Array}
		 *  @private
		 */
		this._filtersR = this._makeFilters(options.stages, this._lfoR, this.Q);

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
		//control the frequency with one LFO
		this._lfoL.frequency.connect(this._lfoR.frequency);
		//set the options
		this.baseFrequency = options.baseFrequency;
		this.octaves = options.octaves;
		//start the lfo
		this._lfoL.start();
		this._lfoR.start();
		this._readOnly(["frequency", "Q"]);
	};

	Tone.extend(Tone.Phaser, Tone.StereoEffect);

	/**
	 *  defaults
	 *  @static
	 *  @type {object}
	 */
	Tone.Phaser.defaults = {
		"frequency" : 0.5,
		"octaves" : 3,
		"stages" : 10,
		"Q" : 10,
		"baseFrequency" : 350,
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
			Q.connect(filter.Q);
			connectToFreq.connect(filter.frequency);
			filters[i] = filter;
		}
		Tone.connectSeries.apply(Tone, filters);
		return filters;
	};

	/**
	 * The number of octaves the phase goes above
	 * the baseFrequency
	 * @memberOf Tone.Phaser#
	 * @type {Positive}
	 * @name octaves
	 */
	Object.defineProperty(Tone.Phaser.prototype, "octaves", {
		get : function(){
			return this._octaves;
		},
		set : function(octaves){
			this._octaves = octaves;
			var max = this._baseFrequency * Math.pow(2, octaves);
			this._lfoL.max = max;
			this._lfoR.max = max;
		}
	});

	/**
	 * The the base frequency of the filters.
	 * @memberOf Tone.Phaser#
	 * @type {number}
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
			this.octaves = this._octaves;
		}
	});

	/**
	 *  clean up
	 *  @returns {Tone.Phaser} this
	 */
	Tone.Phaser.prototype.dispose = function(){
		Tone.StereoEffect.prototype.dispose.call(this);
		this._writable(["frequency", "Q"]);
		this.Q.dispose();
		this.Q = null;
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
