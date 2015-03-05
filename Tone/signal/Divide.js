define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/signal/Inverse", "Tone/signal/Multiply"], 
function(Tone){

	"use strict";

	/**
	 *  @class Divide by a value or signal. 
	 *         input 0: numerator. input 1: divisor. 
	 *
	 *  @deprecated
	 *  @extends {Tone.SignalBase}
	 *  @constructor
	 *  @param {number=} divisor if no value is provided, Tone.Divide will divide the first
	 *                         and second inputs. 
	 *  @param {number} [precision=3] the precision of the calculation
	 */
	Tone.Divide = function(divisor, precision){

		console.warn("Tone.Divide has been deprecated. If possible, it's much more efficient to multiply by the inverse value.");

		Tone.call(this, 2, 0);

		/**
		 *  the denominator value
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._denominator = null;

		/**
		 *  the inverse
		 *  @type {Tone}
		 *  @private
		 */
		this._inverse = new Tone.Inverse(precision);

		/**
		 *  multiply input 0 by the inverse
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._mult = new Tone.Multiply();

		if (isFinite(divisor)){
			this._denominator = new Tone.Signal(divisor);
			this._denominator.connect(this._inverse);
		}
		this.input[1] = this._inverse;
		this._inverse.connect(this._mult, 0, 1);
		this.input[0] = this.output = this._mult.input[0];
	};

	Tone.extend(Tone.Divide, Tone.SignalBase);

	/**
	 * The value being divided from the incoming signal. Note, that
	 * if Divide was constructed without a divisor, it expects
	 * that the signals to numberator will be connected to input 0 and 
	 * the denominator to input 1 and therefore will throw an error when 
	 * trying to set/get the value. 
	 * 
	 * @memberOf Tone.Divide#
	 * @type {number}
	 * @name value
	 */
	Object.defineProperty(Tone.Divide.prototype, "value", {
		get : function(){
			if (this._denominator !== null){
				return this._denominator.value;
			} else {
				throw new Error("cannot switch from signal to number");
			}
		},
		set : function(value){
			if (this._denominator !== null){
				this._denominator.value = value;
			} else {
				throw new Error("cannot switch from signal to number");
			}
		}
	});

	/**
	 *  clean up
	 *  @returns {Tone.Divide} `this`
	 */
	Tone.Divide.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		if (this._denominator){
			this._denominator.dispose();
			this._denominator = null;
		}
		this._inverse.dispose();
		this._inverse = null;
		this._mult.dispose();
		this._mult = null;
		return this;
	};

	return Tone.Divide;
});