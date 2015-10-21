define(["Tone/core/Tone", "Tone/signal/GreaterThan", "Tone/signal/IfThenElse", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 * 	@class  Outputs the greater of two signals. If a number is provided in the constructor
	 * 	        it will use that instead of the signal. 
	 * 	
	 *  @constructor
	 *  @extends {Tone.Signal}
	 *  @param {number=} max Max value if provided. if not provided, it will use the
	 *                       signal value from input 1. 
	 *  @example
	 * var max = new Tone.Max(2);
	 * var sig = new Tone.Signal(3).connect(max);
	 * //max outputs 3
	 * sig.value = 1;
	 * //max outputs 2
	 *  @example
	 * var max = new Tone.Max();
	 * var sigA = new Tone.Signal(3);
	 * var sigB = new Tone.Signal(4);
	 * sigA.connect(max, 0, 0);
	 * sigB.connect(max, 0, 1);
	 * //output of max is 4.
	 */
	Tone.Max = function(max){

		Tone.call(this, 2, 0);
		this.input[0] = this.context.createGain();

		/**
		 *  the max signal
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._param = this.input[1] = new Tone.Signal(max);

		/**
		 *  @type {Tone.Select}
		 *  @private
		 */
		this._ifThenElse = this.output = new Tone.IfThenElse();

		/**
		 *  @type {Tone.Select}
		 *  @private
		 */
		this._gt = new Tone.GreaterThan();

		//connections
		this.input[0].chain(this._gt, this._ifThenElse.if);
		this.input[0].connect(this._ifThenElse.then);
		this._param.connect(this._ifThenElse.else);
		this._param.connect(this._gt, 0, 1);
	};

	Tone.extend(Tone.Max, Tone.Signal);

	/**
	 * 	Clean up.
	 *  @returns {Tone.Max} this
	 */
	Tone.Max.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._param.dispose();
		this._ifThenElse.dispose();
		this._gt.dispose();
		this._param = null;
		this._ifThenElse = null;
		this._gt = null;
		return this;
	};

	return Tone.Max;
});