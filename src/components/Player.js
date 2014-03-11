///////////////////////////////////////////////////////////////////////////////
//
//  AUDIO PLAYER
//
///////////////////////////////////////////////////////////////////////////////

WebAudio.Player = function(url){
	//extend Unit
	WebAudio.Unit.call(this);

	//player vars
	this.url = url;
	this.source = null;
	this.buffer = null;
}

WebAudio.extend(WebAudio.Player, WebAudio.Unit);

//makes an xhr for the buffer at the url
//invokes the callback at the end
//@param {function(WebAudio.Player)=} callback
WebAudio.Player.prototype.load = function(callback){
	var request = new XMLHttpRequest();
	request.open('GET', this.url, true);
	request.responseType = 'arraybuffer';
	// decode asynchronously
	var self = this;
	request.onload = function() {
		WebAudio.decodeAudioData(request.response, function(b) {
			self.buffer = b;
			if (callback){
				callback(self);
			}
			//memory leak?
			self = null;
		});
	}
	request.send();
}

//play the buffer from start to finish at a time
WebAudio.Player.prototype.start = function(startTime, offset, duration){
	if (this.buffer){
		//default args
		startTime = this.defaultArgument(startTime, WebAudio.now);
		offset = this.defaultArgument(offset, 0);
		duration = this.defaultArgument(duration, this.buffer.duration - offset);
		//make the source
		this.source = WebAudio.createBufferSource();
		this.source.buffer = this.buffer;
		this.source.loop = false;
		this.source.connect(this.output);
		this.source.start(startTime, offset, duration);
	}
}

//play the buffer from start to finish at a time
WebAudio.Player.prototype.loop = function(startTime, loopStart, loopEnd, offset, duration){
	if (this.buffer){
		//default args
		startTime = this.defaultArgument(startTime, WebAudio.now);
		loopStart = this.defaultArgument(loopStart, 0);
		loopEnd = this.defaultArgument(loopEnd, this.buffer.duration);
		offset = this.defaultArgument(offset, loopStart);
		duration = this.defaultArgument(duration, this.buffer.duration - offset);
		//make/play the source
		this.source = WebAudio.createBufferSource();
		this.source.buffer = this.buffer;
		this.source.loop = true;
		this.source.loopStart = loopStart;
		this.source.loopEnd = loopEnd;
		this.source.connect(this.output);
		this.source.start(startTime, offset, duration);
	}
}

//stop playback
WebAudio.Player.prototype.stop = function(stopTime){
	if (this.buffer){
		stopTime = this.defaultArgument(stopTime, WebAudio.now);
		this.source.stop(stopTime);
	}
}

//@returns {number} the buffer duration
WebAudio.Player.prototype.getDuration = function(){
	if (this.buffer){
		this.buffer.duration;
	} else {
		return 0;
	}
}
