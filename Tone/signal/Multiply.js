define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class  Multiply the incoming signal by a number or Multiply two signals
	 *
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} value constant value to multiple
	 */
	Tone.Multiply = function(value){

		/**
		 *  input 0: multiplicand
		 *  input 1: multiplier
		 *  @type {Array}
		 */
		this.input = new Array(2);

		/**
		 *  the input node is the same as the output node
		 *  it is also the GainNode which handles the scaling of incoming signal
		 *  
		 *  @type {GainNode}
		 *  @private
		 */
		this._mult = this.input[0] = this.output = this.context.createGain();

		/**
		 *  the scaling parameter
		 *  @type {AudioParam}
		 *  @private
		 */
		this._factor = this.input[1] = this.output.gain;
		
		this._factor.value = this.defaultArg(value, 0);
	};

	Tone.extend(Tone.Multiply);

	/**
	 *  set the constant multiple
	 *  	
	 *  @param {number} value 
	 */
	Tone.Multiply.prototype.setValue = function(value){
		this._factor.value = value;
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Multiply.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.Multiply.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._mult = null;
		this._factor = null;
	}; 

	return Tone.Multiply;
});
