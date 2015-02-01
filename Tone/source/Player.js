define(["Tone/core/Tone", "Tone/core/Buffer", "Tone/source/Source"], function(Tone){

	"use strict";
	
	/**
	 *  @class  Audio file player with start, loop, stop.
	 *  
	 *  @constructor
	 *  @extends {Tone.Source} 
	 *  @param {string|AudioBuffer} url either the AudioBuffer or the url from
	 *                                  which to load the AudioBuffer
	 */
	Tone.Player = function(){
		
		Tone.Source.call(this);
		var options = this.optionsObject(arguments, ["url", "onload"], Tone.Player.defaults);

		/**
		 *  @private
		 *  @type {AudioBufferSourceNode}
		 */
		this._source = null;
		
		/**
		 *  the buffer
		 *  @private
		 *  @type {Tone.Buffer}
		 */
		this._buffer = new Tone.Buffer(options.url, options.onload.bind(null, this));

		/**
		 *  if the buffer should loop once it's over
		 *  @type {boolean}
		 */
		this.loop = options.loop;

		/**
		 *  if 'loop' is true, the loop will start at this position
		 *  
		 *  @type {Tone.Time}
		 */
		this.loopStart = options.loopStart;

		/**
		 *  if 'loop' is true, the loop will end at this position
		 *  
		 *  @type {Tone.Time}
		 */
		this.loopEnd = options.loopEnd;

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
		this.retrigger = options.retrigger;

		/**
		 *  set a callback function to invoke when the sample is over
		 *  
		 *  @type {function}
		 */
		this.onended = options.onended;
	};

	Tone.extend(Tone.Player, Tone.Source);
	
	/**
	 *  the default parameters
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.Player.defaults = {
		"onended" : function(){},
		"onload" : function(){},
		"loop" : false,
		"loopStart" : 0,
		"loopEnd" : -1,
		"retrigger" : false
	};

	/**
	 *  Load the audio file as an audio buffer.
	 *  Decodes the audio asynchronously and invokes
	 *  the callback once the audio buffer loads.
	 * @param {string} url the url of the buffer to load.
	 *        filetype support depends on the
	 *        browser.
	 * @param  {function(Tone.Player)=} callback
	 *  @returns {Tone.Player} `this`
	 */
	Tone.Player.prototype.load = function(url, callback){
		this._buffer.load(url, callback.bind(this, this));
		return this;
	};

	/**
	 *  set the buffer
	 *
	 *  @param {AudioBuffer} buffer the buffer which the player will play.
	 *                              note: if you switch the buffer after
	 *                              the player is already started, it will not
	 *                              take effect until the next time the player
	 *                              is started.
	 *  @returns {Tone.Player} `this`
	 */
	Tone.Player.prototype.setBuffer = function(buffer){
		this._buffer.set(buffer);
		return this;
	};

	/**
	 *  play the buffer between the desired positions
	 *  	
	 *  @param  {Tone.Time} [startTime=now] when the player should start.
	 *  @param  {Tone.Time} [offset=0] the offset from the beginning of the sample
	 *                                 to start at. 
	 *  @param  {Tone.Time=} duration how long the sample should play. If no duration
	 *                                is given, it will default to the full length 
	 *                                of the sample (minus any offset)
	 *  @returns {Tone.Player} `this`
	 */
	Tone.Player.prototype.start = function(startTime, offset, duration){
		if (this.state === Tone.Source.State.STOPPED || this.retrigger){
			if (this._buffer){
				this.state = Tone.Source.State.STARTED;
				//if it's a loop the default offset is the loopstart point
				if (this.loop){
					offset = this.defaultArg(offset, this.loopStart);
				} else {
					//otherwise the default offset is 0
					offset = this.defaultArg(offset, 0);
				}
				duration = this.defaultArg(duration, this._buffer.duration - offset);
				//make the source
				this._source = this.context.createBufferSource();
				this._source.buffer = this._buffer.get();
				//set the looping properties
				if (this.loop){
					this._source.loop = this.loop;
					this._source.loopStart = this.toSeconds(this.loopStart);
					if (this.loopEnd !== -1){
						this._source.loopEnd = this.toSeconds(this.loopEnd);
					}
				}
				//and other properties
				this._source.playbackRate.value = this._playbackRate;
				this._source.onended = this._onended.bind(this);
				this._source.connect(this.output);
				//start it
				this._source.start(this.toSeconds(startTime), this.toSeconds(offset), this.toSeconds(duration));
			}
		}
		return this;
	};

	/**
	 *  Stop playback.
	 *  @param  {Tone.Time} [time=now]
	 *  @returns {Tone.Player} `this`
	 */
	Tone.Player.prototype.stop = function(time){
		if (this.state === Tone.Source.State.STARTED) {
			if (this._source){
				this.state = Tone.Source.State.STOPPED;
				this._source.stop(this.toSeconds(time));
			}
		}
		return this;
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
	 *  set the rate at which the file plays
	 *  
	 *  @param {number} rate
	 *  @param {Tone.Time=} rampTime the amount of time it takes to 
	 *                               reach the rate
	 *  @returns {Tone.Player} `this`
	 */
	Tone.Player.prototype.setPlaybackRate = function(rate, rampTime){
		this._playbackRate = rate;
		if (this._source) {
			this._source.playbackRate.exponentialRampToValueAtTime(rate, this.toSeconds(rampTime));
		}
		return this;
	};

	/**
	 *  set the loop start position
	 *  @param {Tone.Time} loopStart the start time
	 *  @returns {Tone.Player} `this`
	 */
	Tone.Player.prototype.setLoopStart = function(loopStart){
		this.loopStart = loopStart;
		if (this._source){
			this._source.loopStart = this.toSeconds(loopStart);
		}
		return this;
	};

	/**
	 *  set the loop end position
	 *  @param {Tone.Time} loopEnd the loop end time
	 *  @returns {Tone.Player} `this`
	 */
	Tone.Player.prototype.setLoopEnd = function(loopEnd){
		this.loopEnd = loopEnd;
		if (this._source){
			this._source.loopEnd = this.toSeconds(loopEnd);
		}
		return this;
	};

	/**
	 *  set the loop start and end
	 *  @param {Tone.Time} loopStart the loop end time
	 *  @param {Tone.Time} loopEnd the loop end time
	 *  @returns {Tone.Player} `this`
	 */
	Tone.Player.prototype.setLoopPoints = function(loopStart, loopEnd){
		this.setLoopStart(loopStart);
		this.setLoopEnd(loopEnd);
		return this;
	};

	/**
	 *  set the parameters at once
	 *  @param {Object} params
	 *  @returns {Tone.Player} `this`
	 */
	Tone.Player.prototype.set = function(params){
		if (!this.isUndef(params.playbackRate)) this.setPlaybackRate(params.playbackRate);
		if (!this.isUndef(params.onended)) this.onended = params.onended;
		if (!this.isUndef(params.loop)) this.loop = params.loop;
		if (!this.isUndef(params.loopStart)) this.setLoopStart(params.loopStart);
		if (!this.isUndef(params.loopEnd)) this.setLoopEnd(params.loopEnd);
		if (!this.isUndef(params.buffer)) this.setBuffer(params.buffer);
		Tone.Source.prototype.set.call(this, params);
		return this;
	};

	/**
	 *  dispose and disconnect
	 *  @returns {Tone.Player} `this`
	 */
	Tone.Player.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		if (this._source !== null){
			this._source.disconnect();
			this._source = null;
		}
		this._buffer.dispose();
		this._buffer = null;
		return this;
	};

	return Tone.Player;
});
