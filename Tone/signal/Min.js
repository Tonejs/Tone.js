define(["Tone/core/Tone", "Tone/signal/LessThan", "Tone/signal/IfThenElse", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 * 	@class  the output signal is the lesser of the incoming signal and min
	 * 	
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} min the minimum to compare to the incoming signal
	 */
	Tone.Min = function(min){
		
		/**
		 *  input node
		 *  @type {GainNode}
		 */
		this.input = this.context.createGain();

		/**
		 *  the min signal
		 *  @type {Tone.Signal}
		 *  @private
		 */
		this._minSignal = new Tone.Signal(min);

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
		this._lt = new Tone.LessThan(min);

		//connections
		this.chain(this.input, this._lt, this._ifThenElse.if);
		this.input.connect(this._ifThenElse.then);
		this._minSignal.connect(this._ifThenElse.else);
	};

	Tone.extend(Tone.Min);

	/**
	 *  set the min value
	 *  @param {number} min the minimum to compare to the incoming signal
	 */
	Tone.Min.prototype.setMin = function(min){
		this._minSignal.setValue(min);
		this._lt.setValue(min);
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