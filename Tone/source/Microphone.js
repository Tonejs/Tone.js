define(["Tone/core/Tone", "Tone/source/ExternalInput"], function(Tone){

	"use strict";

	/**
	 *  @class  A simpler verision of Tone.ExternalInput that
	 *          takes no arguments, connects only to the 
	 *          default source (typically the microphone),
	 *          and does not require an onload function. 
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
		Tone.ExternalInput.call(this);
	};
	Tone.extend(Tone.Microphone, Tone.ExternalInput);

	return Tone.Microphone;
});