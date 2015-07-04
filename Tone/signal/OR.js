define(["Tone/core/Tone", "Tone/signal/GreaterThanZero"], function(Tone){

	"use strict";

	/**
	 *  @class [OR](https://en.wikipedia.org/wiki/OR_gate)
	 *         the inputs together. True if at least one of the inputs is true. 
	 *
	 *  @extends {Tone.SignalBase}
	 *  @constructor
	 *  @param {number} [inputCount=2] the input count
	 *  @example
	 * var or = new Tone.OR(2);
	 * var sigA = new Tone.Signal(0)connect(or, 0, 0);
	 * var sigB = new Tone.Signal(1)connect(or, 0, 1);
	 * //output of or is 1 because at least
	 * //one of the inputs is equal to 1. 
	 */
	Tone.OR = function(inputCount){

		inputCount = this.defaultArg(inputCount, 2);
		Tone.call(this, inputCount, 0);

		/**
		 *  a private summing node
		 *  @type {GainNode}
		 *  @private
		 */
		this._sum = this.context.createGain();

		/**
		 *  @type {Tone.Equal}
		 *  @private
		 */
		this._gtz = this.output = new Tone.GreaterThanZero();

		//make each of the inputs an alias
		for (var i = 0; i < inputCount; i++){
			this.input[i] = this._sum;
		}
		this._sum.connect(this._gtz);
	};

	Tone.extend(Tone.OR, Tone.SignalBase);

	/**
	 *  clean up
	 *  @returns {Tone.OR} this
	 */
	Tone.OR.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._gtz.dispose();
		this._gtz = null;
		this._sum.disconnect();
		this._sum = null;
		return this;
	};

	return Tone.OR;
});