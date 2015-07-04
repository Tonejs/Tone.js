define(["Tone/core/Tone", "Tone/signal/Select", "Tone/signal/Equal"], function(Tone){

	"use strict";

	/**
	 *  @class IfThenElse has three inputs. When the first input (if) is true (i.e. === 1), 
	 *         then it will pass the second input (then) through to the output, otherwise, 
	 *         if it's not true (i.e. === 0) then it will pass the third input (else) 
	 *         through to the output. 
	 *
	 *  @extends {Tone.SignalBase}
	 *  @constructor
	 *  @example
	 * var ifThenElse = new Tone.IfThenElse();
	 * var ifSignal = new Tone.Signal(1).connect(ifThenElse.if);
	 * var pwmOsc = new Tone.PWMOscillator().connect(ifThenElse.then);
	 * var pulseOsc = new Tone.PulseOscillator().connect(ifThenElse.else);
	 * //ifThenElse outputs pwmOsc
	 * signal.value = 0;
	 * //now ifThenElse outputs pulseOsc
	 */
	Tone.IfThenElse = function(){

		Tone.call(this, 3, 0);

		/**
		 *  the selector node which is responsible for the routing
		 *  @type {Tone.Select}
		 *  @private
		 */
		this._selector = this.output = new Tone.Select(2);

		//the input mapping
		this.if = this.input[0] = this._selector.gate;
		this.then = this.input[1] = this._selector.input[1];
		this.else = this.input[2] = this._selector.input[0];
	};

	Tone.extend(Tone.IfThenElse, Tone.SignalBase);

	/**
	 *  clean up
	 *  @returns {Tone.IfThenElse} this
	 */
	Tone.IfThenElse.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._selector.dispose();
		this._selector = null;
		this.if = null;
		this.then = null;
		this.else = null;
		return this;
	};

	return Tone.IfThenElse;
});