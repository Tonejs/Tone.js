define(["Tone/core/Tone", "Tone/signal/LessThan", "Tone/signal/IfThenElse", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 * 	@class  Outputs the lesser of two signals. If a number is given 
	 * 	        in the constructor, it will use a signal and a number. 
	 * 	
	 *  @constructor
	 *  @extends {Tone.Signal}
	 *  @param {number} min The minimum to compare to the incoming signal
	 *  @example
	 * var min = new Tone.Min(2);
	 * var sig = new Tone.Signal(3).connect(min);
	 * //min outputs 2
	 * sig.value = 1;
	 * //min outputs 1
	 * 	 @example
	 * var min = new Tone.Min();
	 * var sigA = new Tone.Signal(3);
	 * var sigB = new Tone.Signal(4);
	 * sigA.connect(min, 0, 0);
	 * sigB.connect(min, 0, 1);
	 * //output of min is 3.
	 */
	Tone.Min = function(min){

		Tone.call(this, 2, 0);
		this.input[0] = this.context.createGain();

		/**
		 *  @type {Tone.Select}
		 *  @private
		 */
		this._ifThenElse = this.output = new Tone.IfThenElse();

		/**
		 *  @type {Tone.Select}
		 *  @private
		 */
		this._lt = new Tone.LessThan();

		/**
		 *  the min signal
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._param = this.input[1] = new Tone.Signal(min);

		//connections
		this.input[0].chain(this._lt, this._ifThenElse.if);
		this.input[0].connect(this._ifThenElse.then);
		this._param.connect(this._ifThenElse.else);
		this._param.connect(this._lt, 0, 1);
	};

	Tone.extend(Tone.Min, Tone.Signal);

	/**
	 *  clean up
	 *  @returns {Tone.Min} this
	 */
	Tone.Min.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._param.dispose();
		this._ifThenElse.dispose();
		this._lt.dispose();
		this._param = null;
		this._ifThenElse = null;
		this._lt = null;
		return this;
	};

	return Tone.Min;
});