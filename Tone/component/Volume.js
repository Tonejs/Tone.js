import Tone from "../core/Tone";
import "../signal/Signal";
import "../core/Gain";
import "../core/AudioNode";

/**
 *  @class Tone.Volume is a simple volume node, useful for creating a volume fader.
 *
 *  @extends {Tone.AudioNode}
 *  @constructor
 *  @param {Decibels} [volume=0] the initial volume
 *  @example
 * var vol = new Tone.Volume(-12);
 * instrument.chain(vol, Tone.Master);
 */
Tone.Volume = function(){

	var options = Tone.defaults(arguments, ["volume"], Tone.Volume);
	Tone.AudioNode.call(this, options);

	/**
	 * the output node
	 * @type {GainNode}
	 * @private
	 */
	this.output = this.input = new Tone.Gain(options.volume, Tone.Type.Decibels);

	/**
	 * The unmuted volume
	 * @type {Decibels}
	 * @private
	 */
	this._unmutedVolume = options.volume;

	/**
	 *  The volume control in decibels.
	 *  @type {Decibels}
	 *  @signal
	 */
	this.volume = this.output.gain;

	this._readOnly("volume");

	//set the mute initially
	this.mute = options.mute;
};

Tone.extend(Tone.Volume, Tone.AudioNode);

/**
 *  Defaults
 *  @type  {Object}
 *  @const
 *  @static
 */
Tone.Volume.defaults = {
	"volume" : 0,
	"mute" : false
};

/**
 * Mute the output.
 * @memberOf Tone.Volume#
 * @type {boolean}
 * @name mute
 * @example
 * //mute the output
 * volume.mute = true;
 */
Object.defineProperty(Tone.Volume.prototype, "mute", {
	get : function(){
		return this.volume.value === -Infinity;
	},
	set : function(mute){
		if (!this.mute && mute){
			this._unmutedVolume = this.volume.value;
			//maybe it should ramp here?
			this.volume.value = -Infinity;
		} else if (this.mute && !mute){
			this.volume.value = this._unmutedVolume;
		}
	}
});

/**
 *  clean up
 *  @returns {Tone.Volume} this
 */
Tone.Volume.prototype.dispose = function(){
	this.input.dispose();
	Tone.AudioNode.prototype.dispose.call(this);
	this._writable("volume");
	this.volume.dispose();
	this.volume = null;
	return this;
};

export default Tone.Volume;

