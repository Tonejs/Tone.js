define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/signal/Inverse", "Tone/signal/Multiply"], 
function(Tone){

	"use strict";

	/**
	 *  @class Divide by a value or signal. 
	 *         input 0: numerator. input 1: divisor. 
	 *
	 *  @extends {Tone.SignalBase}
	 *  @constructor
	 *  @param {number=} divisor if no value is provided, Tone.Divide will divide the first
	 *                         and second inputs. 
	 *  @param {number=} precision the precision of the calculation
	 */
	Tone.Divide = function(divisor, precision){

		Tone.call(this, 2, 0);

		/**
		 *  the denominator value
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._value = null;

		/**
		 *  the inverse
		 *  @type {Tone}
		 */
		this._inverse = new Tone.Inverse(precision);

		/**
		 *  multiply input 0 by the inverse
		 *  @type {Tone.Multiply}
		 */
		this._mult = new Tone.Multiply();

		if (isFinite(divisor)){
			this._value = new Tone.Signal(divisor);
			this._value.connect(this._inverse);
		}
		this.input[1] = this._inverse;
		this._inverse.connect(this._mult, 0, 1);
		this.input[0] = this.output = this._mult.input[0];
	};

	Tone.extend(Tone.Divide, Tone.SignalBase);

	/**
	 *  set the divisor value
	 *  NB: if the value is known, use Tone.Multiply with the inverse of the value
	 *  Division is a computationally expensive operation. 
	 *  
	 *  @param {number} value 
	 */
	Tone.Divide.prototype.setValue = function(value){
		if (this._value !== null){
			this._value.setValue(value);
		} else {
			throw new Error("cannot switch from signal to number");
		}
	}; 

	/**
	 *  clean up
	 */
	Tone.Divide.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		if (this._value){
			this._value.dispose();
			this._value = null;
		}
		this._inverse.dispose();
		this._inverse = null;
		this._mult.dispose();
		this._mult = null;
	};

	return Tone.Divide;
});