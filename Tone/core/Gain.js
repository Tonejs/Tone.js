import Tone from "../core/Tone";
import "../core/Param";
import "../type/Type";
import "../core/AudioNode";

/**
 *  @class A thin wrapper around the Native Web Audio GainNode.
 *         The GainNode is a basic building block of the Web Audio
 *         API and is useful for routing audio and adjusting gains.
 *  @extends {Tone.AudioNode}
 *  @param  {Number=}  gain  The initial gain of the GainNode
 *  @param {Tone.Type=} units The units of the gain parameter.
 */
Tone.Gain = function(){

	var options = Tone.defaults(arguments, ["gain", "units"], Tone.Gain);
	Tone.AudioNode.call(this, options);

	/**
	 *  The GainNode
	 *  @type  {GainNode}
	 *  @private
	 */
	this.input = this.output = this._gainNode = this.context.createGain();

	/**
	 *  The gain parameter of the gain node.
	 *  @type {Gain}
	 *  @signal
	 */
	this.gain = new Tone.Param({
		"param" : this._gainNode.gain,
		"units" : options.units,
		"value" : options.gain,
		"convert" : options.convert
	});
	this._readOnly("gain");
};

Tone.extend(Tone.Gain, Tone.AudioNode);

/**
 *  The defaults
 *  @const
 *  @type  {Object}
 */
Tone.Gain.defaults = {
	"gain" : 1,
	"convert" : true,
};

/**
 *  Clean up.
 *  @return  {Tone.Gain}  this
 */
Tone.Gain.prototype.dispose = function(){
	Tone.AudioNode.prototype.dispose.call(this);
	this._gainNode.disconnect();
	this._gainNode = null;
	this._writable("gain");
	this.gain.dispose();
	this.gain = null;
};

export default Tone.Gain;

