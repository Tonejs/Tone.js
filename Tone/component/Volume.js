define(["Tone/core/Tone", "Tone/signal/Signal", "Tone/core/Gain"], function(Tone){

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
	Tone.Volume = function(){

		var options = this.optionsObject(arguments, ["value"], Tone.Volume.defaults);

		Tone.Gain.call(this, options.value, Tone.Type.Decibels);
	};

	Tone.extend(Tone.Volume, Tone.Gain);

	/**
	 *  Defaults
	 *  @type  {Object}
	 *  @const
	 *  @static
	 */
	Tone.Volume.defaults = {
		"value" : 0
	};

	return Tone.Volume;
});