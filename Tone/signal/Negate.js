define(["Tone/core/Tone", "Tone/signal/Multiply", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class Negate the incoming signal. i.e. an input signal of 10 will output -10
	 *
	 *  @constructor
	 *  @extends {Tone}
	 */
	Tone.Negate = function(){
		/**
		 *  negation is done by multiplying by -1
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._multiply = new Tone.Multiply(-1);

		/**
		 *  the input and output
		 */
		this.input = this.output = this._multiply;
	};

	Tone.extend(Tone.Negate);

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Negate.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.Negate.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._multiply.dispose();
		this._multiply = null;
	}; 

	return Tone.Negate;
});