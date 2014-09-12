define(["Tone/core/Tone", "Tone/signal/LessThan", "Tone/signal/Select", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 * 	@class  the output signal is the lesser of the incoming signal and min
	 * 	
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number} min the minimum to compare to the incoming signal
	 */
	Tone.Min = function(min){
		Tone.call(this);

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
		this._switch = new Tone.Select(2);

		/**
		 *  @type {Tone.Select}
		 *  @private
		 */
		this._lt = new Tone.LessThan(min);

		//connections
		this._minSignal.connect(this._switch, 0, 0);
		this.input.connect(this._switch, 0, 1);
		this.input.connect(this._lt);
		this._lt.connect(this._switch.gate);
		this._switch.connect(this.output);
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
		this._switch.dispose();
		this._lt.dispose();
		this._minSignal = null;
		this._switch = null;
		this._lt = null;
	};

	return Tone.Min;
});