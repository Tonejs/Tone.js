define(["Tone/core/Tone", "Tone/signal/LessThan", "Tone/signal/Negate", "Tone/signal/Signal"], function(Tone){

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
		 *  @type {Tone.LessThan}
		 *  @private
		 */
		this._lt = new Tone.LessThan(-value);

		/**
		 *  @type {Tone.Negate}
		 *  @private
		 */
		this._neg = new Tone.Negate();

		/**
	 	 *  alias for the adder
		 *  @type {Tone.Add}
		 */
		this.input = this._neg;

		/**
		 *  alias for the thresh
		 *  @type {Tone.Threshold}
		 */
		this.output = this._lt;

		//connect
		this._neg.connect(this._lt);
	};

	Tone.extend(Tone.GreaterThan);

	/**
	 *  set the value to compare to
	 *  
	 *  @param {number} value
	 */
	Tone.GreaterThan.prototype.setValue = function(value){
		this._lt.setValue(-value);
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
		this._lt.disconnect();
		this._neg.disconnect();
		this._lt = null;
		this._neg = null;
	};

	return Tone.GreaterThan;
});