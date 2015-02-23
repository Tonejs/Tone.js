define(["Tone/core/Tone", "Tone/source/Source"], function(Tone){

	"use strict";

	/**
	 *  @class  WebRTC Microphone. 
	 *          CHROME ONLY (for now) because of the 
	 *          use of the MediaStreamAudioSourceNode
	 *
	 *  @constructor
	 *  @extends {Tone.Source}
	 *  @param {number=} inputNum 
	 */
	Tone.Microphone = function(inputNum){
		Tone.Source.call(this);

		/**
		 *  @type {MediaStreamAudioSourceNode}
		 *  @private
		 */
		this._mediaStream = null;
		
		/**
		 *  @type {LocalMediaStream}
		 *  @private
		 */
		this._stream = null;
		
		/**
		 *  @type {Object}
		 *  @private
		 */
		this._constraints = {"audio" : true};

		//get the option
		var self = this;
		MediaStreamTrack.getSources(function (media_sources) {
			if (inputNum < media_sources.length){
				self.constraints.audio = {
					optional : [{ sourceId: media_sources[inputNum].id}]
				};
			}
		});		
	};

	Tone.extend(Tone.Microphone, Tone.Source);

	/**
	 *  start the stream. 
	 *  @private
	 */
	Tone.Microphone.prototype._start = function(){
		navigator.getUserMedia(this._constraints, 
			this._onStream.bind(this), this._onStreamError.bind(this));
	};

	/**
	 *  stop the stream. 
	 *  @private
	 */
	Tone.Microphone.prototype._stop = function(){
		this._stream.stop();
		return this;
	};

	/**
	 *  called when the stream is successfully setup
	 *  @param   {LocalMediaStream} stream 
	 *  @private
	 */
	Tone.Microphone.prototype._onStream = function(stream) {
		this._stream = stream;
		// Wrap a MediaStreamSourceNode around the live input stream.
		this._mediaStream = this.context.createMediaStreamSource(stream);
		this._mediaStream.connect(this.output);
	};

	/**
	 *  called on error
	 *  @param   {Error} e 
	 *  @private
	 */
	Tone.Microphone.prototype._onStreamError = function(e) {
		console.error(e);
	};

	/**
	 *  clean up
	 *  @return {Tone.Microphone} `this`
	 */
	Tone.Microphone.prototype.dispose = function() {
		Tone.Source.prototype.dispose.call(this);
		if (this._mediaStream){
			this._mediaStream.disconnect();
			this._mediaStream = null;
		}
		this._stream = null;
		this._constraints = null;
		return this;
	};

	//polyfill
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || 
		navigator.mozGetUserMedia || navigator.msGetUserMedia;

	return Tone.Microphone;
});