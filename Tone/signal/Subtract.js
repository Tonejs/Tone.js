define(["Tone/core/Tone", "Tone/signal/Add", "Tone/signal/Negate", "Tone/signal/SignalBase"], function(Tone){

	"use strict";

	/**
	 *  @class Subtract a signal and a number or two signals. 
	 *         input 0 : minuend.
	 *         input 1 : subtrahend
	 *
	 *  @extends {Tone.SignalBase}
	 *  @constructor
	 *  @param {number=} value value to subtract from the incoming signal. If the value
	 *                         is omitted, it will subtract the second signal from the first
	 */
	Tone.Subtract = function(value){

		Tone.call(this, 2, 0);

		/**
		 *  the adder node
		 *  @type {Tone.Add}
		 *  @private
		 */
		this._adder = this.input[0] = this.output = new Tone.Add(-value);

		/**
		 *  the negate node
		 *  @type {Tone.Negate}
		 *  @private
		 */
		this._neg = this.input[1] = new Tone.Negate();

		//connect it up
		this._neg.connect(this._adder, 0, 1);
	};

	Tone.extend(Tone.Subtract, Tone.SignalBase);

	/**
	 *  set the constant
	 *  
	 *  @param {number} value 
	 */
	Tone.Subtract.prototype.setValue = function(value){
		this._adder.setValue(-value);
	}; 

	/**
	 *  clean up
	 */
	Tone.Subtract.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._neg.dispose();
		this._neg = null;
		this._adder.dispose();
		this._adder = null;
	};

	return Tone.Subtract;
});