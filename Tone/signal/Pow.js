define(["Tone/core/Tone"], function(Tone){

	"use strict";

	/**
	 *  @class Pow applies an exponent to the incoming signal. The incoming signal
	 *         must be in the range -1,1
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {number} exp the exponent to apply to the incoming signal, must be at least 2. 
	 */
	Tone.Pow = function(exp){

		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._expScaler = this.input = this.output = this.context.createWaveShaper();

		/**
		 *  the curve that the waveshaper uses
		 *  @type {Float32Array}
		 *  @private
		 */
		this._curve = new Float32Array(2048);

		this.setExponent(this.defaultArg(exp, 1));
	};

	Tone.extend(Tone.Pow);

	/**
	 *  set the exponential scaling curve
	 *  @param {number} exp the exponent to raise the incoming signal to
	 */
	Tone.Pow.prototype.setExponent = function(exp){
		var curveLength = this._curve.length;
		for (var i = 0; i < curveLength; i++){
			var normalized = Math.abs((i / (curveLength - 1)) * 2 - 1);
			if (normalized < 0.001){
				this._curve[i] = 0;
			} else {
				this._curve[i] = Math.pow(normalized, exp);	
			}
		}
		this._expScaler.curve = this._curve;
	};

	/**
	 *  clean up
	 */
	Tone.Pow.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._expScaler.disconnect();
		this._expScaler = null;
		this._curve = null;
	};

	return Tone.Pow;
});