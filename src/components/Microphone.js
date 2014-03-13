///////////////////////////////////////////////////////////////////////////////
//
//	WEB RTC MICROPHONE
//
///////////////////////////////////////////////////////////////////////////////

//@param {number=} inputNum
AudioUnit.Microphone = function(inputNum){
	//extend the base class
	AudioUnit.call(this);

	//components
	this.mediaStream = null;
	this.stream = null;
	this.constraints = {"audio" : true};
	//get that option
	var self = this;
	MediaStreamTrack.getSources(function (media_sources) {
		if (inputNum < media_sources.length){
			self.constraints.audio = {
				optional : [{ sourceId: media_sources[inputNum].id}]
			}
		}
	});		
}

AudioUnit.extend(AudioUnit.Microphone, AudioUnit);

//stop the WebRTC connection
AudioUnit.Microphone.prototype.start = function(){
	// Only get the audio stream.
	navigator.getUserMedia(this.constraints, this._onStream.bind(this), this._onStreamError.bind(this));
}

//stop the WebRTC connection
AudioUnit.Microphone.prototype.stop = function(){
	if (this.stream){
		this.stream.stop();
	}
}

//when the stream is setup
AudioUnit.Microphone.prototype._onStream = function(stream) {
	this.stream = stream;
	// Wrap a MediaStreamSourceNode around the live input stream.
	this.mediaStream =  this.context.createMediaStreamSource(stream);
	this.mediaStream.connect(this.output);
};

//on error
AudioUnit.Microphone.prototype._onStreamError = function(e) {
	console.error(e);
};

//polyfill
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia 
	|| navigator.mozGetUserMedia || navigator.msGetUserMedia;