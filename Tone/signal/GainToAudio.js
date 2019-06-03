import Tone from "../core/Tone";
import "../signal/WaveShaper";
import "../signal/Signal";

/**
 *  @class Maps a NormalRange [0, 1] to an AudioRange [-1, 1]. 
 *         See also Tone.AudioToGain. 
 *
 *  @extends {Tone.SignalBase}
 *  @constructor
 *  @example
 * var g2a = new Tone.GainToAudio();
 */
Tone.GainToAudio = function(){

	Tone.SignalBase.call(this);
	
	/**
	 *  @type {WaveShaperNode}
	 *  @private
	 */
	this._norm = this.input = this.output = new Tone.WaveShaper(function(x){
		return Math.abs(x) * 2 - 1;
	});
};

Tone.extend(Tone.GainToAudio, Tone.SignalBase);

/**
 *  clean up
 *  @returns {Tone.GainToAudio} this
 */
Tone.GainToAudio.prototype.dispose = function(){
	Tone.SignalBase.prototype.dispose.call(this);
	this._norm.dispose();
	this._norm = null;
	return this;
};

export default Tone.GainToAudio;

