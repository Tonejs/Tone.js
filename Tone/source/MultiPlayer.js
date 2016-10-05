define(["Tone/core/Tone", "Tone/source/BufferSource", "Tone/core/Buffers", 
	"Tone/source/Source", "Tone/component/Volume"], 
function (Tone) {

	/**
	 *  @class Tone.MultiPlayer is well suited for one-shots, multi-sampled istruments
	 *         or any time you need to play a bunch of audio buffers. 
	 *  @param  {Object|Array|Tone.Buffers}  buffers  The buffers which are available
	 *                                                to the MultiPlayer
	 *  @param {Function} onload The callback to invoke when all of the buffers are loaded.
	 *  @extends {Tone}
	 *  @example
	 * var multiPlayer = new MultiPlayer({
	 * 	"kick" : "path/to/kick.mp3",
	 * 	"snare" : "path/to/snare.mp3",
	 * }, function(){
	 * 	multiPlayer.start("kick");
	 * });
	 *  @example
	 * //can also store the values in an array
	 * var multiPlayer = new MultiPlayer(["path/to/kick.mp3", "path/to/snare.mp3"], 
	 * function(){
	 * 	//if an array is passed in, the samples are referenced to by index
	 * 	multiPlayer.start(1);
	 * });
	 */
	Tone.MultiPlayer = function(){

		var options = this.optionsObject(arguments, ["urls", "onload"], Tone.MultiPlayer.defaults);

		if (options.urls instanceof Tone.Buffers){
			/**
			 *  All the buffers belonging to the player.
			 *  @type  {Tone.Buffers}
			 */
			this.buffers = options.urls;
		} else {
			this.buffers = new Tone.Buffers(options.urls, options.onload);
		}

		/**
		 *  Keeps track of the currently playing sources.
		 *  @type  {Array}
		 *  @private
		 */
		this._activeSources = [];

		/**
		 *  The fade in envelope which is applied
		 *  to the beginning of the BufferSource
		 *  @type  {Time}
		 */
		this.fadeIn = options.fadeIn;

		/**
		 *  The fade out envelope which is applied
		 *  to the end of the BufferSource
		 *  @type  {Time}
		 */
		this.fadeOut = options.fadeOut;

		/**
		 *  The output volume node
		 *  @type  {Tone.Volume}
		 *  @private
		 */
		this._volume = this.output = new Tone.Volume(options.volume);

		/**
		 * The volume of the output in decibels.
		 * @type {Decibels}
		 * @signal
		 * @example
		 * source.volume.value = -6;
		 */
		this.volume = this._volume.volume;
		this._readOnly("volume");

		//make the output explicitly stereo
		this._volume.output.output.channelCount = 2;
		this._volume.output.output.channelCountMode = "explicit";
		//mute initially
		this.mute = options.mute;
	};

	Tone.extend(Tone.MultiPlayer, Tone.Source);

	/**
	 *  The defaults
	 *  @type  {Object}
	 */
	Tone.MultiPlayer.defaults = {
		"onload" : Tone.noOp,
		"fadeIn" : 0,
		"fadeOut" : 0
	};

	/**
	 *  Get the given buffer.
	 *  @param  {String|Number|AudioBuffer|Tone.Buffer}  buffer
	 *  @return  {AudioBuffer}  The requested buffer.
	 *  @private
	 */
	Tone.MultiPlayer.prototype._getBuffer = function(buffer){
		if (this.isNumber(buffer) || this.isString(buffer)){
			return this.buffers.get(buffer).get();
		} else if (buffer instanceof Tone.Buffer){
			return buffer.get();
		} else {
			return buffer;
		}
	};

	/**
	 *  Start a buffer by name. The `start` method allows a number of options
	 *  to be passed in such as offset, interval, and gain. This is good for multi-sampled 
	 *  instruments and sound sprites where samples are repitched played back at different velocities.
	 *  @param  {String|AudioBuffer}  buffer    The name of the buffer to start.
	 *                                          Or pass in a buffer which will be started.
	 *  @param  {Time}  time      When to start the buffer.
	 *  @param  {Time}  [offset=0]    The offset into the buffer to play from.
	 *  @param  {Time=}  duration   How long to play the buffer for.
	 *  @param  {Interval}  [pitch=0]  The interval to repitch the buffer.
	 *  @param  {Gain}  [gain=1]      The gain to play the sample at.
	 *  @return  {Tone.MultiPlayer}  this
	 */
	Tone.MultiPlayer.prototype.start = function(buffer, time, offset, duration, pitch, gain){
		buffer = this._getBuffer(buffer);
		var source = new Tone.BufferSource(buffer).connect(this.output);
		this._activeSources.push(source);
		time = this.toSeconds(time);
		source.start(time, offset, duration, this.defaultArg(gain, 1), this.fadeIn);
		if (duration){
			source.stop(time + this.toSeconds(duration), this.fadeOut);
		}
		source.onended = this._onended.bind(this);
		pitch = this.defaultArg(pitch, 0);
		source.playbackRate.value = this.intervalToFrequencyRatio(pitch);
		return this;
	};

	/**
	 *  Start a looping buffer by name. Similar to `start`, but the buffer
	 *  is looped instead of played straight through. Can still be stopped with `stop`. 
	 *  @param  {String|AudioBuffer}  buffer    The name of the buffer to start.
	 *                                          Or pass in a buffer which will be started.
	 *  @param  {Time}  time      When to start the buffer.
	 *  @param  {Time}  [offset=0]    The offset into the buffer to play from.
	 *  @param  {Time=}  loopStart   The start of the loop.
	 *  @param  {Time=}  loopEnd	The end of the loop.
	 *  @param  {Interval}  [pitch=0]  The interval to repitch the buffer.
	 *  @param  {Gain}  [gain=1]      The gain to play the sample at.
	 *  @return  {Tone.MultiPlayer}  this
	 */
	Tone.MultiPlayer.prototype.startLoop = function(buffer, time, offset, loopStart, loopEnd, pitch, gain){
		buffer = this._getBuffer(buffer);
		var source = new Tone.BufferSource(buffer).connect(this.output);
		this._activeSources.push(source);
		time = this.toSeconds(time);
		source.loop = true;
		source.loopStart = this.toSeconds(this.defaultArg(loopStart, 0));
		source.loopEnd = this.toSeconds(this.defaultArg(loopEnd, 0));
		source.start(time, offset, undefined, this.defaultArg(gain, 1), this.fadeIn);
		source.onended = this._onended.bind(this);
		pitch = this.defaultArg(pitch, 0);
		source.playbackRate.value = this.intervalToFrequencyRatio(pitch);
		return this;
	};

	/**
	 *  Internal callback when a buffer is done playing.
	 *  @param  {Tone.BufferSource}  source  The stopped source
	 *  @private
	 */
	Tone.MultiPlayer.prototype._onended = function(source){
		var index = this._activeSources.indexOf(source);
		this._activeSources.splice(index, 1);
	};

	/**
	 *  Stop all instances of the currently playing buffer at the given time.
	 *  @param  {String|AudioBuffer}  buffer  The buffer to stop.
	 *  @param  {Time=}  time    When to stop the buffer
	 *  @return  {Tone.MultiPlayer}  this
	 */
	Tone.MultiPlayer.prototype.stop = function(buffer, time){
		buffer = this._getBuffer(buffer);
		time = this.toSeconds(time);
		for (var i = 0; i < this._activeSources.length; i++){
			if (this._activeSources[i].buffer === buffer){
				this._activeSources[i].stop(time, this.fadeOut);
			}
		}
		return this;
	};

	/**
	 *  Stop all currently playing buffers at the given time.
	 *  @param  {Time=}  time  When to stop the buffers.
	 *  @return  {Tone.MultiPlayer}  this
	 */
	Tone.MultiPlayer.prototype.stopAll = function(time){
		time = this.toSeconds(time);
		for (var i = 0; i < this._activeSources.length; i++){
			this._activeSources[i].stop(time, this.fadeOut);
		}
		return this;
	};

	/**
	 *  Add another buffer to the available buffers.
	 *  @param {String} name The name to that the buffer is refered
	 *                       to in start/stop methods. 
	 *  @param {String|Tone.Buffer} url The url of the buffer to load
	 *                                  or the buffer.
	 *  @param {Function} callback The function to invoke after the buffer is loaded.
	 */
	Tone.MultiPlayer.prototype.add = function(name, url, callback){
		this.buffers.add(name, url, callback);
		return this;
	};

	/**
	 *  Returns the playback state of the source. "started"
	 *  if there are any buffers playing. "stopped" otherwise.
	 *  @type {Tone.State}
	 *  @readOnly
	 *  @memberOf Tone.MultiPlayer#
	 *  @name state
	 */
	Object.defineProperty(Tone.MultiPlayer.prototype, "state", {
		get : function(){
			return this._activeSources.length > 0 ? Tone.State.Started : Tone.State.Stopped;
		}
	});

	/**
	 * Mute the output. 
	 * @memberOf Tone.MultiPlayer#
	 * @type {boolean}
	 * @name mute
	 * @example
	 * //mute the output
	 * source.mute = true;
	 */
	Object.defineProperty(Tone.MultiPlayer.prototype, "mute", {
		get : function(){
			return this._volume.mute;
		}, 
		set : function(mute){
			this._volume.mute = mute;
		}
	});

	/**
	 *  Clean up.
	 *  @return  {Tone.MultiPlayer}  this
	 */
	Tone.MultiPlayer.prototype.dispose = function(){
		Tone.prototype.dispose.call(this);
		this._volume.dispose();
		this._volume = null;
		this._writable("volume");
		this.volume = null;
		this.buffers.dispose();
		this.buffers = null;
		for (var i = 0; i < this._activeSources.length; i++){
			this._activeSources[i].dispose();
		}
		this._activeSources = null;
		return this;
	};

	return Tone.MultiPlayer;
});