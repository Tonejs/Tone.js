define(["Tone/core/Tone", "Tone/source/Source", "Tone/core/Buffer", "Tone/source/MultiPlayer"], 
function (Tone) {

	/**
	 * @class Tone.GrainPlayer implements [granular synthesis](https://en.wikipedia.org/wiki/Granular_synthesis).
	 *        Granular Synthesis enables you to adjust pitch and playback rate independently. The grainSize is the 
	 *        amount of time each small chunk of audio is played for and the overlap is the 
	 *        amount of crossfading transition time between successive grains.
	 * @extends {Tone}
	 * @param {String|Tone.Buffer} url	The url to load, or the Tone.Buffer to play.
	 * @param {Function=} callback The callback to invoke after the url is loaded.
	 */
	Tone.GrainPlayer = function(){

		var options = this.optionsObject(arguments, ["url", "onload"], Tone.GrainPlayer.defaults);

		Tone.Source.call(this);

		/**
		 *  The audio buffer belonging to the player.
		 *  @type  {Tone.Buffer}
		 */
		this.buffer = new Tone.Buffer(options.url, options.onload);

		/**
		 *  Plays the buffer with a small envelope
		 *  @type  {Tone.MultiPlayer}
		 *  @private
		 */
		this._player = this.output = new Tone.MultiPlayer();

		/**
		 *  Create a repeating tick to schedule
		 *  the grains.
		 *  @type  {Tone.Clock}
		 *  @private
		 */
		this._clock = new Tone.Clock(this._tick.bind(this), 1);

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

		/**
		 *  The amount of time randomly added
		 *  or subtracted from the grain's offset
		 *  @type  {Time}
		 */
		this.drift = options.drift;

		//setup
		this.overlap = options.overlap;
		this.loop = options.loop;
		this.playbackRate = options.playbackRate;
		this.grainSize = options.grainSize;
		this.loopStart = options.loopStart;
		this.loopEnd = options.loopEnd;
		this.reverse = options.reverse;
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
		"drift" : 0.0,
		"playbackRate" : 1,
		"detune" : 0,
		"loop" : false,
		"loopStart" : 0,
		"loopEnd" : 0,
		"reverse" : false
	};

	/**
	 *  Play the buffer at the given startTime. Optionally add an offset
	 *  from the start of the buffer to play from.
	 *  
	 *  @param  {Time} [startTime=now] When the player should start.
	 *  @param  {Time} [offset=0] The offset from the beginning of the sample
	 *                                 to start at. 
	 * @return {Tone.GrainPlayer} this
	 */
	
	/**
	 *  Internal start method
	 *  @param {Time} time
	 *  @param {Time} offset
	 *  @private
	 */
	Tone.GrainPlayer.prototype._start = function(time, offset){
		offset = this.defaultArg(offset, 0);
		offset = this.toSeconds(offset);
		time = this.toSeconds(time);

		this._offset = offset;
		this._clock.start(time);
	};

	/**
	 *  Internal start method
	 *  @param {Time} time
	 *  @private
	 */
	Tone.GrainPlayer.prototype._stop = function(time){
		this._clock.stop(time);
		this._player.stop(this.buffer, time);
		this._offset = 0;
	};

	/**
	 *  Invoked on each clock tick. scheduled a new
	 *  grain at this time.
	 *  @param  {Time}  time 
	 *  @private
	 */
	Tone.GrainPlayer.prototype._tick = function(time){

		var bufferDuration = this.buffer.duration;
		if (this.loop && this._loopEnd > 0){
			bufferDuration = this._loopEnd;
		}
		var drift = (Math.random() * 2 - 1) * this.drift;
		var offset = this._offset - this._overlap + drift;
		var detune = this.detune / 100;


		var originalFadeIn = this._player.fadeIn;
		if (this.loop && this._offset > bufferDuration){
			//play the end
			var endSegmentDuration = this._offset - bufferDuration;
			this._player.start(this.buffer, time, offset, endSegmentDuration + this._overlap, detune);

			//and play the beginning 
			offset = this._offset % bufferDuration;
			this._offset = this._loopStart;
			this._player.fadeIn = 0;
			this._player.start(this.buffer, time + endSegmentDuration, this._offset, offset + this._overlap, detune);
		} else if (this._offset > bufferDuration){
			//set the state to stopped. 
			this.stop(time);
		} else {
			if (offset < 0){
				this._player.fadeIn = Math.max(this._player.fadeIn + offset, 0);
				offset = 0;
			}
			this._player.start(this.buffer, time, offset, this.grainSize + this._overlap, detune);
		}

		this._player.fadeIn = originalFadeIn;
		//increment the offset
		var duration = this._clock._nextTick - time;
		this._offset += duration * this._playbackRate;
	};

	/**
	 *  Jump to a specific time and play it.
	 *  @param  {Time}  offset  The offset to jump to.
	 *  @param {Time=} time When to make the jump.
	 *  @return  {[type]}  [description]
	 */
	Tone.GrainPlayer.prototype.scrub = function(offset, time){
		this._offset = this.toSeconds(offset);
		this._tick(this.toSeconds(time));
		return this;
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
			time = this.toSeconds(time);
			this._overlap = time;
			if (this._overlap < 0){
				this._player.fadeIn = 0.01;
				this._player.fadeOut = 0.01;
			} else {
				this._player.fadeIn = time;
				this._player.fadeOut = time;
			}
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
		this._player.dispose();
		this._player = null;
		this._clock.dispose();
		this._clock = null;
		return this;
	};

	return Tone.GrainPlayer;
});