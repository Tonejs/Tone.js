define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/core/Gain"], function(Tone){

	"use strict";

	/**
	 *  @class  Multiply two incoming signals. Or, if a number is given in the constructor,
	 *          multiplies the incoming signal by that value.
	 *
	 *  @constructor
	 *  @extends {Tone.Signal}
	 *  @param {number=} value Constant value to multiple. If no value is provided,
	 *                         it will return the product of the first and second inputs
	 *  @example
	 * var mult = new Tone.Multiply();
	 * var sigA = new Tone.Signal(3);
	 * var sigB = new Tone.Signal(4);
	 * sigA.connect(mult, 0, 0);
	 * sigB.connect(mult, 0, 1);
	 * //output of mult is 12.
	 *  @example
	 * var mult = new Tone.Multiply(10);
	 * var sig = new Tone.Signal(2).connect(mult);
	 * //the output of mult is 20.
	 */
	Tone.Multiply = function(value){

		Tone.Signal.call(this);
		this.createInsOuts(2, 0);

		/**
		 *  the input node is the same as the output node
		 *  it is also the GainNode which handles the scaling of incoming signal
		 *
		 *  @type {GainNode}
		 *  @private
		 */
		this._mult = this.input[0] = this.output = new Tone.Gain();

		/**
		 *  the scaling parameter
		 *  @type {AudioParam}
		 *  @private
		 */
		this._param = this.input[1] = this.output.gain;

		this.value = Tone.defaultArg(value, 0);
	};

	Tone.extend(Tone.Multiply, Tone.Signal);

	/**
	 *  clean up
	 *  @returns {Tone.Multiply} this
	 */
	Tone.Multiply.prototype.dispose = function(){
		Tone.Signal.prototype.dispose.call(this);
		this._mult.dispose();
		this._mult = null;
		this._param = null;
		return this;
	};

	return Tone.Multiply;
});
