define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class  Multiply the incoming signal by a number or Multiply two signals.
	 *          input 0: multiplicand.
	 *          input 1: multiplier.
	 *
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @param {number=} value constant value to multiple. if no value is provided
	 *                         it will be multiplied by the value of input 1.
	 */
	Tone.Multiply = function(value){

		Tone.call(this, 2, 0);

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

	Tone.extend(Tone.Multiply, Tone.SignalBase);

	/**
	 * The value being multiplied to the incoming signal.
	 * @memberOf Tone.Multiply#
	 * @type {number}
	 * @name value
	 */
	Object.defineProperty(Tone.Multiply.prototype, "value", {
		get : function(){
			return this._factor.value;
		},
		set : function(value){
			this._factor.value = value;	
		}
	});

	/**
	 *  clean up
	 *  @returns {Tone.Multiply} `this`
	 */
	Tone.Multiply.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._mult = null;
		this._factor = null;
		return this;
	}; 

	return Tone.Multiply;
});
