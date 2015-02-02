define(["Tone/core/Tone", "Tone/signal/GreaterThanZero", "Tone/signal/Subtract"], function(Tone){

	"use strict";

	/**
	 *  @class  Output 1 if the signal is greater than the value, otherwise outputs 0.
	 *          can compare two signals or a signal and a number. 
	 *  
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @param {number} [value=0] the value to compare to the incoming signal
	 */
	Tone.GreaterThan = function(value){

		Tone.call(this, 2, 0);
		
		/**
		 *  subtract the amount from the incoming signal
		 *  @type {Tone.Subtract}
		 *  @private
		 */
		this._sub = this.input[0] = new Tone.Subtract(value);
		this.input[1] = this._sub.input[1];

		/**
		 *  compare that amount to zero
		 *  @type {Tone.GreaterThanZero}
		 *  @private
		 */
		this._gtz = this.output = new Tone.GreaterThanZero();

		//connect
		this._sub.connect(this._gtz);
	};

	Tone.extend(Tone.GreaterThan, Tone.SignalBase);

	/**
	 *  set the value to compare to
	 *  
	 *  @param {number} value
	 *  @returns {Tone.GreaterThan} `this`
	 */
	Tone.GreaterThan.prototype.setValue = function(value){
		this._sub.setValue(value);
		return this;
	};

	/**
	 *  dispose method
	 *  @returns {Tone.GreaterThan} `this`
	 */
	Tone.GreaterThan.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._sub.dispose();
		this._gtz.dispose();
		this._sub = null;
		this._gtz = null;
		return this;
	};

	return Tone.GreaterThan;
});