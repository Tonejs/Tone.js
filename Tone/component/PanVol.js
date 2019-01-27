import Tone from "../core/Tone";
import "../component/Panner";
import "../component/Volume";
import "../core/AudioNode";

/**
 *  @class Tone.PanVol is a Tone.Panner and Tone.Volume in one.
 *
 *  @extends {Tone.AudioNode}
 *  @constructor
 *  @param {AudioRange} pan the initial pan
 *  @param {number} volume The output volume.
 *  @example
 * //pan the incoming signal left and drop the volume
 * var panVol = new Tone.PanVol(-0.25, -12);
 */
Tone.PanVol = function(){

	var options = Tone.defaults(arguments, ["pan", "volume"], Tone.PanVol);
	Tone.AudioNode.call(this);

	/**
	 *  The panning node
	 *  @type {Tone.Panner}
	 *  @private
	 */
	this._panner = this.input = new Tone.Panner(options.pan);

	/**
	 *  The L/R panning control.
	 *  @type {AudioRange}
	 *  @signal
	 */
	this.pan = this._panner.pan;

	/**
	 *  The volume node
	 *  @type {Tone.Volume}
	 *  @private
	 */
	this._volume = this.output = new Tone.Volume(options.volume);

	/**
	 *  The volume control in decibels.
	 *  @type {Decibels}
	 *  @signal
	 */
	this.volume = this._volume.volume;

	//connections
	this._panner.connect(this._volume);
	this.mute = options.mute;

	this._readOnly(["pan", "volume"]);
};

Tone.extend(Tone.PanVol, Tone.AudioNode);

/**
 *  The defaults
 *  @type  {Object}
 *  @const
 *  @static
 */
Tone.PanVol.defaults = {
	"pan" : 0,
	"volume" : 0,
	"mute" : false
};

/**
 * Mute/unmute the volume
 * @memberOf Tone.PanVol#
 * @name mute
 * @type {Boolean}
 */
Object.defineProperty(Tone.PanVol.prototype, "mute", {
	get : function(){
		return this._volume.mute;
	},
	set : function(mute){
		this._volume.mute = mute;
	}
});

/**
 *  clean up
 *  @returns {Tone.PanVol} this
 */
Tone.PanVol.prototype.dispose = function(){
	Tone.AudioNode.prototype.dispose.call(this);
	this._writable(["pan", "volume"]);
	this._panner.dispose();
	this._panner = null;
	this.pan = null;
	this._volume.dispose();
	this._volume = null;
	this.volume = null;
	return this;
};

export default Tone.PanVol;

