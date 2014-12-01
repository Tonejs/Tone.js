define(["Tone/core/Tone", "Tone/signal/LessThan", "Tone/signal/IfThenElse", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 * 	@class  outputs the lesser of two signals. If a number is given 
	 * 	        in the constructor, it will use a signal and a number. 
	 * 	
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} min the minimum to compare to the incoming signal
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
		this._minSignal = this.input[1] = new Tone.Signal(min);

		//connections
		this.input[0].chain(this._lt, this._ifThenElse.if);
		this.input[0].connect(this._ifThenElse.then);
		this._minSignal.connect(this._ifThenElse.else);
		this._minSignal.connect(this._lt, 0, 1);
	};

	Tone.extend(Tone.Min);

	/**
	 *  set the min value
	 *  @param {number} min the minimum to compare to the incoming signal
	 */
	Tone.Min.prototype.setMin = function(min){
		this._minSignal.setValue(min);
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.Min.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  clean up
	 */
	Tone.Min.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._minSignal.dispose();
		this._ifThenElse.dispose();
		this._lt.dispose();
		this._minSignal = null;
		this._ifThenElse = null;
		this._lt = null;
	};

	return Tone.Min;
});