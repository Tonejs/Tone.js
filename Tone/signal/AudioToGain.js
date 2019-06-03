import Tone from "../core/Tone";
import "../signal/WaveShaper";
import "../signal/Signal";

/**
 *  @class AudioToGain converts an input in AudioRange [-1,1] to NormalRange [0,1]. 
 *         See Tone.GainToAudio.
 *
 *  @extends {Tone.SignalBase}
 *  @constructor
 *  @example
 *  var a2g = new Tone.AudioToGain();
 */
Tone.AudioToGain = function(){

	Tone.SignalBase.call(this);
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
 *  @returns {Tone.AudioToGain} this
 */
Tone.AudioToGain.prototype.dispose = function(){
	Tone.SignalBase.prototype.dispose.call(this);
	this._norm.dispose();
	this._norm = null;
	return this;
};

export default Tone.AudioToGain;

