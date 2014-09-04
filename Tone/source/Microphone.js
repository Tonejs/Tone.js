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
		this.constraints = {"audio" : true};

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
	 */
	Tone.Microphone.prototype.start = function(){
		if (this.state === Tone.Source.State.STOPPED){
			this.state = Tone.Source.State.STARTED;
				navigator.getUserMedia(this.constraints, 
					this._onStream.bind(this), this._onStreamError.bind(this));
		}
	};

	/**
	 *  stop the stream. 
	 */
	Tone.Microphone.prototype.stop = function(){
		if (this._stream && this.state === Tone.Source.State.STARTED){
			this.state = Tone.Source.State.STOPPED;
			this._stream.stop();
		}
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
	 */
	Tone.Microphone.prototype.dispose = function() {
		Tone.Source.prototype.dispose.call(this);
		this._stream.disconnect();
		this._mediaStream.disconnect();
		this._stream = null;
		this._mediaStream = null;
	};

	//polyfill
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || 
		navigator.mozGetUserMedia || navigator.msGetUserMedia;

	return Tone.Microphone;
});