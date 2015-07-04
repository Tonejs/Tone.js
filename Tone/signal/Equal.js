define(["Tone/core/Tone", "Tone/signal/EqualZero", "Tone/signal/Subtract", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class  Output 1 if the signal is equal to the value, otherwise outputs 0. 
	 *          Can accept two signals if connected to inputs 0 and 1.
	 *  
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @param {number=} value The number to compare the incoming signal to
	 *  @example
	 * var eq = new Tone.Equal(3);
	 * var sig = new Tone.Signal(3).connect(eq);
	 * //the output of eq is 1. 
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

	Tone.extend(Tone.Equal, Tone.SignalBase);

	/**
	 * The value to compare to the incoming signal.
	 * @memberOf Tone.Equal#
	 * @type {number}
	 * @name value
	 */
	Object.defineProperty(Tone.Equal.prototype, "value", {
		get : function(){
			return this._sub.value;
		},
		set : function(value){
			this._sub.value = value;
		}
	});

	/**
	 *  Clean up.
	 *  @returns {Tone.Equal} this
	 */
	Tone.Equal.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._equals.dispose();
		this._equals = null;
		this._sub.dispose();
		this._sub = null;
		return this;
	};

	return Tone.Equal;
});