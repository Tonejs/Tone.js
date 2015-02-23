define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class Add a signal and a number or two signals. 
	 *         input 0: augend. input 1: addend. 
	 *         The value being added to the incoming signal. Note, that
	 *         if Add was constructed without any arguments, it expects
	 *         that the signals to add will be connected to input 0 and input 1
	 *         and therefore will throw an error when trying to set the value. 
	 *
	 *  @constructor
	 *  @extends {Tone.Signal}
	 *  @param {number=} value if no value is provided, Tone.Add will sum the first
	 *                         and second inputs. 
	 */
	Tone.Add = function(value){

		Tone.call(this, 2, 0);

		/**
		 *  the summing node
		 *  @type {GainNode}
		 *  @private
		 */
		this._sum = this.input[0] = this.input[1] = this.output = this.context.createGain();

		/**
		 *  @private
		 *  @type {Tone.Signal}
		 */
		this._value = this.input[1] = new Tone.Signal(value);

		this._value.connect(this._sum);
	};

	Tone.extend(Tone.Add, Tone.Signal);
	
	/**
	 *  dispose method
	 *  @returns {Tone.Add} `this`
	 */
	Tone.Add.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._sum.disconnect();
		this._sum = null;
		this._value.dispose();
		this._value = null;
		return this;
	}; 

	return Tone.Add;
});