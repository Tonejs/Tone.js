define(["Tone/core/Tone", "Tone/signal/WaveShaper"], function(Tone){

	"use strict";

	/**
	 *  @class Convert an incoming signal between 0,1 to an equal power gain scale.
	 *
	 *  @extends {Tone}
	 *  @constructor
	 */
	Tone.EqualPowerGain = function(){

		/**
		 *  @type {Tone.WaveShaper}
		 *  @private
		 */
		this._eqPower = this.input = this.output = new Tone.WaveShaper(function(val){
			return Tone.prototype.equalPowerScale(val);
		});
	};

	Tone.extend(Tone.EqualPowerGain);

	/**
	 *  clean up
	 */
	Tone.EqualPowerGain.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._eqPower.dispose();
		this._eqPower = null;
	};

	return Tone.EqualPowerGain;
});