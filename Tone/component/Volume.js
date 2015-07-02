define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/core/Master"], function(Tone){

	"use strict";

	/**
	 *  @class Tone.Volume is a simple volume node, useful for creating a volume fader. 
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {Decibels} [volume=0] the initial volume
	 *  @example
	 * var vol = new Tone.Volume(-12);
	 * instrument.chain(vol, Tone.Master);
	 */
	Tone.Volume = function(volume){

		/**
		 * the output node
		 * @type {GainNode}
		 * @private
		 */
		this.output = this.input = this.context.createGain();

		/**
		 *  The volume control in decibels. 
		 *  @type {Decibels}
		 *  @signal
		 */
		this.volume = new Tone.Signal(this.output.gain, Tone.Type.Decibels);
		this.volume.value = this.defaultArg(volume, 0);

		this._readOnly("volume");
	};

	Tone.extend(Tone.Volume);

	/**
	 *  clean up
	 *  @returns {Tone.Volume} this
	 */
	Tone.Volume.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._writable("volume");
		this.volume.dispose();
		this.volume = null;
		return this;
	};

	return Tone.Volume;
});