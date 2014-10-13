define(["Tone/core/Tone", "Tone/signal/GreaterThan", "Tone/signal/IfThenElse", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 * 	@class  the output signal is the greater of the incoming signal and max
	 * 	
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} max 
	 */
	Tone.Max = function(max){
		
		/**
		 *  input node
		 *  @type {GainNode}
		 */
		this.input = this.context.createGain();

		/**
		 *  the max signal
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._maxSignal = new Tone.Signal(max);

		/**
		 *  @type {Tone.Select}
		 *  @private
		 */
		this._ifThenElse = new Tone.IfThenElse();

		/**
		 *  the output node
		 */
		this.output = this._ifThenElse;

		/**
		 *  @type {Tone.Select}
		 *  @private
		 */
		this._gt = new Tone.GreaterThan(max);

		//connections
		this.chain(this.input, this._gt, this._ifThenElse.if);
		this.input.connect(this._ifThenElse.then);
		this._maxSignal.connect(this._ifThenElse.else);
	};

	Tone.extend(Tone.Max);

	/**
	 *  set the max value
	 *  @param {number} max the maximum to compare to the incoming signal
	 */
	Tone.Max.prototype.setMax = function(max){
		this._maxSignal.setValue(max);
		this._gt.setValue(max);
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