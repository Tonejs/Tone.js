define(["Tone/core/Tone", "Tone/core/Buffer", "Tone/source/Source"], function(Tone){

	"use strict";
	
	/**
	 *  @class  Tone.Player is an audio file player with start, loop, and stop functions.
	 *  
	 *  @constructor
	 *  @extends {Tone.Source} 
	 *  @param {string|AudioBuffer} url Either the AudioBuffer or the url from
	 *                                  which to load the AudioBuffer
	 *  @param {function=} onload The function to invoke when the buffer is loaded. 
	 *                            Recommended to use Tone.Buffer.onload instead.
	 *  @example
	 * var player = new Tone.Player("./path/to/sample.mp3").toMaster();
	 * Tone.Buffer.onload = function(){
	 * 	player.start();
	 * }
	 */
	Tone.Player = function(url){

		var options;
		if (url instanceof Tone.Buffer){
			url = url.get();
			options = Tone.Player.defaults;
		} else {
			options = this.optionsObject(arguments, ["url", "onload"], Tone.Player.defaults);
		}		
		Tone.Source.call(this, options);

		/**
		 *  @private
		 *  @type {AudioBufferSourceNode}
		 */
		this._source = null;

		/**
		 *  If the file should play as soon
		 *  as the buffer is loaded. 
		 *  @type {boolean}
		 *  @example
		 * //will play as soon as it's loaded
		 * var player = new Tone.Player({
		 * 	"url" : "./path/to/sample.mp3",
		 * 	"autostart" : true,
		 * }).toMaster();
		 */
		this.autostart = options.autostart;
		
		/**
		 *  the buffer
		 *  @private
		 *  @type {Tone.Buffer}
		 */
		this._buffer = new Tone.Buffer({
			"url" : options.url, 
			"onload" : this._onload.bind(this, options.onload),
			"reverse" : options.reverse
		});
		if (url instanceof AudioBuffer){
			this._buffer.set(url);
		}

		/**
		 *  if the buffer should loop once it's over
		 *  @type {boolean}
		 *  @private
		 */
		this._loop = options.loop;

		/**
		 *  if 'loop' is true, the loop will start at this position
		 *  @type {Time}
		 *  @private
		 */
		this._loopStart = options.loopStart;

		/**
		 *  if 'loop' is true, the loop will end at this position
		 *  @type {Time}
		 *  @private
		 */
		this._loopEnd = options.loopEnd;

		/**
		 *  the playback rate
		 *  @private
		 *  @type {number}
		 */
		this._playbackRate = options.playbackRate;

		/**
		 *  Enabling retrigger will allow a player to be restarted
		 *  before the the previous 'start' is done playing. Otherwise, 
		 *  successive calls to Tone.Player.start will only start
		 *  the sample if it had played all the way through. 
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
		"onload" : Tone.noOp,
		"playbackRate" : 1,
		"loop" : false,
		"autostart" : false,
		"loopStart" : 0,
		"loopEnd" : 0,
		"retrigger" : false,
		"reverse" : false,
	};

	/**
	 *  Load the audio file as an audio buffer.
	 *  Decodes the audio asynchronously and invokes
	 *  the callback once the audio buffer loads. 
	 *  Note: this does not need to be called if a url
	 *  was passed in to the constructor. Only use this
	 *  if you want to manually load a new url. 
	 * @param {string} url The url of the buffer to load.
	 *                     Filetype support depends on the
	 *                     browser.
	 *  @param  {function=} callback The function to invoke once
	 *                               the sample is loaded.
	 *  @returns {Tone.Player} this
	 */
	Tone.Player.prototype.load = function(url, callback){
		this._buffer.load(url, this._onload.bind(this, callback));
		return this;
	};

	/**
	 * Internal callback when the buffer is loaded.
	 * @private
	 */
	Tone.Player.prototype._onload = function(callback){
		callback(this);
		if (this.autostart){
			this.start();
		}
	};

	/**
	 *  play the buffer between the desired positions
	 *  
	 *  @private
	 *  @param  {Time} [startTime=now] when the player should start.
	 *  @param  {Time} [offset=0] the offset from the beginning of the sample
	 *                                 to start at. 
	 *  @param  {Time=} duration how long the sample should play. If no duration
	 *                                is given, it will default to the full length 
	 *                                of the sample (minus any offset)
	 *  @returns {Tone.Player} this
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
			offset = this.toSeconds(offset);
			duration = this.defaultArg(duration, this._buffer.duration - offset);
			//the values in seconds
			startTime = this.toSeconds(startTime);
			duration = this.toSeconds(duration);
			//make the source
			this._source = this.context.createBufferSource();
			this._source.buffer = this._buffer.get();
			//set the looping properties
			if (this._loop){
				this._source.loop = this._loop;
				this._source.loopStart = this.toSeconds(this._loopStart);
				this._source.loopEnd = this.toSeconds(this._loopEnd);
			} else {
				//if it's not looping, set the state change at the end of the sample
				this._state.setStateAtTime(Tone.State.Stopped, startTime + duration);
			}
			//and other properties
			this._source.playbackRate.value = this._playbackRate;
			this._source.connect(this.output);
			//start it
			if (this._loop){
				this._source.start(startTime, offset);
			} else {
				this._source.start(startTime, offset, duration);
			}
		} else {
			throw Error("tried to start Player before the buffer was loaded");
		}
		return this;
	};

	/**
	 *  Stop playback.
	 *  @private
	 *  @param  {Time} [time=now]
	 *  @returns {Tone.Player} this
	 */
	Tone.Player.prototype._stop = function(time){
		if (this._source){
			this._source.stop(this.toSeconds(time));
			this._source = null;
		}
		return this;
	};

	/**
	 *  Set the loop start and end. Will only loop if loop is 
	 *  set to true. 
	 *  @param {Time} loopStart The loop end time
	 *  @param {Time} loopEnd The loop end time
	 *  @returns {Tone.Player} this
	 *  @example
	 * //loop 0.1 seconds of the file. 
	 * player.setLoopPoints(0.2, 0.3);
	 * player.loop = true;
	 */
	Tone.Player.prototype.setLoopPoints = function(loopStart, loopEnd){
		this.loopStart = loopStart;
		this.loopEnd = loopEnd;
		return this;
	};

	/**
	 * If loop is true, the loop will start at this position. 
	 * @memberOf Tone.Player#
	 * @type {Time}
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
	 * If loop is true, the loop will end at this position.
	 * @memberOf Tone.Player#
	 * @type {Time}
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
	 * @type {Tone.Buffer}
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
	 * If the buffer should loop once it's over. 
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
	 * The playback speed. 1 is normal speed. This is not a signal because
	 * Safari and iOS currently don't support playbackRate as a signal.
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
	 * The direction the buffer should play in
	 * @memberOf Tone.Player#
	 * @type {boolean}
	 * @name reverse
	 */
	Object.defineProperty(Tone.Player.prototype, "reverse", {
		get : function(){
			return this._buffer.reverse;
		}, 
		set : function(rev){
			this._buffer.reverse = rev;
		}
	});

	/**
	 *  Dispose and disconnect.
	 *  @return {Tone.Player} this
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
