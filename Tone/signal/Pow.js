define(["Tone/core/Tone", "Tone/signal/Multiply"], function(Tone){

	"use strict";

	/**
	 *  @class Pow applies an exponent to the incoming signal. Pow only accepts 
	 *         positive, integer exponents.  
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {number} exp the exponent to apply to the incoming signal, must be at least 2. 
	 */
	Tone.Pow = function(exp){

		Tone.call(this);

		exp = this.defaultArg(exp, 2) - 1;
		/**
		 *  the array of Tone.Muliply (one for each power)
		 *  @type {Array}
		 *  @private
		 */
		this._multiplies = new Array(exp);

		for (var i = 0; i < exp; i++){
			var mult = new Tone.Multiply();
			if (i > 0){
				mult.connect(this._multiplies[i-1], 0, 1);
			}
			this._multiplies[i] = mult;
			this.input.connect(mult);
		}
		this.input.connect(this._multiplies[exp-1], 0, 1);
		this._multiplies[0].connect(this.output);
	};

	Tone.extend(Tone.Pow);

	/**
	 *  clean up
	 */
	Tone.Pow.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		for (var i = 0; i < this._multiplies.length; i++){
			this._multiplies[i].dispose();
			this._multiplies[i] = null;
		}
		this._multiplies = null;
	};

	return Tone.Pow;
});