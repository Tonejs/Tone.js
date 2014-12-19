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
		 */
		this.pan = this.input = new Tone.Panner(pan);

		/**
		 *  the volume node
		 *  @type {GainNode}
		 */
		this.vol = this.output = this.context.createGain();

		//connections
		this.pan.connect(this.vol);
		this.setVolume(this.defaultArg(volume, 0));
	};

	Tone.extend(Tone.PanVol);

	/**
	 *  gets the setVolume method from {@link Tone.Master}
	 *  @method
	 */
	Tone.PanVol.prototype.setVolume = Tone.Master.setVolume;

	/**
	 *  set the panning
	 *  @param {number} pan 0-1 L-R
	 */
	Tone.PanVol.prototype.setPan = function(pan){
		this.pan.setPan(pan);
	};

	/**
	 *  clean up
	 */
	Tone.PanVol.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this.pan.dispose();
		this.pan = null;
		this.vol.disconnect();
		this.vol = null;
	};

	return Tone.PanVol;
});