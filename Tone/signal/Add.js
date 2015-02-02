define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class Add a signal and a number or two signals. 
	 *         input 0: augend. input 1: addend
	 *
	 *  @constructor
	 *  @extends {Tone.SignalBase}
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
		this._value = null;

		if (isFinite(value)){
			this._value = new Tone.Signal(value);
			this._value.connect(this._sum);
		}
	};

	Tone.extend(Tone.Add, Tone.SignalBase);

	/**
	 *  set the constant
	 *  
	 *  @param {number} value 
	 *  @returns {Tone.Add} `this`
	 */
	Tone.Add.prototype.setValue = function(value){
		if (this._value !== null){
			this._value.setValue(value);
		} else {
			throw new Error("cannot switch from signal to number");
		}
		return this;
	}; 

	/**
	 *  dispose method
	 *  @returns {Tone.Add} `this`
	 */
	Tone.Add.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._sum = null;
		if (this._value){
			this._value.dispose();
			this._value = null;
		}
		return this;
	}; 

	return Tone.Add;
});