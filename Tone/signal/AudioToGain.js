define(["Tone/core/Tone", "Tone/signal/WaveShaper", "Tone/signal/Signal"], function(Tone){

	"use strict";

	/**
	 *  @class AudioToGain converts an input range of -1,1 to 0,1
	 *
	 *  @extends {Tone.SignalBase}
	 *  @constructor
	 *  @example
	 *  var a2g = new Tone.AudioToGain();
	 */
	Tone.AudioToGain = function(){

		/**
		 *  @type {WaveShaperNode}
		 *  @private
		 */
		this._norm = this.input = this.output = new Tone.WaveShaper(function(x){
			return (x + 1) / 2;
		});
	};

	Tone.extend(Tone.AudioToGain, Tone.SignalBase);

	/**
	 *  clean up
	 *  @returns {Tone.AudioToGain} `this`
	 */
	Tone.AudioToGain.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._norm.disconnect();
		this._norm = null;
		return this;
	};

	return Tone.AudioToGain;
});