define(["Tone/core/Tone", "Tone/signal/Add", "Tone/signal/Negate", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class Subtract a signal and a number or two signals. 
	 *         input 0 : minuend.
	 *         input 1 : subtrahend
	 *
	 *  @extends {Tone.Signal}
	 *  @constructor
	 *  @param {number=} value value to subtract from the incoming signal. If the value
	 *                         is omitted, it will subtract the second signal from the first
	 *  @example
	 *  var sub = new Tone.Subtract(1);
	 *  var sig = new Tone.Signal(4).connect(sub);
	 *  //the output of sub is 3. 
	 */
	Tone.Subtract = function(value){

		Tone.call(this, 2, 0);

		/**
		 *  the summing node
		 *  @type {GainNode}
		 *  @private
		 */
		this._sum = this.input[0] = this.output = this.context.createGain();

		/**
		 *  negate the input of the second input before connecting it
		 *  to the summing node.
		 *  @type {Tone.Negate}
		 *  @private
		 */
		this._neg = new Tone.Negate();

		/**
		 *  the node where the value is set
		 *  @private
		 *  @type {Tone.Signal}
		 */
		this._value = this.input[1] = new Tone.Signal(value);

		this._value.chain(this._neg, this._sum);
	};

	Tone.extend(Tone.Subtract, Tone.Signal);

	/**
	 *  clean up
	 *  @returns {Tone.SignalBase} `this`
	 */
	Tone.Subtract.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._neg.dispose();
		this._neg = null;
		this._sum.disconnect();
		this._sum = null;
		this._value.dispose();
		this._value = null;
		return this;
	};

	return Tone.Subtract;
});