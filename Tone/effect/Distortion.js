define(["Tone/core/Tone", "Tone/effect/Effect"], function(Tone){

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
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._shaper = this.context.createWaveShaper();

		/**
		 *  the curve that the waveshaper uses
		 *  @type {Float32Array}
		 *  @private
		 */
		this._curve = new Float32Array(4096);

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
		var len = this._curve.length;
		var deg = Math.PI / 180;
		for (var i = 0; i < len; ++i) {
			var x = i * 2 / len - 1;
			if (x === 0){
				//should output 0 when input is 0
				this._curve[i] = 0;
			} else {
				this._curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
			}
		}
		this._shaper.curve = this._curve;
	};

	/**
	 *  set the oversampling
	 *  @param {string} oversampling can either be "none", "2x" or "4x"
	 */
	Tone.Distortion.prototype.setOversample = function(oversampling) {
		this._shaper.oversample = oversampling;
	};

	/**
	 *  clean up
	 */
	Tone.Distortion.prototype.dispose = function(){
		Tone.Effect.prototype.dispose.call(this);
		this._shaper.disconnect();
		this._shaper = null;
		this._curve = null;
	};

	return Tone.Distortion;
});