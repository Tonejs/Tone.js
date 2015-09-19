define(["Tone/core/Tone", "Tone/source/ExternalInput"], function(Tone){

	"use strict";

	/**
	 *  @class  Opens up the default source (typically the microphone).
	 *
	 *  @constructor
	 *  @extends {Tone.ExternalInput}
	 *  @example
	 *  //mic will feedback if played through master
	 *  var mic = new Tone.Microphone();
	 *  mic.open(function(){
	 *  	//start the mic at ten seconds
	 *  	mic.start(10);
	 *  });
	 *  //stop the mic
	 *  mic.stop(20);
	 */
	Tone.Microphone = function(){

		Tone.ExternalInput.call(this, 0);

	};

	Tone.extend(Tone.Microphone, Tone.ExternalInput);

	return Tone.Microphone;
});