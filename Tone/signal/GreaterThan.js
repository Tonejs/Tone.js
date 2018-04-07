define(["Tone/core/Tone", "Tone/signal/GreaterThanZero", "Tone/signal/Subtract", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class  Output 1 if the signal is greater than the value, otherwise outputs 0.
	 *          can compare two signals or a signal and a number.
	 *
	 *  @constructor
	 *  @extends {Tone.Signal}
	 *  @param {number} [value=0] the value to compare to the incoming signal
	 *  @example
	 * var gt = new Tone.GreaterThan(2);
	 * var sig = new Tone.Signal(4).connect(gt);
	 * //output of gt is equal 1.
	 */
	Tone.GreaterThan = function(value){

		Tone.Signal.call(this);
		this.createInsOuts(2, 0);

		/**
		 *  subtract the amount from the incoming signal
		 *  @type {Tone.Subtract}
		 *  @private
		 */
		this._param = this.input[0] = new Tone.Subtract(value);
		this.input[1] = this._param.input[1];

		/**
		 *  compare that amount to zero
		 *  @type {Tone.GreaterThanZero}
		 *  @private
		 */
		this._gtz = this.output = new Tone.GreaterThanZero();

		//connect
		this._param.connect(this._gtz);
	};

	Tone.extend(Tone.GreaterThan, Tone.Signal);

	/**
	 *  dispose method
	 *  @returns {Tone.GreaterThan} this
	 */
	Tone.GreaterThan.prototype.dispose = function(){
		Tone.Signal.prototype.dispose.call(this);
		this._gtz.dispose();
		this._gtz = null;
		return this;
	};

	return Tone.GreaterThan;
});
