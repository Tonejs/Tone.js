define(["Tone/core/Tone", "Tone/signal/WaveShaper"], function(Tone){

	"use strict";

	/**
	 *  @class Convert an incoming signal between 0, 1 to an equal power gain scale.
	 *
	 *  @extends {Tone.SignalBase}
	 *  @constructor
	 *  @example
	 * var eqPowGain = new Tone.EqualPowerGain();
	 */
	Tone.EqualPowerGain = function(){

		/**
		 *  @type {Tone.WaveShaper}
		 *  @private
		 */
		this._eqPower = this.input = this.output = new Tone.WaveShaper(function(val){
			if (Math.abs(val) < 0.001){
				//should output 0 when input is 0
				return 0;
			} else {
				return this.equalPowerScale(val);
			}
		}.bind(this), 4096);
	};

	Tone.extend(Tone.EqualPowerGain, Tone.SignalBase);

	/**
	 *  clean up
	 *  @returns {Tone.EqualPowerGain} this
	 */
	Tone.EqualPowerGain.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._eqPower.dispose();
		this._eqPower = null;
		return this;
	};

	return Tone.EqualPowerGain;
});