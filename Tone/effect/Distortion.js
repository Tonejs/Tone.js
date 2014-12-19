define(["Tone/core/Tone", "Tone/effect/Effect", "Tone/signal/WaveShaper"], function(Tone){

	"use strict";

	/**
	 *  @class A simple distortion effect using the waveshaper node
	 *         algorithm from http://stackoverflow.com/a/22313408
	 *
	 *  @extends {Tone.Effect}
	 *  @constructor
	 *  @param {number} distortion the amount of distortion (nominal range of 0-1)
	 */
	Tone.Distortion = function(){

		var options = this.optionsObject(arguments, ["distortion"], Tone.Distortion.defaults);

		Tone.Effect.call(this);

		/**
		 *  @type {Tone.WaveShaper}
		 *  @private
		 */
		this._shaper = new Tone.WaveShaper(4096);

		this.connectEffect(this._shaper);
		this.setDistortion(options.distortion);
		this.setOversample(options.oversample);
	};

	Tone.extend(Tone.Distortion, Tone.Effect);

	/**
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.Distortion.defaults = {
		"distortion" : 0.4,
		"oversample" : "none"
	};

	/**
	 *  set the amount of distortion
	 *  @param   {number} amount amount of distortion, nominal range of 0-1. 
	 */
	Tone.Distortion.prototype.setDistortion = function(amount) {
		var k = amount * 100;
		var deg = Math.PI / 180;
		this._shaper.setMap(function(x){
			if (Math.abs(x) < 0.001){
				//should output 0 when input is 0
				return 0;
			} else {
				return ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
			}
		});
	};

	/**
	 *  set the oversampling
	 *  @param {string} oversampling can either be "none", "2x" or "4x"
	 */
	Tone.Distortion.prototype.setOversample = function(oversampling) {
		this._shaper.oversample = oversampling;
	};

	/**
	 *  set in bulk
	 *  @param {Object} params 
	 */
	Tone.Distortion.prototype.setOversample = function(params) {
		if (!this.isUndef(params.distortion)) this.setDistortion(params.distortion);
		if (!this.isUndef(params.oversample)) this.setOversample(params.oversample);
		Tone.Effect.prototype.set.call(this, params);
	};

	/**
	 *  clean up
	 */
	Tone.Distortion.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._shaper.dispose();
		this._shaper = null;
	};

	return Tone.Distortion;
});