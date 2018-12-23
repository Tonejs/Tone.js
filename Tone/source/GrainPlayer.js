define(["../core/Tone", "../source/Source", "../core/Buffer", "../source/BufferSource"], function(Tone){

	/**
	 * @class Tone.GrainPlayer implements [granular synthesis](https://en.wikipedia.org/wiki/Granular_synthesis).
	 *        Granular Synthesis enables you to adjust pitch and playback rate independently. The grainSize is the
	 *        amount of time each small chunk of audio is played for and the overlap is the
	 *        amount of crossfading transition time between successive grains.
	 * @extends {Tone.Source}
	 * @param {String|Tone.Buffer} url	The url to load, or the Tone.Buffer to play.
	 * @param {Function=} callback The callback to invoke after the url is loaded.
	 */
	Tone.GrainPlayer = function(){

		var options = Tone.defaults(arguments, ["url", "onload"], Tone.GrainPlayer);
		Tone.Source.call(this, options);

		/**
		 *  The audio buffer belonging to the player.
		 *  @type  {Tone.Buffer}
		 */
		this.buffer = new Tone.Buffer(options.url, options.onload);

		/**
		 *  Create a repeating tick to schedule
		 *  the grains.
		 *  @type  {Tone.Clock}
		 *  @private
		 */
		this._clock = new Tone.Clock(this._tick.bind(this), options.grainSize);

		/**
		 *  @type  {Number}
		 *  @private
		 */
		this._loopStart = 0;

		/**
		 *  @type  {Number}
		 *  @private
		 */
		this._loopEnd = 0;

		/**
		 * All of the currently playing BufferSources
		 * @type {Array}
		 * @private
		 */
		this._activeSources = [];

		/**
		 *  @type  {Number}
		 *  @private
		 */
		this._playbackRate = options.playbackRate;

		/**
		 *  @type  {Number}
		 *  @private
		 */
		this._grainSize = options.grainSize;

		/**
		 *  @private
		 *  @type {Number}
		 */
		this._overlap = options.overlap;

		/**
		 *  Adjust the pitch independently of the playbackRate.
		 *  @type  {Cents}
		 */
		this.detune = options.detune;

		//setup
		this.overlap = options.overlap;
		this.loop = options.loop;
		this.playbackRate = options.playbackRate;
		this.grainSize = options.grainSize;
		this.loopStart = options.loopStart;
		this.loopEnd = options.loopEnd;
		this.reverse = options.reverse;

		this._clock.on("stop", this._onstop.bind(this));
	};

	Tone.extend(Tone.GrainPlayer, Tone.Source);

	/**
	 *  the default parameters
	 *  @static
	 *  @const
	 *  @type {Object}
	 */
	Tone.GrainPlayer.defaults = {
		"onload" : Tone.noOp,
		"overlap" : 0.1,
		"grainSize" : 0.2,
		"playbackRate" : 1,
		"detune" : 0,
		"loop" : false,
		"loopStart" : 0,
		"loopEnd" : 0,
		"reverse" : false
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
	 *  @returns {Tone.GrainPlayer} this
	 *  @memberOf Tone.GrainPlayer#
	 *  @method start
	 *  @name start
	 */

	/**
	 *  Internal start method
	 *  @param {Time} time
	 *  @param {Time} offset
	 *  @private
	 */
	Tone.GrainPlayer.prototype._start = function(time, offset, duration){
		offset = Tone.defaultArg(offset, 0);
		offset = this.toSeconds(offset);
		time = this.toSeconds(time);

		this._offset = offset;
		this._clock.start(time);

		if (duration){
			this.stop(time + this.toSeconds(duration));
		}
	};

	/**
	 *  Internal start method
	 *  @param {Time} time
	 *  @private
	 */
	Tone.GrainPlayer.prototype._stop = function(time){
		this._clock.stop(time);
	};

	/**
	 * Invoked when the clock is stopped
	 * @param  {Number} time
	 * @private
	 */
	Tone.GrainPlayer.prototype._onstop = function(time){
		//stop the players
		this._activeSources.forEach(function(source){
			source.fadeOut = 0;
			source.stop(time);
		});
	};

	/**
	 *  Invoked on each clock tick. scheduled a new
	 *  grain at this time.
	 *  @param  {Time}  time
	 *  @private
	 */
	Tone.GrainPlayer.prototype._tick = function(time){

		//check if it should stop looping
		if (!this.loop && this._offset > this.buffer.duration){
			this.stop(time);
			return;
		}

		//at the beginning of the file, the fade in should be 0
		var fadeIn = this._offset < this._overlap ? 0 : this._overlap;

		//create a buffer source
		var source = new Tone.BufferSource({
			"buffer" : this.buffer,
			"fadeIn" : fadeIn,
			"fadeOut" : this._overlap,
			"loop" : this.loop,
			"loopStart" : this._loopStart,
			"loopEnd" : this._loopEnd,
			//compute the playbackRate based on the detune
			"playbackRate" : Tone.intervalToFrequencyRatio(this.detune / 100)
		}).connect(this.output);

		source.start(time, this._offset);
		this._offset += this.grainSize;
		source.stop(time + this.grainSize / this.playbackRate);

		//add it to the active sources
		this._activeSources.push(source);
		//remove it when it's done
		source.onended = function(){
			var index = this._activeSources.indexOf(source);
			if (index !== -1){
				this._activeSources.splice(index, 1);
			}
		}.bind(this);
	};

	/**
	 * The playback rate of the sample
	 * @memberOf Tone.GrainPlayer#
	 * @type {Positive}
	 * @name playbackRate
	 */
	Object.defineProperty(Tone.GrainPlayer.prototype, "playbackRate", {
		get : function(){
			return this._playbackRate;
		},
		set : function(rate){
			this._playbackRate = rate;
			this.grainSize = this._grainSize;
		}
	});

	/**
	 * The loop start time.
	 * @memberOf Tone.GrainPlayer#
	 * @type {Time}
	 * @name loopStart
	 */
	Object.defineProperty(Tone.GrainPlayer.prototype, "loopStart", {
		get : function(){
			return this._loopStart;
		},
		set : function(time){
			this._loopStart = this.toSeconds(time);
		}
	});

	/**
	 * The loop end time.
	 * @memberOf Tone.GrainPlayer#
	 * @type {Time}
	 * @name loopEnd
	 */
	Object.defineProperty(Tone.GrainPlayer.prototype, "loopEnd", {
		get : function(){
			return this._loopEnd;
		},
		set : function(time){
			this._loopEnd = this.toSeconds(time);
		}
	});

	/**
	 * The direction the buffer should play in
	 * @memberOf Tone.GrainPlayer#
	 * @type {boolean}
	 * @name reverse
	 */
	Object.defineProperty(Tone.GrainPlayer.prototype, "reverse", {
		get : function(){
			return this.buffer.reverse;
		},
		set : function(rev){
			this.buffer.reverse = rev;
		}
	});

	/**
	 * The size of each chunk of audio that the
	 * buffer is chopped into and played back at.
	 * @memberOf Tone.GrainPlayer#
	 * @type {Time}
	 * @name grainSize
	 */
	Object.defineProperty(Tone.GrainPlayer.prototype, "grainSize", {
		get : function(){
			return this._grainSize;
		},
		set : function(size){
			this._grainSize = this.toSeconds(size);
			this._clock.frequency.value = this._playbackRate / this._grainSize;
		}
	});

	/**
	 * This is the duration of the cross-fade between
	 * sucessive grains.
	 * @memberOf Tone.GrainPlayer#
	 * @type {Time}
	 * @name overlap
	 */
	Object.defineProperty(Tone.GrainPlayer.prototype, "overlap", {
		get : function(){
			return this._overlap;
		},
		set : function(time){
			this._overlap = this.toSeconds(time);
		}
	});

	/**
	 * If all the buffer is loaded
	 * @memberOf Tone.GrainPlayer#
	 * @type {Boolean}
	 * @name loaded
	 * @readOnly
	 */
	Object.defineProperty(Tone.GrainPlayer.prototype, "loaded", {
		get : function(){
			return this.buffer.loaded;
		}
	});

	/**
	 * Clean up
	 * @return {Tone.GrainPlayer} this
	 */
	Tone.GrainPlayer.prototype.dispose = function(){
		Tone.Source.prototype.dispose.call(this);
		this.buffer.dispose();
		this.buffer = null;
		this._clock.dispose();
		this._clock = null;
		this._activeSources.forEach(function(source){
			source.dispose();
		});
		this._activeSources = null;
		return this;
	};

	return Tone.GrainPlayer;
});
