define(["Tone/core/Tone", "Tone/signal/Equal"], function(Tone){

	"use strict";

	/**
	 *  @class [AND](https://en.wikipedia.org/wiki/Logical_conjunction)
	 *         returns 1 when all the inputs are equal to 1 and returns 0 otherwise.
	 *
	 *  @extends {Tone.SignalBase}
	 *  @constructor
	 *  @param {number} [inputCount=2] the number of inputs. NOTE: all inputs are
	 *                                 connected to the single AND input node
	 *  @example
	 * var and = new Tone.AND(2);
	 * var sigA = new Tone.Signal(0).connect(and, 0, 0);
	 * var sigB = new Tone.Signal(1).connect(and, 0, 1);
	 * //the output of and is 0. 
	 */
	Tone.AND = function(inputCount){

		inputCount = this.defaultArg(inputCount, 2);

		Tone.call(this, inputCount, 0);

		/**
		 *  @type {Tone.Equal}
		 *  @private
		 */
		this._equals = this.output = new Tone.Equal(inputCount);

		//make each of the inputs an alias
		for (var i = 0; i < inputCount; i++){
			this.input[i] = this._equals;
		}
	};

	Tone.extend(Tone.AND, Tone.SignalBase);

	/**
	 *  clean up
	 *  @returns {Tone.AND} this
	 */
	Tone.AND.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._equals.dispose();
		this._equals = null;
		return this;
	};

	return Tone.AND;
});