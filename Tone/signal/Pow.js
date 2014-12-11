define(["Tone/core/Tone", "Tone/signal/WaveShaper"], function(Tone){

	"use strict";

	/**
	 *  @class Pow applies an exponent to the incoming signal. The incoming signal
	 *         must be in the range -1,1
	 *
	 *  @extends {Tone.SignalBase}
	 *  @constructor
	 *  @param {number} exp the exponent to apply to the incoming signal, must be at least 2. 
	 */
	Tone.Pow = function(exp){

		exp = this.defaultArg(exp, 1);

		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._expScaler = this.input = this.output = new Tone.WaveShaper(this._expFunc(exp), 8192);
	};

	Tone.extend(Tone.Pow, Tone.SignalBase);

	/**
	 *  set the exponential scaling curve
	 *  @param {number} exp the exponent to raise the incoming signal to
	 */
	Tone.Pow.prototype.setExponent = function(exp){
		this._expScaler.setMap(this._expFunc(exp));
	};

	/**
	 *  the function which maps the waveshaper
	 *  @param   {number} exp
	 *  @return {function}
	 *  @private
	 */
	Tone.Pow.prototype._expFunc = function(exp){
		return function(val){
			return Math.pow(Math.abs(val), exp);
		};
	};

	/**
	 *  clean up
	 */
	Tone.Pow.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._expScaler.dispose();
		this._expScaler = null;
	};

	return Tone.Pow;
});