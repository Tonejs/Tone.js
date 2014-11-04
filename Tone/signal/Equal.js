define(["Tone/core/Tone", "Tone/signal/EqualZero", "Tone/signal/Subtract", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class  Output 1 if the signal is equal to the value, otherwise outputs 0. 
	 *          Can accept two signals if connected to inputs 0 and 1.
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} value the number to compare the incoming signal to
	 */
	Tone.Equal = function(value){

		Tone.call(this, 2, 0);

		/**
		 *  subtract the value from the incoming signal
		 *  
		 *  @type {Tone.Add}
		 *  @private
		 */
		this._sub = this.input[0] = new Tone.Subtract(value);

		/**
		 *  @type {Tone.EqualZero}
		 *  @private
		 */
		this._equals = this.output = new Tone.EqualZero();

		this._sub.connect(this._equals);
		this.input[1] = this._sub.input[1];
	};

	Tone.extend(Tone.Equal);

	/**
	 * 	@param {number} value set the comparison value
	 */
	Tone.Equal.prototype.setValue = function(value){
		this._sub.setValue(value);
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Equal.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.Equal.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._equals.disconnect();
		this._equals = null;
		this._sub.dispose();
		this._sub = null;
	};

	return Tone.Equal;
});