///////////////////////////////////////////////////////////////////////////////
//
//  AUDIO PLAYER
//
///////////////////////////////////////////////////////////////////////////////

define(["Tone/core/Tone"], function(Tone){

	Tone.Player = function(url){
		//extend Unit
		Tone.call(this);

		//player vars
		this.url = url;
		this.source = null;
		this.buffer = null;

		this.onended = function(){};
	}

	Tone.extend(Tone.Player, Tone);

	//makes an xhr for the buffer at the url
	//invokes the callback at the end
	//@param {function(Tone.Player)} callback
	Tone.Player.prototype.load = function(callback){
		if (!this.buffer){
			var request = new XMLHttpRequest();
			request.open('GET', this.url, true);
			request.responseType = 'arraybuffer';
			// decode asynchronously
			var self = this;
			request.onload = function() {
				self.context.decodeAudioData(request.response, function(buff) {
					self.buffer = buff;
					if (callback){
						callback(self);
					}
				});
			}
			//send the request
			request.send();
		} else {
			if (callback){
				callback(this);
			}
		}
	}

	//play the buffer from start to finish at a time
	Tone.Player.prototype.start = function(startTime, offset, duration, volume){
		if (this.buffer){
			//default args
			startTime = this.defaultArg(startTime, this.now());
			offset = this.defaultArg(offset, 0);
			duration = this.defaultArg(duration, this.buffer.duration - offset);
			volume = this.defaultArg(volume, 1);
			//make the source
			this.source = this.context.createBufferSource();
			this.source.buffer = this.buffer;
			this.source.loop = false;
			this.source.start(startTime, offset, duration);
			this.source.onended = this._onended.bind(this);
			var gain = this.context.createGain();
			gain.gain.value = volume;
			this.chain(this.source, gain, this.output);
		}
	}

	//play the buffer from start to finish at a time
	Tone.Player.prototype.loop = function(startTime, loopStart, loopEnd, offset, duration, volume){
		if (this.buffer){
			//default args
			startTime = this.defaultArg(startTime, this.now());
			loopStart = this.defaultArg(loopStart, 0);
			loopEnd = this.defaultArg(loopEnd, this.buffer.duration);
			offset = this.defaultArg(offset, loopStart);
			duration = this.defaultArg(duration, this.buffer.duration - offset);
			//make/play the source
			this.start(startTime, offset, duration, volume);
			this.source.loop = true;
			this.source.loopStart = loopStart;
			this.source.loopEnd = loopEnd;
		}
	}

	//stop playback
	Tone.Player.prototype.stop = function(stopTime){
		if (this.buffer && this.source){
			stopTime = this.defaultArg(stopTime, this.now());
			this.source.stop(stopTime);
		}
	}

	//@returns {number} the buffer duration
	Tone.Player.prototype.getDuration = function(){
		if (this.buffer){
			this.buffer.duration;
		} else {
			return 0;
		}
	}

	//@param {function(Event)} callback
	Tone.Player.prototype._onended = function(e){
		this.onended(e);
	}

	return Tone.Player;
});
