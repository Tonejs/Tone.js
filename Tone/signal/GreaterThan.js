define(["Tone/core/Tone", "Tone/signal/GreaterThanZero", "Tone/signal/Add"], function(Tone){

	"use strict";

	/**
	 *  @class  Output 1 if the signal is greater than the value, otherwise outputs 0
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [value=0] the value to compare to the incoming signal
	 */
	Tone.GreaterThan = function(value){
		
		/**
		 *  subtract the amount from the incoming signal
		 *  @type {Tone.Add}
		 *  @private
		 */
		this._adder = new Tone.Add(-value);

		/**
		 *  compare that amount to zero
		 *  @type {Tone.GreaterThanZero}
		 *  @private
		 */
		this._gtz = new Tone.GreaterThanZero();

		/**
	 	 *  alias for the negate
		 *  @type {Tone.Negate}
		 */
		this.input = this._adder;

		/**
		 *  alias for the less than
		 *  @type {Tone.LessThan}
		 */
		this.output = this._gtz;

		//connect
		this._adder.connect(this._gtz);
	};

	Tone.extend(Tone.GreaterThan);

	/**
	 *  set the value to compare to
	 *  
	 *  @param {number} value
	 */
	Tone.GreaterThan.prototype.setValue = function(value){
		this._adder.setValue(-value);
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.GreaterThan.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.GreaterThan.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._adder.dispose();
		this._gtz.dispose();
		this._adder = null;
		this._gtz = null;
	};

	return Tone.GreaterThan;
});