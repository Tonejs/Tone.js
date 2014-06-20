///////////////////////////////////////////////////////////////////////////////
//
//	WEB RTC MICROPHONE
//
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone", "Tone/source/Source"], function(Tone){

	/**
	 *  WebRTC Microphone
	 *
	 *  CHROME ONLY (for now) because of the 
	 *  use of the MediaStreamAudioSourceNode
	 *
	 *  @constructor
	 *  @extends {Tone.Source}
	 *  @param {number=} inputNum 
	 */
	Tone.Microphone = function(inputNum){
		Tone.call(this);

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
	 *  start the _stream. 
	 *  
	 *  accepts a time to stay consisten with other sources, even though 
	 *  it can't be stopped in a sample accurate way. 
	 *  uses setTimeout to approximate the behavior
	 * 
	 *  @param {Tone.Time} time
	 */
	Tone.Microphone.prototype.start = function(time){
		if (this.state === Tone.Source.State.STOPPED){
			this.state = Tone.Source.State.STARTED;
			if (time){
				var self = this;
				setTimeout(function(){
					navigator.getUserMedia(self.constraints, 
						self._onStream.bind(self), self._onStreamError.bind(self));
				}, this.toSeconds(time) * 1000);
			} else {
				navigator.getUserMedia(this.constraints, 
					this._onStream.bind(this), this._onStreamError.bind(this));
			}
			
		}
	};

	/**
	 *  stop the _stream. 
	 *  
	 *  accepts a time to stay consisten with other sources, even though 
	 *  it can't be stopped in a sample accurate way. 
	 *  uses setTimeout to approximate the behavior
	 * 
	 *  @param {Tone.Time} time
	 */
	Tone.Microphone.prototype.stop = function(time){
		if (this._stream && this.state === Tone.Source.State.STARTED){
			if (time){
				var self = this;
				setTimeout(function(){
					self.state = Tone.Source.State.STOPPED;
					self._stream.stop();
				}, this.toSeconds(time) * 1000);
			} else {
				this.state = Tone.Source.State.STOPPED;
				this._stream.stop();
			}
		}
	};

	/**
	 *  called when the _stream is successfully setup
	 *  @param   {LocalMediaStream} _stream 
	 *  @private
	 */
	Tone.Microphone.prototype._onStream = function(_stream) {
		this._stream = _stream;
		// Wrap a MediaStreamSourceNode around the live input _stream.
		this._mediaStream = this.context.createMediaStreamSource(_stream);
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
	Tone.Microphone.prototype.dispose = function(e) {
		this.input.disconnect();
		this.output.disconnect();
		this._stream.disconnect();
		this._mediaStream.disconnect();
		this.input = null;
		this.output = null;
		this._stream = null;
		this._mediaStream = null;
	};

	//polyfill
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || 
		navigator.mozGetUserMedia || navigator.msGetUserMedia;

	return Tone.Microphone;
});