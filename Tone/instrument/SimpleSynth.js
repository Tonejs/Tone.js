define(["Tone/core/Tone", "Tone/instrument/Synth"], 
function(Tone){

	"use strict";

	/**
	 *  @class  Now called Tone.Synth
	 *  @constructor
	 *  @extends {Tone.Monophonic}
	 */
	Tone.SimpleSynth = function(options){
		console.warn("Tone.SimpleSynth is now called Tone.Synth");
		Tone.Synth.call(this, options);
	};

	Tone.extend(Tone.SimpleSynth, Tone.Synth);

	return Tone.SimpleSynth;
});