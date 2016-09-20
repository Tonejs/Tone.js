define(["Tone/core/Tone", "Tone/signal/WaveShaper", "Tone/signal/SignalBase"], 
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
		/**
		 *  @type {Tone.LessThan}
		 *  @private
		 */
		this._abs = this.input = this.output = new Tone.WaveShaper(function(val){
			if (val === 0){
				return 0;
			} else {
				return Math.abs(val);
			}
		}, 127);
	};

	Tone.extend(Tone.Abs, Tone.SignalBase);

	/**
	 *  dispose method
	 *  @returns {Tone.Abs} this
	 */
	Tone.Abs.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._abs.dispose();
		this._abs = null;
		return this;
	}; 

	return Tone.Abs;
});