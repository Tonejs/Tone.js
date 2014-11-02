define(["Tone/core/Tone", "Tone/signal/Multiply"], function(Tone){

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
		this._expScaler = this.context.createWaveShaper();

		/**
		 *  the input and output nodes
		 *  @type {GainNode}
		 */
		this.input = this.output = this._expScaler;

		this.setExponent(this.defaultArg(exp, 1));
	};

	Tone.extend(Tone.Pow);

	/**
	 *  set the exponential scaling curve
	 *  @param {number} exp the exponent to raise the incoming signal to
	 */
	Tone.Pow.prototype.setExponent = function(exp){
		var curveLength = Math.pow(2, 12);
		var curve = new Float32Array(curveLength);
		for (var i = 0; i < curveLength; i++){
			var normalized = Math.abs((i / (curveLength - 1)) * 2 - 1);
			if (normalized < 0.001){
				curve[i] = 0;
			} else {
				curve[i] = Math.pow(normalized, exp);	
			}
		}
		this._expScaler.curve = curve;
	};

	/**
	 *  clean up
	 */
	Tone.Pow.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._expScaler.disconnect();
		this._expScaler = null;
	};

	return Tone.Pow;
});