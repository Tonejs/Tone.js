define(["Tone/core/Tone", "Tone/signal/EqualZero", "Tone/signal/Add", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class  Output 1 if the signal is equal to the value, otherwise outputs 0
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} value the number to compare the incoming signal to
	 */
	Tone.Equal = function(value){

		/**
		 *  subtract the value from the incoming signal
		 *  
		 *  @type {Tone.Add}
		 *  @private
		 */
		this._adder = new Tone.Add(-value);
		/**
		 *  @type {Tone.EqualZero}
		 *  @private
		 */
		this._equals = new Tone.EqualZero();

		/**
		 *  @type {Tone.Add}
		 */
		this.input = this._adder;

		/**
		 *  @type {Tone.EqualZero}
		 */
		this.output = this._equals;

		this._adder.connect(this._equals);
	};

	Tone.extend(Tone.Equal);

	/**
	 * 	@param {number} value set the comparison value
	 */
	Tone.Equal.prototype.setValue = function(value){
		this._adder.setValue(-value);
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
		this._adder.dispose();
		this._equals = null;
		this._adder = null;
	};

	return Tone.Equal;
});