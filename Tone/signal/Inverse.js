define(["Tone/core/Tone", "Tone/signal/Subtract", "Tone/signal/Multiply", "Tone/signal/WaveShaper"], 
function(Tone){

	"use strict";

	/**
	 *  this is the maximum value that the divide can handle	
	 *  @type {number}
	 *  @const
	 */
	var MAX_VALUE = Math.pow(2, 13);

	/**
	 *  @private
	 *  @static
	 *  @type {Array}
	 */
	var guessCurve = new Array(MAX_VALUE);
	//set the value
	for (var i = 0; i < guessCurve.length; i++){
		var normalized = (i / (guessCurve.length - 1)) * 2 - 1;
		if (normalized === 0){
			guessCurve[i] = 0;
		} else {
			guessCurve[i] = 1 / (normalized * MAX_VALUE);
		}
	}

	/**
	 *  @class Compute the inverse of the input.
	 *         Uses this approximation algorithm: 
	 *         http://en.wikipedia.org/wiki/Multiplicative_inverse#Algorithms
	 *
	 *  @deprecated
	 *  @extends {Tone.SignalBase}
	 *  @constructor
	 *  @param {number} [precision=3] the precision of the calculation
	 */
	Tone.Inverse = function(precision){

		console.warn("Tone.Inverse has been deprecated. Multiply is always more efficient than dividing.");

		Tone.call(this);

		precision = this.defaultArg(precision, 3);

		/**
		 *  a constant generator of the value 2
		 *  @private
		 *  @type {Tone.Signal}
		 */
		this._two = new Tone.Signal(2);

		/**
		 *  starting guess is 0.1 times the input
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._guessMult = new Tone.Multiply(1/MAX_VALUE);

		/**
		 *  produces a starting guess based on the input
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._guess = new Tone.WaveShaper(guessCurve);
		this.input.chain(this._guessMult, this._guess);

		/**
		 *  the array of inverse helpers
		 *  @type {Array}
		 *  @private
		 */
		this._inverses = new Array(precision);

		//create the helpers
		for (var i = 0; i < precision; i++){
			var guess;
			if (i === 0){
				guess = this._guess;
			} else {
				guess = this._inverses[i-1];
			}
			var inv = new InverseHelper(guess, this._two);
			this.input.connect(inv);
			this._inverses[i] = inv;
		}
		this._inverses[precision-1].connect(this.output);
	};

	Tone.extend(Tone.Inverse, Tone.SignalBase);

	/**
	 *  clean up
	 *  @returns {Tone.Inverse} `this`
	 */
	Tone.Inverse.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		for (var i = 0; i < this._inverses.length; i++){
			this._inverses[i].dispose();
			this._inverses[i] = null;
		}
		this._inverses = null;
		this._two.dispose();
		this._two = null;
		this._guessMult.dispose();
		this._guessMult = null;
		this._guess.disconnect();
		this._guess = null;
		return this;
	};

	// BEGIN INVERSE HELPER ///////////////////////////////////////////////////

	/**
	 *  internal helper function for computing the inverse of a signal
	 *  @extends {Tone}
	 *  @constructor
	 *  @private
	 */
	var InverseHelper = function(guess, two){
		this._outerMultiply = new Tone.Multiply();
		this._innerMultiply = new Tone.Multiply();
		this._subtract = new Tone.Subtract();
		//connections
		guess.connect(this._innerMultiply, 0, 1);
		two.connect(this._subtract, 0, 0);
		this._innerMultiply.connect(this._subtract, 0, 1);
		this._subtract.connect(this._outerMultiply, 0, 1);
		guess.connect(this._outerMultiply, 0, 0);
		this.output = this._outerMultiply;
		this.input = this._innerMultiply;
	};

	Tone.extend(InverseHelper);

	InverseHelper.prototype.dispose = function(){
		this._outerMultiply.dispose();
		this._outerMultiply = null;
		this._innerMultiply.dispose();
		this._innerMultiply = null;
		this._subtract.dispose();
		this._subtract = null;
	};
	
	// END INVERSE HELPER /////////////////////////////////////////////////////

	return Tone.Inverse;
});