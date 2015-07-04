define(["Tone/core/Tone", "Tone/signal/Select", "Tone/signal/Negate", "Tone/signal/LessThan", "Tone/signal/Signal"], 
function(Tone){

	"use strict";

	/**
	 *  @class Return the absolute value of an incoming signal. 
	 *  
	 *  @constructor
	 *  @extends {Tone.SignalBase}
	 *  @example
	 * var signal = new Tone.Signal(-1);
	 * var abs = new Tone.Abs();
	 * signal.connect(abs);
	 * //the output of abs is 1. 
	 */
	Tone.Abs = function(){
		Tone.call(this, 1, 0);

		/**
		 *  @type {Tone.LessThan}
		 *  @private
		 */
		this._ltz = new Tone.LessThan(0);

		/**
		 *  @type {Tone.Select}
		 *  @private
		 */
		this._switch = this.output = new Tone.Select(2);
		
		/**
		 *  @type {Tone.Negate}
		 *  @private
		 */
		this._negate = new Tone.Negate();

		//two signal paths, positive and negative
		this.input.connect(this._switch, 0, 0);
		this.input.connect(this._negate);
		this._negate.connect(this._switch, 0, 1);
		
		//the control signal
		this.input.chain(this._ltz, this._switch.gate);
	};

	Tone.extend(Tone.Abs, Tone.SignalBase);

	/**
	 *  dispose method
	 *  @returns {Tone.Abs} this
	 */
	Tone.Abs.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._switch.dispose();
		this._switch = null;
		this._ltz.dispose();
		this._ltz = null;
		this._negate.dispose();
		this._negate = null;
		return this;
	}; 

	return Tone.Abs;
});