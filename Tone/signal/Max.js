define(["Tone/core/Tone", "Tone/signal/GreaterThan", "Tone/signal/IfThenElse", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 * 	@class  outputs the greater of two signals. If a number is provided in the constructor
	 * 	        it will use that instead of the signal. 
	 * 	
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} max max value if provided. if not provided, it will use the
	 *                       signal value from input 1. 
	 */
	Tone.Max = function(max){

		Tone.call(this, 2, 0);
		this.input[0] = this.context.createGain();

		/**
		 *  the max signal
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._maxSignal = this.input[1] = new Tone.Signal(max);

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
		this.chain(this.input[0], this._gt, this._ifThenElse.if);
		this.input[0].connect(this._ifThenElse.then);
		this._maxSignal.connect(this._ifThenElse.else);
		this._maxSignal.connect(this._gt, 0, 1);
	};

	Tone.extend(Tone.Max);

	/**
	 *  set the max value
	 *  @param {number} max the maximum to compare to the incoming signal
	 */
	Tone.Max.prototype.setMax = function(max){
		this._maxSignal.setValue(max);
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Max.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.Max.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._maxSignal.dispose();
		this._ifThenElse.dispose();
		this._gt.dispose();
		this._maxSignal = null;
		this._ifThenElse = null;
		this._gt = null;
	};

	return Tone.Max;
});