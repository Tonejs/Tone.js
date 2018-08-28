define(["../core/Tone", "../signal/Multiply", "../signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class Negate the incoming signal. i.e. an input signal of 10 will output -10
	 *
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @example
	 * var neg = new Tone.Negate();
	 * var sig = new Tone.Signal(-2).connect(neg);
	 * //output of neg is positive 2. 
	 */
	Tone.Negate = function(){

		Tone.SignalBase.call(this);
		/**
		 *  negation is done by multiplying by -1
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._multiply = this.input = this.output = new Tone.Multiply(-1);
	};

	Tone.extend(Tone.Negate, Tone.SignalBase);

	/**
	 *  clean up
	 *  @returns {Tone.Negate} this
	 */
	Tone.Negate.prototype.dispose = function(){
		Tone.SignalBase.prototype.dispose.call(this);
		this._multiply.dispose();
		this._multiply = null;
		return this;
	}; 

	return Tone.Negate;
});
