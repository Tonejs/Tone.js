define(["Tone/core/Tone", "Tone/source/Source"], function(Tone){

	"use strict";
	
	/**
	 *  @class  Audio file player with start, loop, stop.
	 *  
	 *  @constructor
	 *  @extends {Tone.Source} 
	 *  @param {string=} url if a url is passed in, it will be loaded
	 *                       and invoke the callback if it also passed
	 *                       in.
	 *  @param {function(Tone.Player)=} onload callback to be invoked
	 *                                     once the url is loaded
	 */
	Tone.Player = function(url, onload){
		
		Tone.Source.call(this);

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
		 *  @readOnly
		 */
		this.duration = 0;

		/**
		 *  if the buffer should loop once it's over
		 *  @type {boolean}
		 */
		this.loop = false;

		/**
		 *  if 'loop' is true, the loop will start at this position
		 *  
		 *  @type {number}
		 */
		this.loopStart = 0;

		/**
		 *  if 'loop' is true, the loop will end at this position
		 *  
		 *  @type {number}
		 */
		this.loopEnd = 0;

		/**
		 *  the playback rate
		 *  @private
		 *  @type {number}
		 */
		this._playbackRate = 1;

		/**
		 *  enabling retrigger will allow a player to be restarted
		 *  before the the previous 'start' is done playing
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

		//if there is a url, load it. 
		if (url){
			this.load(url, onload);
		}
	};

	Tone.extend(Tone.Player, Tone.Source);

	/**
	 *  makes an xhr reqest for the selected url
	 *  Load the audio file as an audio buffer.
	 *  Decodes the audio asynchronously and invokes
	 *  the callback once the audio buffer loads.
	 *
	 *  @param {string} url the url of the buffer to load.
	 *                      filetype support depends on the
	 *                      browser.
	 *  @param {function(Tone.Player)=} callback
	 */
	Tone.Player.prototype.load = function(url, callback){
		if (!this._buffer){
			var request = new XMLHttpRequest();
			request.open("GET", url, true);
			request.responseType = "arraybuffer";
			// decode asynchronously
			var self = this;
			request.onload = function() {
				self.context.decodeAudioData(request.response, function(buff) {
					self.setBuffer(buff);
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
	 *  set the buffer
	 *
	 *  @param {AudioBuffer} buffer the buffer which the player will play.
	 *                              note: if you switch the buffer after
	 *                              the player is already started, it will not
	 *                              take effect until the next time the player
	 *                              is started.
	 */
	Tone.Player.prototype.setBuffer = function(buffer){
		this._buffer = buffer;
		this.duration = buffer.duration;
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
				offset = this.defaultArg(offset, 0);
				if (this.loop){
					offset = this.loopStart;
				}
				duration = this.defaultArg(duration, this._buffer.duration - offset);
				//make the source
				this._source = this.context.createBufferSource();
				this._source.buffer = this._buffer;
				//set the looping properties
				this._source.loop = this.loop;
				this._source.loopStart = this.loopStart;
				this._source.loopEnd = this.loopEnd;
				//and other properties
				this._source.playbackRate.value = this._playbackRate;
				this._source.onended = this._onended.bind(this);
				this.chain(this._source, this.output);
				//start it
				this._source.start(this.toSeconds(startTime), this.toSeconds(offset), this.toSeconds(duration));
			}
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
		Tone.Source.prototype.dispose.call(this);
		if (this._source !== null){
			this._source.disconnect();
			this._source = null;
		}
		this._buffer = null;
	};

	return Tone.Player;
});
