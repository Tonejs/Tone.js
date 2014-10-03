define(["Tone/core/Tone", "Tone/signal/GreaterThan", "Tone/signal/Negate"], function(Tone){

	"use strict";

	/**
	 *  @class  Output 1 if the signal is less than the value, otherwise outputs 0
	 *  
	 *  @constructor
	 *  @extends {Tone}
	 *  @param {number=} [value=0] the value to compare to the incoming signal
	 */
	Tone.LessThan = function(value){

		/**
		 *  negate the incoming signal
		 *  @type {Tone.Negate}
		 *  @private
		 */
		this._neg = new Tone.Negate();

		/**
		 *  input < value === -input > -value
		 *  @type {Tone.GreaterThan}
		 *  @private
		 */
		this._gt = new Tone.GreaterThan(-value);

		/**
	 	 *  alias for the adder
		 *  @type {Tone.Negate}
		 */
		this.input = this._neg;

		/**
		 *  alias for the thresh
		 *  @type {Tone.GreatThan}
		 */
		this.output = this._gt;

		//connect
		this._neg.connect(this._gt);
	};

	Tone.extend(Tone.LessThan);

	/**
	 *  set the value to compare to
	 *  
	 *  @param {number} value
	 */
	Tone.LessThan.prototype.setValue = function(value){
		this._gt.setValue(-value);
	};

	/**
	 *  borrows the method from {@link Tone.Signal}
	 *  
	 *  @function
	 */
	Tone.LessThan.prototype.connect = Tone.Signal.prototype.connect;

	/**
	 *  dispose method
	 */
	Tone.LessThan.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._neg.dispose();
		this._gt.dispose();
		this._neg = null;
		this._gt = null;
	};

	return Tone.LessThan;
});