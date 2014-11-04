define(["Tone/core/Tone", "Tone/signal/GreaterThan", "Tone/signal/Negate"], function(Tone){

	"use strict";

	/**
	 *  @class  Output 1 if the signal is less than the value, otherwise outputs 0.
	 *          can compare two signals or a signal and a number. 
	 *          input 0: left hand side of comparison.
	 *          input 1: right hand side of comparison.
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [value=0] the value to compare to the incoming signal
	 */
	Tone.LessThan = function(value){

		Tone.call(this, 2, 0);

		/**
		 *  negate the incoming signal
		 *  @type {Tone.Negate}
		 *  @private
		 */
		this._neg = this.input[0] = new Tone.Negate();

		/**
		 *  input < value === -input > -value
		 *  @type {Tone.GreaterThan}
		 *  @private
		 */
		this._gt = this.output = new Tone.GreaterThan(-value);

		/**
		 *  negate the signal coming from the second input
		 *  @private
		 *  @type {Tone.Negate}
		 */
		this._lhNeg = this.input[1] = new Tone.Negate();

		//connect
		this._neg.connect(this._gt);
		this._lhNeg.connect(this._gt, 0, 1);
	};

	Tone.extend(Tone.LessThan);

	/**
	 *  set the value to compare to
	 *  
	 *  @param {number} value
	 */
	Tone.LessThan.prototype.setValue = function(value){
		this._gt.setValue(-value);
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.LessThan.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.LessThan.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._neg.dispose();
		this._neg = null;
		this._gt.dispose();
		this._gt = null;
		this._lhNeg.dispose();
		this._lhNeg = null;
	};

	return Tone.LessThan;
});