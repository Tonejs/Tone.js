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
	 *  mic.start();
	 */
	Tone.Microphone = function(){
		Tone.ExternalInput.call(this);
	};
	Tone.extend(Tone.Microphone, Tone.ExternalInput);

	/**
	 * start the stream
	 * @private
	 */
	Tone.Microphone.prototype._start = function(){
		navigator.getUserMedia(this._constraints, 
			this._onStream.bind(this), this._onStreamError.bind(this));
	};

	return Tone.Microphone;
});