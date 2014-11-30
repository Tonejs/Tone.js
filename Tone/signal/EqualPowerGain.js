define(["Tone/core/Tone"], function(Tone){

	"use strict";

	/**
	 *  the waveshaper curve
	 *  @type {Float32Array}
	 *  @private
	 *  @static
	 */
	var curveLength = 1024;
	var eqPowCurve = new Float32Array(curveLength);
	for (var i = 0; i < curveLength; i++){
		var normalized = Math.abs((i / (curveLength - 1)) * 2 - 1);
		eqPowCurve[i] = Tone.prototype.equalPowerScale(normalized);
	}

	/**
	 *  @class Convert an incoming signal between 0,1 to an equal power gain scale.
	 *
	 *  @extends {Tone}
	 *  @constructor
	 */
	Tone.EqualPowerGain = function(){

		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._eqPower = this.input = this.output = this.context.createWaveShaper();
		this._eqPower.curve = eqPowCurve;
	};

	Tone.extend(Tone.EqualPowerGain);

	/**
	 *  clean up
	 */
	Tone.EqualPowerGain.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._eqPower.disconnect();
		this._eqPower = null;
	};

	return Tone.EqualPowerGain;
});