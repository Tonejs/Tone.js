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
		
		var options = this.optionsObject(arguments, ["url", "onload"], Tone.Player.defaults);
		Tone.Source.call(this, options);

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
		 *  @private
		 */
		this._loop = options.loop;

		/**
		 *  if 'loop' is true, the loop will start at this position
		 *  @type {Tone.Time}
		 */
		this._loopStart = options.loopStart;

		/**
		 *  if 'loop' is true, the loop will end at this position
		 *  @type {Tone.Time}
		 */
		this._loopEnd = options.loopEnd;

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
	};

	Tone.extend(Tone.Player, Tone.Source);
	
	/**
	 *  the default parameters
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.Player.defaults = {
		"onload" : function(){},
		"loop" : false,
		"loopStart" : 0,
		"loopEnd" : 0,
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
	 *  play the buffer between the desired positions
	 *  
	 *  @private
	 *  @param  {Tone.Time} [startTime=now] when the player should start.
	 *  @param  {Tone.Time} [offset=0] the offset from the beginning of the sample
	 *                                 to start at. 
	 *  @param  {Tone.Time=} duration how long the sample should play. If no duration
	 *                                is given, it will default to the full length 
	 *                                of the sample (minus any offset)
	 *  @returns {Tone.Player} `this`
	 */
	Tone.Player.prototype._start = function(startTime, offset, duration){
		if (this._buffer.loaded){
			//if it's a loop the default offset is the loopstart point
			if (this._loop){
				offset = this.defaultArg(offset, this._loopStart);
			} else {
				//otherwise the default offset is 0
				offset = this.defaultArg(offset, 0);
			}
			duration = this.defaultArg(duration, this._buffer.duration - offset);
			//make the source
			this._source = this.context.createBufferSource();
			this._source.buffer = this._buffer.get();
			//set the looping properties
			if (this._loop){
				this._source.loop = this._loop;
				this._source.loopStart = this.toSeconds(this._loopStart);
				this._source.loopEnd = this.toSeconds(this._loopEnd);
			}
			//and other properties
			this._source.playbackRate.value = this._playbackRate;
			this._source.onended = this._onended.bind(this);
			this._source.connect(this.output);
			//start it
			this._source.start(this.toSeconds(startTime), this.toSeconds(offset), this.toSeconds(duration));
		} else {
			throw Error("tried to start Player before the buffer was loaded");
		}
		return this;
	};

	/**
	 *  Stop playback.
	 *  @private
	 *  @param  {Tone.Time} [time=now]
	 *  @returns {Tone.Player} `this`
	 */
	Tone.Player.prototype._stop = function(time){
		if (this._source){
			this._source.stop(this.toSeconds(time));
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
		this._loopStart = loopStart;
		this._loopEnd = loopEnd;
		return this;
	};

	/**
	 * if 'loop' is true, the loop will start at this position
	 * @memberOf Tone.Player#
	 * @type {Tone.Time}
	 * @name loopStart
	 */
	Object.defineProperty(Tone.Player.prototype, "loopStart", {
		get : function(){
			return this._loopStart;
		}, 
		set : function(loopStart){
			this._loopStart = loopStart;
			if (this._source){
				this._source.loopStart = this.toSeconds(loopStart);
			}
		}
	});

	/**
	 * if 'loop' is true, the loop will end at this position
	 * @memberOf Tone.Player#
	 * @type {Tone.Time}
	 * @name loopEnd
	 */
	Object.defineProperty(Tone.Player.prototype, "loopEnd", {
		get : function(){
			return this._loopEnd;
		}, 
		set : function(loopEnd){
			this._loopEnd = loopEnd;
			if (this._source){
				this._source.loopEnd = this.toSeconds(loopEnd);
			}
		}
	});

	/**
	 * The audio buffer belonging to the player. 
	 * @memberOf Tone.Player#
	 * @type {AudioBuffer}
	 * @name buffer
	 */
	Object.defineProperty(Tone.Player.prototype, "buffer", {
		get : function(){
			return this._buffer;
		}, 
		set : function(buffer){
			this._buffer.set(buffer);
		}
	});

	/**
	 * if the buffer should loop once it's over
	 * @memberOf Tone.Player#
	 * @type {boolean}
	 * @name loop
	 */
	Object.defineProperty(Tone.Player.prototype, "loop", {
		get : function(){
			return this._loop;
		}, 
		set : function(loop){
			this._loop = loop;
			if (this._source){
				this._source.loop = loop;
			}
		}
	});

	/**
	 * The playback speed. 1 is normal speed. 
	 * @memberOf Tone.Player#
	 * @type {number}
	 * @name playbackRate
	 */
	Object.defineProperty(Tone.Player.prototype, "playbackRate", {
		get : function(){
			return this._playbackRate;
		}, 
		set : function(rate){
			this._playbackRate = rate;
			if (this._source) {
				this._source.playbackRate.value = rate;
			}
		}
	});

	/**
	 *  dispose and disconnect
	 *  @return {Tone.Player} `this`
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
