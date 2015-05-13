define(["Tone/core/Tone", "Tone/component/Panner", "Tone/component/Volume"], function(Tone){

	"use strict";

	/**
	 *  @class A Panner and volume in one.
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {number} pan the initial pan
	 *  @param {number} volume the volume
	 *  @example
	 *  var panVol = new Tone.PanVol(0.25, -12);
	 */
	Tone.PanVol = function(pan, volume){
		
		/**
		 *  the panning node
		 *  @type {Tone.Panner}
		 *  @private
		 */
		this._panner = this.input = new Tone.Panner(pan);

		/**
		 *  the panning control
		 *  @type {Tone.Panner}
		 *  @private
		 */
		this.pan = this._panner.pan;

		/**
		 * the volume control
		 * @type {Tone.Volume}
		 * @private
		 */
		this._volume = this.output = new Tone.Volume(volume);

		/**
		 *  The volume control in decibels. 
		 *  @type {Tone.Signal}
		 */
		this.volume = this._volume.volume;

		//connections
		this._panner.connect(this._volume);

		this._readOnly(["pan", "volume"]);
	};

	Tone.extend(Tone.PanVol);

	/**
	 *  clean up
	 *  @returns {Tone.PanVol} `this`
	 */
	Tone.PanVol.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._writable(["pan", "volume"]);
		this._panner.dispose();
		this._panner = null;
		this._volume.dispose();
		this._volume = null;
		this.pan = null;
		this.volume = null;
		return this;
	};

	return Tone.PanVol;
});