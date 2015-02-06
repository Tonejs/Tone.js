define(["Tone/core/Tone", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class Add a signal and a number or two signals. 
	 *         input 0: augend. input 1: addend. 
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
		this._addend = null;

		if (isFinite(value)){
			this._addend = new Tone.Signal(value);
			this._addend.connect(this._sum);
		} 
	};

	Tone.extend(Tone.Add, Tone.SignalBase);

	/**
	 * The value being added to the incoming signal. Note, that
	 * if Add was constructed without any arguments, it expects
	 * that the signals to add will be connected to input 0 and input 1
	 * and therefore will throw an error when trying to set the value. 
	 * 
	 * @memberOf Tone.Add#
	 * @type {number}
	 * @name value
	 */
	Object.defineProperty(Tone.Add.prototype, "value", {
		get : function(){
			if (this._addend !== null){
				return this._addend.value;
			} else {
				throw new Error("cannot switch from signal to number");
			}
		},
		set : function(value){
			if (this._addend !== null){
				this._addend.value = value;
			} else {
				throw new Error("cannot switch from signal to number");
			}
		}
	});

	/**
	 *  dispose method
	 *  @returns {Tone.Add} `this`
	 */
	Tone.Add.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._sum = null;
		if (this._addend){
			this._addend.dispose();
			this._addend = null;
		}
		return this;
	}; 

	return Tone.Add;
});