define(["Tone/core/Tone", "Tone/signal/WaveShaper"], function(Tone){

	"use strict";

	/**
	 *  @class Pow applies an exponent to the incoming signal. The incoming signal
	 *         must be AudioRange.
	 *
	 *  @extends {Tone.SignalBase}
	 *  @constructor
	 *  @param {Positive} exp The exponent to apply to the incoming signal, must be at least 2. 
	 *  @example
	 * var pow = new Tone.Pow(2);
	 * var sig = new Tone.Signal(0.5).connect(pow);
	 * //output of pow is 0.25. 
	 */
	Tone.Pow = function(exp){

		/**
		 * the exponent
		 * @private
		 * @type {number}
		 */
		this._exp = this.defaultArg(exp, 1);

		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._expScaler = this.input = this.output = new Tone.WaveShaper(this._expFunc(this._exp), 8192);
	};

	Tone.extend(Tone.Pow, Tone.SignalBase);

	/**
	 * The value of the exponent.
	 * @memberOf Tone.Pow#
	 * @type {number}
	 * @name value
	 */
	Object.defineProperty(Tone.Pow.prototype, "value", {
		get : function(){
			return this._exp;
		},
		set : function(exp){
			this._exp = exp;
			this._expScaler.setMap(this._expFunc(this._exp));
		}
	});


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
	 *  Clean up.
	 *  @returns {Tone.Pow} this
	 */
	Tone.Pow.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._expScaler.dispose();
		this._expScaler = null;
		return this;
	};

	return Tone.Pow;
});