define(["Tone/core/Tone", "Tone/component/Panner", "Tone/core/Master"], function(Tone){

	"use strict";

	/**
	 *  @class A Panner and volume in one
	 *
	 *  @extends {Tone}
	 *  @constructor
	 */
	Tone.PanVol = function(pan, volume){
		/**
		 *  the panning node
		 *  @type {Tone.Panner}
		 *  @private
		 */
		this._panner = this.input = new Tone.Panner(pan);

		/**
		 * the output node
		 * @type {GainNode}
		 */
		this.output = this.context.createGain();

		/**
		 *  the volume node
		 *  @type {GainNode}
		 *  @private
		 */
		this.volume = new Tone.Signal(this.defaultArg(volume, 0), Tone.Signal.Units.Decibels);

		/**
		 *  the panning control
		 *  @type {Tone.Panner}
		 *  @private
		 */
		this.pan = this._panner.pan;

		//connections
		this._panner.connect(this.output);
	};

	Tone.extend(Tone.PanVol);

	/**
	 *  clean up
	 *  @returns {Tone.PanVol} `this`
	 */
	Tone.PanVol.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._panner.dispose();
		this._panner = null;
		this.volume.dispose();
		this.volume = null;
		this.pan = null;
		return this;
	};

	return Tone.PanVol;
});