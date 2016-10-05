define(["Tone/core/Tone", "Tone/core/Buffer", "Tone/source/Source", "Tone/core/Gain"], function (Tone) {

	/**
	 *  @class Wrapper around the native BufferSourceNode.
	 *  @param  {AudioBuffer|Tone.Buffer}  buffer   The buffer to play
	 *  @param  {Function}  onended  The callback to invoke when the 
	 *                               buffer is done playing.
	 */
	Tone.BufferSource = function(){

		var options = this.optionsObject(arguments, ["buffer", "onended"], Tone.BufferSource.defaults);

		/**
		 *  The callback to invoke after the 
		 *  buffer source is done playing. 
		 *  @type  {Function}
		 */
		this.onended = options.onended;

		/**
		 *  The time that the buffer was started.
		 *  @type  {Number}
		 *  @private
		 */
		this._startTime = -1;

		/**
		 *  The gain node which envelopes the BufferSource
		 *  @type  {Tone.Gain}
		 *  @private
		 */
		this._gainNode = this.output = new Tone.Gain();

		/**
		 *  The buffer source
		 *  @type  {AudioBufferSourceNode}
		 *  @private
		 */
		this._source = this.context.createBufferSource();
		this._source.connect(this._gainNode);
		this._source.onended = this._onended.bind(this);
	
		/**
		 *  The playbackRate of the buffer
		 *  @type {Positive}
		 *  @signal
		 */
		this.playbackRate = new Tone.Param(this._source.playbackRate, Tone.Type.Positive);

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

		/**
		 *  The value that the buffer ramps to
		 *  @type {Gain}
		 *  @private
		 */
		this._gain = 1;

		//set the buffer initially
		if (!this.isUndef(options.buffer)){
			this.buffer = options.buffer;
		}

		this.loop = options.loop;
	};

	Tone.extend(Tone.BufferSource);

	/**
	 *  The defaults
	 *  @const
	 *  @type  {Object}
	 */
	Tone.BufferSource.defaults = {
		"onended" : Tone.noOp,
		"fadeIn" : 0,
		"fadeOut" : 0
	};

	/**
	 *  Returns the playback state of the source, either "started" or "stopped".
	 *  @type {Tone.State}
	 *  @readOnly
	 *  @memberOf Tone.BufferSource#
	 *  @name state
	 */
	Object.defineProperty(Tone.BufferSource.prototype, "state", {
		get : function(){
			var now = this.now();
			if (this._startTime !== -1 && now > this._startTime){
				return Tone.State.Started;
			} else {
				return Tone.State.Stopped;
			}
		}
	});

	/**
	 *  Start the buffer
	 *  @param  {Time} [startTime=now] When the player should start.
	 *  @param  {Time} [offset=0] The offset from the beginning of the sample
	 *                                 to start at. 
	 *  @param  {Time=} duration How long the sample should play. If no duration
	 *                                is given, it will default to the full length 
	 *                                of the sample (minus any offset)
	 *  @param  {Gain}  [gain=1]  The gain to play the buffer back at.
	 *  @param  {Time=}  fadeInTime  The optional fadeIn ramp time.
	 *  @return  {Tone.BufferSource}  this
	 */
	Tone.BufferSource.prototype.start = function(time, offset, duration, gain, fadeInTime){
		if (this._startTime !== -1){
			throw new Error("Tone.BufferSource: can only be started once.");
		}

		if (this.buffer){
			time = this.toSeconds(time);
			//if it's a loop the default offset is the loopstart point
			if (this.loop){
				offset = this.defaultArg(offset, this.loopStart);
			} else {
				//otherwise the default offset is 0
				offset = this.defaultArg(offset, 0);
			}
			offset = this.toSeconds(offset);
			//the values in seconds
			time = this.toSeconds(time);

			this._source.start(time, offset);

			gain = this.defaultArg(gain, 1);
			this._gain = gain;

			//the fadeIn time
			if (this.isUndef(fadeInTime)){
				fadeInTime = this.toSeconds(this.fadeIn);
			} else {
				fadeInTime = this.toSeconds(fadeInTime);
			}

			if (fadeInTime > 0){
				this._gainNode.gain.setValueAtTime(0, time);
				this._gainNode.gain.linearRampToValueAtTime(this._gain, time + fadeInTime);
			} else {
				this._gainNode.gain.setValueAtTime(gain, time);
			}

			this._startTime = time + fadeInTime;

			if (!this.isUndef(duration)){
				duration = this.defaultArg(duration, this.buffer.duration - offset);
				duration = this.toSeconds(duration);
				this.stop(time + duration + fadeInTime, fadeInTime);
			}
		}

		return this;
	};

	/**
	 *  Stop the buffer. Optionally add a ramp time to fade the 
	 *  buffer out. 
	 *  @param  {Time=}  time         The time the buffer should stop.
	 *  @param  {Time=}  fadeOutTime  How long the gain should fade out for
	 *  @return  {Tone.BufferSource}  this
	 */
	Tone.BufferSource.prototype.stop = function(time, fadeOutTime){
		if (this.buffer){

			time = this.toSeconds(time);
			
			//the fadeOut time
			if (this.isUndef(fadeOutTime)){
				fadeOutTime = this.toSeconds(this.fadeOut);
			} else {
				fadeOutTime = this.toSeconds(fadeOutTime);
			}

			//cancel the end curve
			this._gainNode.gain.cancelScheduledValues(this._startTime + this.sampleTime);

			//set a new one
			if (fadeOutTime > 0){
				this._gainNode.gain.setValueAtTime(this._gain, time);
				this._gainNode.gain.linearRampToValueAtTime(0, time + fadeOutTime);
				time += fadeOutTime;
			} else {
				this._gainNode.gain.setValueAtTime(0, time);
			}
			// fix for safari bug and old FF
			if (!this.isNumber(this._source.playbackState) || this._source.playbackState === 2){
				this._source.stop(time);
			}
		}

		return this;
	};

	/**
	 *  Internal callback when the buffer is ended. 
	 *  Invokes `onended` and disposes the node.
	 *  @private
	 */
	Tone.BufferSource.prototype._onended = function(){
		this.onended(this);
		this.dispose();
	};

	/**
	 * If loop is true, the loop will start at this position. 
	 * @memberOf Tone.BufferSource#
	 * @type {Time}
	 * @name loopStart
	 */
	Object.defineProperty(Tone.BufferSource.prototype, "loopStart", {
		get : function(){
			return this._source.loopStart;
		}, 
		set : function(loopStart){
			this._source.loopStart = this.toSeconds(loopStart);
		}
	});

	/**
	 * If loop is true, the loop will end at this position.
	 * @memberOf Tone.BufferSource#
	 * @type {Time}
	 * @name loopEnd
	 */
	Object.defineProperty(Tone.BufferSource.prototype, "loopEnd", {
		get : function(){
			return this._source.loopEnd;
		}, 
		set : function(loopEnd){
			this._source.loopEnd = this.toSeconds(loopEnd);
		}
	});

	/**
	 * The audio buffer belonging to the player. 
	 * @memberOf Tone.BufferSource#
	 * @type {AudioBuffer}
	 * @name buffer
	 */
	Object.defineProperty(Tone.BufferSource.prototype, "buffer", {
		get : function(){
			if (this._source){
				return this._source.buffer;
			} else {
				return null;
			}
		}, 
		set : function(buffer){
			if (buffer instanceof Tone.Buffer){
				this._source.buffer = buffer.get();
			} else {
				this._source.buffer = buffer;
			}
		}
	});

	/**
	 * If the buffer should loop once it's over. 
	 * @memberOf Tone.BufferSource#
	 * @type {boolean}
	 * @name loop
	 */
	Object.defineProperty(Tone.BufferSource.prototype, "loop", {
		get : function(){
			return this._source.loop;
		}, 
		set : function(loop){
			this._source.loop = loop;
		}
	});

	/**
	 *  Clean up.
	 *  @return  {Tone.BufferSource}  this
	 */
	Tone.BufferSource.prototype.dispose = function(){
		this.onended = null;
		if (this._source){
			this._source.onended = null;
			this._source.disconnect();
			this._source = null;
		}
		if (this._gainNode){
			this._gainNode.dispose();
			this._gainNode = null;
		}
		this._startTime = -1;
		this.playbackRate = null;
		this.output = null;
		return this;
	};

	return Tone.BufferSource;
});