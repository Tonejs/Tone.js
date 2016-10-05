define(["Tone/core/Tone", "Tone/component/Panner", "Tone/component/Volume"], function(Tone){

	"use strict";

	/**
	 *  @class Tone.PanVol is a Tone.Panner and Tone.Volume in one.
	 *
	 *  @extends {Tone}
	 *  @constructor
	 *  @param {AudioRange} pan the initial pan
	 *  @param {number} volume The output volume. 
	 *  @example
	 * //pan the incoming signal left and drop the volume
	 * var panVol = new Tone.PanVol(0.25, -12);
	 */
	Tone.PanVol = function(){

		var options = this.optionsObject(arguments, ["pan", "volume"], Tone.PanVol.defaults);
		
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

		this._readOnly(["pan", "volume"]);
	};

	Tone.extend(Tone.PanVol);

	/**
	 *  The defaults
	 *  @type  {Object}
	 *  @const
	 *  @static
	 */
	Tone.PanVol.defaults = {
		"pan" : 0.5,
		"volume" : 0
	};

	/**
	 *  clean up
	 *  @returns {Tone.PanVol} this
	 */
	Tone.PanVol.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._writable(["pan", "volume"]);
		this._panner.dispose();
		this._panner = null;
		this.pan = null;
		this._volume.dispose();
		this._volume = null;
		this.volume = null;
		return this;
	};

	return Tone.PanVol;
});