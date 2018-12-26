define(["../core/Tone", "../core/Buffer", "../source/Source", "../source/TickSource",
	"../source/BufferSource"], function(Tone){

	"use strict";

	/**
	 *  @class  Tone.Player is an audio file player with start, loop, and stop functions.
	 *
	 *  @constructor
	 *  @extends {Tone.Source}
	 *  @param {string|AudioBuffer} url Either the AudioBuffer or the url from
	 *                                  which to load the AudioBuffer
	 *  @param {Function=} onload The function to invoke when the buffer is loaded.
	 *                            Recommended to use Tone.Buffer.on('load') instead.
	 *  @example
	 * var player = new Tone.Player("./path/to/sample.mp3").toMaster();
	 * //play as soon as the buffer is loaded
	 * player.autostart = true;
	 */
	Tone.Player = function(url){

		var options;
		if (url instanceof Tone.Buffer && url.loaded){
			url = url.get();
			options = Tone.Player.defaults;
		} else {
			options = Tone.defaults(arguments, ["url", "onload"], Tone.Player);
		}
		Tone.Source.call(this, options);

		/**
		 *  If the file should play as soon
		 *  as the buffer is loaded.
		 *  @type {Boolean}
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
		 *  @type {Boolean}
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
		 *  @type {Number}
		 */
		this._playbackRate = options.playbackRate;

		/**
		 *  All of the active buffer source nodes
		 *  @type {Array<Tone.BufferSource>}
		 *  @private
		 */
		this._activeSources = [];

		/**
		 *  The fadeIn time of the amplitude envelope.
		 *  @type {Time}
		 */
		this.fadeIn = options.fadeIn;

		/**
		 *  The fadeOut time of the amplitude envelope.
		 *  @type {Time}
		 */
		this.fadeOut = options.fadeOut;
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
		"reverse" : false,
		"fadeIn" : 0,
		"fadeOut" : 0
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
	 *  @param  {Function=} callback The function to invoke once
	 *                               the sample is loaded.
	 *  @returns {Promise}
	 */
	Tone.Player.prototype.load = function(url, callback){
		return this._buffer.load(url, this._onload.bind(this, callback));
	};

	/**
	 * Internal callback when the buffer is loaded.
	 * @private
	 */
	Tone.Player.prototype._onload = function(callback){
		callback = Tone.defaultArg(callback, Tone.noOp);
		callback(this);
		if (this.autostart){
			this.start();
		}
	};

	/**
	 * Internal callback when the buffer is done playing.
	 * @private
	 */
	Tone.Player.prototype._onSourceEnd = function(source){
		var index = this._activeSources.indexOf(source);
		this._activeSources.splice(index, 1);
		if (this._activeSources.length === 0 && !this._synced){
			this._state.setStateAtTime(Tone.State.Stopped, Tone.now());
		}
	};

	/**
	 *  Play the buffer at the given startTime. Optionally add an offset
	 *  and/or duration which will play the buffer from a position
	 *  within the buffer for the given duration.
	 *
	 *  @param  {Time} [startTime=now] When the player should start.
	 *  @param  {Time} [offset=0] The offset from the beginning of the sample
	 *                                 to start at.
	 *  @param  {Time=} duration How long the sample should play. If no duration
	 *                                is given, it will default to the full length
	 *                                of the sample (minus any offset)
	 *  @returns {Tone.Player} this
	 *  @memberOf Tone.Player#
	 *  @method start
	 *  @name start
	 */

	/**
	 *  Internal start method
	 *  @private
	 */
	Tone.Player.prototype._start = function(startTime, offset, duration){
		//if it's a loop the default offset is the loopstart point
		if (this._loop){
			offset = Tone.defaultArg(offset, this._loopStart);
		} else {
			//otherwise the default offset is 0
			offset = Tone.defaultArg(offset, 0);
		}

		//compute the values in seconds
		offset = this.toSeconds(offset);
		var computedDuration = Tone.defaultArg(duration, Math.max(this._buffer.duration - offset, 0));
		computedDuration = this.toSeconds(computedDuration);
		//scale it by the playback rate
		computedDuration = computedDuration / this._playbackRate;

		//get the start time
		startTime = this.toSeconds(startTime);

		//make the source
		var source = new Tone.BufferSource({
			"buffer" : this._buffer,
			"loop" : this._loop,
			"loopStart" : this._loopStart,
			"loopEnd" : this._loopEnd,
			"onended" : this._onSourceEnd.bind(this),
			"playbackRate" : this._playbackRate,
			"fadeIn" : this.fadeIn,
			"fadeOut" : this.fadeOut,
		}).connect(this.output);

		//set the looping properties
		if (!this._loop && !this._synced){
			//if it's not looping, set the state change at the end of the sample
			this._state.setStateAtTime(Tone.State.Stopped, startTime + computedDuration);
		}

		//add it to the array of active sources
		this._activeSources.push(source);

		//start it
		if (this._loop && Tone.isUndef(duration)){
			source.start(startTime, offset);
		} else {
			//subtract the fade out time
			source.start(startTime, offset, computedDuration - this.toSeconds(this.fadeOut));
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
		time = this.toSeconds(time);
		this._activeSources.forEach(function(source){
			source.stop(time);
		});
		return this;
	};

	/**
	 * Stop and then restart the player from the beginning (or offset)
	 *  @param  {Time} [startTime=now] When the player should start.
	 *  @param  {Time} [offset=0] The offset from the beginning of the sample
	 *                                 to start at.
	 *  @param  {Time=} duration How long the sample should play. If no duration
	 *                                is given, it will default to the full length
	 *                                of the sample (minus any offset)
	 *  @returns {Tone.Player} this
	 */
	Tone.Player.prototype.restart = function(time, offset, duration){
		this._stop(time);
		this._start(time, offset, duration);
		return this;
	};

	/**
	 *  Seek to a specific time in the player's buffer. If the
	 *  source is no longer playing at that time, it will stop.
	 *  If you seek to a time that
	 *  @param {Time} offset The time to seek to.
	 *  @param {Time=} time The time for the seek event to occur.
	 *  @return {Tone.Player} this
	 *  @example
	 * source.start(0.2);
	 * source.stop(0.4);
	 */
	Tone.Player.prototype.seek = function(offset, time){
		time = this.toSeconds(time);
		if (this._state.getValueAtTime(time) === Tone.State.Started){
			offset = this.toSeconds(offset);
			// if it's currently playing, stop it
			this._stop(time);
			//restart it at the given time
			this._start(time, offset);
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
			//get the current source
			this._activeSources.forEach(function(source){
				source.loopStart = loopStart;
			});
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
			//get the current source
			this._activeSources.forEach(function(source){
				source.loopEnd = loopEnd;
			});
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
	 * @type {Boolean}
	 * @name loop
	 */
	Object.defineProperty(Tone.Player.prototype, "loop", {
		get : function(){
			return this._loop;
		},
		set : function(loop){
			//if no change, do nothing
			if (this._loop === loop){
				return;
			}
			this._loop = loop;
			//set the loop of all of the sources
			this._activeSources.forEach(function(source){
				source.loop = loop;
			});
			if (loop){
				//remove the next stopEvent
				var stopEvent = this._state.getNextState(Tone.State.Stopped, this.now());
				if (stopEvent){
					this._state.cancel(stopEvent.time);
				}
			}
		}
	});

	/**
	 * The playback speed. 1 is normal speed. This is not a signal because
	 * Safari and iOS currently don't support playbackRate as a signal.
	 * @memberOf Tone.Player#
	 * @type {Number}
	 * @name playbackRate
	 */
	Object.defineProperty(Tone.Player.prototype, "playbackRate", {
		get : function(){
			return this._playbackRate;
		},
		set : function(rate){
			this._playbackRate = rate;
			var now = this.now();

			//cancel the stop event since it's at a different time now
			var stopEvent = this._state.getNextState(Tone.State.Stopped, now);
			if (stopEvent){
				this._state.cancel(stopEvent.time);
			}

			//set all the sources
			this._activeSources.forEach(function(source){
				source.cancelStop();
				source.playbackRate.setValueAtTime(rate, now);
			});
		}
	});

	/**
	 * The direction the buffer should play in
	 * @memberOf Tone.Player#
	 * @type {Boolean}
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
	 * If all the buffer is loaded
	 * @memberOf Tone.Player#
	 * @type {Boolean}
	 * @name loaded
	 * @readOnly
	 */
	Object.defineProperty(Tone.Player.prototype, "loaded", {
		get : function(){
			return this._buffer.loaded;
		}
	});

	/**
	 *  Dispose and disconnect.
	 *  @return {Tone.Player} this
	 */
	Tone.Player.prototype.dispose = function(){
		//disconnect all of the players
		this._activeSources.forEach(function(source){
			source.dispose();
		});
		this._activeSources = null;
		Tone.Source.prototype.dispose.call(this);
		this._buffer.dispose();
		this._buffer = null;
		return this;
	};

	return Tone.Player;
});
