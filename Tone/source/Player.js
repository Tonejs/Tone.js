define(["Tone/core/Tone", "Tone/source/Source"], function(Tone){
	
	/**
	 *  Audio Player
	 *  
	 *  Audio file player with start, loop, stop.
	 *  
	 *  @constructor
	 *  @extends {Tone.Source} 
	 *  @param {string} url
	 */
	Tone.Player = function(url){
		Tone.Source.call(this);

		/**
		 *  the url to load
		 *  @type {string}
		 */
		this.url = url;
		/**
		 *  @private
		 *  @type {AudioBufferSourceNode}
		 */
		this._source = null;
		
		/**
		 *  the buffer
		 *  @private
		 *  @type {AudioBuffer}
		 */
		this._buffer = null;


		/**
		 *  the duration of the buffer once it's been loaded
		 *  @type {number}
		 */
		this.duration = 0;

		/**
		 *  the playback rate
		 *  @private
		 *  @type {number}
		 */
		this._playbackRate = 1;

		/**
		 *  enabling retrigger will allow a player to be restarted
		 *  before the it's is done playing
		 *  
		 *  @type {boolean}
		 */
		this.retrigger = false;

		/**
		 *  set a callback function to invoke when the sample is over
		 *  
		 *  @type {function}
		 */
		this.onended = function(){};
	};

	Tone.extend(Tone.Player, Tone.Source);

	/**
	 *  makes an xhr reqest for the selected url
	 *  Load the audio file as an audio buffer.
	 *  Decodes the audio asynchronously and invokes
	 *  the callback once the audio buffer loads.
	 *  
	 *  @param {function(Tone.Player)} callback
	 */
	Tone.Player.prototype.load = function(callback){
		if (!this._buffer){
			var request = new XMLHttpRequest();
			request.open("GET", this.url, true);
			request.responseType = "arraybuffer";
			// decode asynchronously
			var self = this;
			request.onload = function() {
				self.context.decodeAudioData(request.response, function(buff) {
					self._buffer = buff;
					self.duration = buff.duration;
					if (callback){
						callback(self);
					}
				});
			};
			//send the request
			request.send();
		} else {
			if (callback){
				callback(this);
			}
		}
	};

	/**
	 *  play the buffer between the desired positions
	 *  	
	 *  @param  {Tone.Time=} startTime 
	 *  @param  {Tone.Time=} offset    
	 *  @param  {Tone.Time=} duration
	 */
	Tone.Player.prototype.start = function(startTime, offset, duration){
		if (this.state === Tone.Source.State.STOPPED || this.retrigger){
			if (this._buffer){
				this.state = Tone.Source.State.STARTED;
				//default args
				startTime = this.defaultArg(startTime, this.now());
				offset = this.defaultArg(offset, 0);
				duration = this.defaultArg(duration, this._buffer.duration - offset);
				//make the source
				this._source = this.context.createBufferSource();
				this._source.buffer = this._buffer;
				this._source.loop = false;
				this._source.playbackRate.value = this._playbackRate;
				this._source.start(this.toSeconds(startTime), this.toSeconds(offset), this.toSeconds(duration));
				this._source.onended = this._onended.bind(this);
				this.chain(this._source, this.output);
			}
		}
	};

	/**
	 *  Loop the buffer from start to finish at a time
	 *
	 *  @param  {Tone.Time=} startTime
	 *  @param  {Tone.Time=} loopStart
	 *  @param  {Tone.Time=} loopEnd
	 *  @param  {Tone.Time=} offset
	 *  @param  {Tone.Time=} duration
	 */
	Tone.Player.prototype.loop = function(startTime, loopStart, loopEnd, offset, duration){
		if (this._buffer){
			//default args
			loopStart = this.defaultArg(loopStart, 0);
			loopEnd = this.defaultArg(loopEnd, this._buffer.duration);
			offset = this.defaultArg(offset, loopStart);
			duration = this.defaultArg(duration, this._buffer.duration - offset);
			//make/play the source
			this.start(startTime, offset, duration);
			this._source.loop = true;
			this._source.loopStart = this.toSeconds(loopStart);
			this._source.loopEnd = this.toSeconds(loopEnd);
		}
	};

	/**
	 *  Stop playback.
	 * 
	 *  @param  {Tone.Time} time
	 */
	Tone.Player.prototype.stop = function(time){
		if (this.state === Tone.Source.State.STARTED) {
			if (this._buffer && this._source){
				if (!time){
					this.state = Tone.Source.State.STOPPED;
				}
				this._source.stop(this.toSeconds(time));
			}
		}
	};

	/**
	 *  set the rate at which the file plays
	 *  
	 *  @param {number} rate
	 *  @param {Tone.Time=} rampTime (optional) the amount of time it takes to 
	 *                               reach the rate
	 */
	Tone.Player.prototype.setPlaybackRate = function(rate, rampTime){
		this._playbackRate = rate;
		if (this._source) {
			if (rampTime){
				this._source.playbackRate.exponentialRampToValueAtTime(rate, this.toSeconds(rampTime));
			} else {
				this._source.playbackRate.value = rampTime;
			}
		} 
	};

	/**
	 *  internal call when the buffer is done playing
	 *  
	 *  @private
	 */
	Tone.Player.prototype._onended = function(){
		this.state = Tone.Source.State.STOPPED;
		this.onended();
	};

	/**
	 *  dispose and disconnect
	 */
	Tone.Player.prototype.dispose = function(){
		this.output.disconnect();
		if (this.state === Tone.Source.State.STARTED){
			this.stop();
			this._source.disconnect();
			this._source = null;
		}
		this._buffer = null;
	};

	return Tone.Player;
});
