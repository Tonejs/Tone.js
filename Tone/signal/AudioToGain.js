define(["Tone/core/Tone"], function(Tone){

	"use strict";

	/**
	 *  the waveshaper's curve
	 *  @type {Float32Array}
	 *  @private
	 *  @static
	 */
	var curveLength = 128;
	var normCurve = new Float32Array(curveLength);
	for (var i = 0; i < curveLength; i++){
		normCurve[i] = i / (curveLength - 1);
	}

	/**
	 *  @class AudioToGain converts an input range of -1,1 to 0,1
	 *
	 *  @extends {Tone}
	 *  @constructor
	 */
	Tone.AudioToGain = function(){

		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._norm = this.input = this.output = this.context.createWaveShaper();
		this._norm.curve = normCurve;
	};

	Tone.extend(Tone.AudioToGain);

	/**
	 *  clean up
	 */
	Tone.AudioToGain.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._norm.disconnect();
		this._norm = null;
	};

	return Tone.AudioToGain;
});