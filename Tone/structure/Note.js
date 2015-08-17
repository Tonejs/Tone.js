define(["Tone/core/Tone", "Tone/core/Transport", "Tone/core/Types"], function (Tone) {

	"use strict";

	/**
	 *  @class  Tone.Note provides a callback for a single, repeatable
	 *          event along the timeline. 
	 *
	 *  @param {function} callback The callback to invoke at the time. 
	 *  @param {*...=} value The value or values which should be passed to
	 *                      the callback function on invocation.  
	 *  @example
	 * var chord = new Tone.Note(function(time, chord){
	 * 	//the chord as well as the exact time of the event
	 * 	//are passed in as arguments to the callback function
	 * }, "Dm");
	 * //start the chord at the beginning of the transport timeline
	 * chord.start();
	 * //loop it every measure for 8 measures
	 * chord.loop = 8;
	 * chord.loopEnd = "1m";
	 */
	Tone.Note = function(){

		var options = this.optionsObject(arguments, ["callback", "value"], Tone.Note.defaults);

		/**
		 *  Loop value
		 *  @type  {Boolean|Positive}
		 *  @private
		 */
		this._loop = options.loop;

		/**
		 *  The callback to invoke. 
		 *  @type  {Function}
		 *  @private
		 */
		this._callback = options.callback;

		/**
		 *  The value which is passed to the
		 *  callback function.
		 *  @type  {*}
		 *  @private
		 */
		this.value = options.value;

		/**
		 *  When the note is scheduled to start.
		 *  @type  {Number}
		 *  @private
		 */
		this._loopStart = 0;

		/**
		 *  When the note is scheduled to start.
		 *  @type  {Number}
		 *  @private
		 */
		this._loopEnd = 0;

		/**
		 *  When the note is going to start
		 *  @type {Ticks}
		 *  @private
		 */
		this._startTick = -1;

		/**
		 *  When the note is going to end
		 *  @type {Ticks}
		 *  @private
		 */
		this._stopTick = Infinity;

		/**
		 *  The playback speed of the note. A speed of 1
		 *  is no change. 
		 *  @private
		 *  @type {Positive}
		 */
		this._playbackRate = 1;

		/**
		 *  The probability that the callback will be invoked
		 *  at the scheduled time. 
		 *  @type {NormalRange}
		 */
		this.probability = options.probability;

		/**
		 *  The event id of the last scheduled event
		 *  @private
		 *  @type {Number}
		 */
		this._eventId = -1;

		//set the initial values
		this.loopStart = options.loopStart;
		this.loopEnd = options.loopEnd;
		this.playbackRate = options.playbackRate;

		//if an object was used in the constructor, the value is all the extra parameters
		if (arguments.length === 1 && typeof arguments[0] === "object" && this.isUndef(this.value)){
			var valueObj = {};
			for (var param in arguments[0]){
				if (!Tone.Note.defaults.hasOwnProperty(param)){
					valueObj[param] = arguments[0][param];
				}
			}
			this.value = valueObj;
		}
	};

	Tone.extend(Tone.Note);

	/**
	 *  The default values
	 *  @type  {Object}
	 *  @const
	 */
	Tone.Note.defaults = {
		"callback" : Tone.noOp,
		"loop" : false,
		"loopEnd" : "1m",
		"loopStart" : 0,
		"playbackRate" : 1,
		"probability" : 1
	};

	/**
	 *  Start the note at the given time. 
	 *  @param  {Time}  time  When the note should start.
	 *  @return  {Tone.Note}  this
	 */
	Tone.Note.prototype.start = function(time, offset){
		if (this._startTick === -1){
			//if the previous event hasn't been cancelled yet
			if (this._eventId !== -1){
				Tone.Transport.cancel(this._eventId);
				this._eventId = -1;
			}
			this._startTick = this.toTicks(time) - this.toTicks(offset);
			this._stopTick = Infinity;
			if (this._loop){
				this._eventId = Tone.Transport.scheduleRepeat(this._tick.bind(this), this._getLoopDuration() + "i", this._startTick + "i");
				if (typeof this._loop === "number"){
					var duration = this._loopEnd - this._loopStart;
					this._stopTick = this._loop * duration + this._startTick;
				}
			} else {
				this._eventId = Tone.Transport.schedule(this._tick.bind(this), this._startTick + "i");
			}
		}
		return this;
	};

	/**
	 *  Stop the Note at the given time.
	 *  @param  {Time}  time  When the note should stop.
	 *  @return  {Tone.Note}  this
	 */
	Tone.Note.prototype.stop = function(time){
		if (this._startTick !== -1){
			this._stopTick = this.toTicks(time);
			this._startTick = -1;
		} 
		return this;
	};

	/**
	 *  The callback function invoker. Also 
	 *  checks if the Note is done playing
	 *  @param  {Number}  time  The time of the event in seconds
	 *  @private
	 */
	Tone.Note.prototype._tick = function(time){
		if (Tone.Transport.ticks >= this._stopTick && this._eventId !== -1){
			Tone.Transport.cancel(this._eventId);
			this._eventId = -1;
			this._stopTick = Infinity;
		} else {
			if (this.probability < 1){
				if (Math.random() <= this.probability){
					this._callback(time, this.value);	
				}
			} else {
				this._callback(time, this.value);
			}
		}
	};

	/**
	 *  Get the duration of the loop.
	 *  @return  {Number}
	 *  @private
	 */
	Tone.Note.prototype._getLoopDuration = function(){
		return Math.round((this._loopEnd - this._loopStart) / this._playbackRate);
	};

	/**
	 *  If the note should loop or not
	 *  between Tone.Note.loopStart and 
	 *  Tone.Note.loopEnd. An integer
	 *  value corresponds to the number of
	 *  loops the Note does after it starts.
	 *  @memberOf Tone.Note#
	 *  @type {Boolean|Positive}
	 *  @name loop
	 */
	Object.defineProperty(Tone.Note.prototype, "loop", {
		get : function(){
			return this._loop;
		},
		set : function(loop){
			if (this._startTick !== -1){
				if (loop){
					var duration = this._getLoopDuration();
					if (typeof loop === "number"){
						this._stopTick = loop * duration + this._startTick;
					} else {
						this._stopTick = Infinity;
					}
					//cancel the previous event and set a new one
					Tone.Transport.cancel(this._eventId);
					this._eventId = Tone.Transport.scheduleRepeat(this._tick.bind(this), duration + "i", this._startTick + "i");
				} else {
					//cancel the previous event and set a timeline event
					Tone.Transport.cancel(this._eventId);
					this._eventId = Tone.Transport.schedule(this._tick.bind(this), this._startTick + "i");
				}
			}
			this._loop = loop;
		}
	});

	/**
	 * 	The playback rate of the note. Defaults to 1.
	 *  @memberOf Tone.Note#
	 *  @type {Positive}
	 *  @name playbackRate
	 *  @example
	 * note.loop = true;
	 * //repeat the note twice as fast
	 * note.playbackRate = 2;
	 */
	Object.defineProperty(Tone.Note.prototype, "playbackRate", {
		get : function(){
			return this._playbackRate;
		},
		set : function(rate){
			this._playbackRate = rate;
			if (this._startTick !== -1){
				var offset = this._getLoopDuration() * this.progress;
				this.stop();
				this.start()
				this._startTick = Math.round((event.time) / rate + this._startTick);
			}
			//reinit the loop
			this.loop = this._loop;
		}
	});

	/**
	 *  The loopEnd point determines when it will 
	 *  loop if Tone.Note.loop is true.
	 *  @memberOf Tone.Note#
	 *  @type {Boolean|Positive}
	 *  @name loopEnd
	 */
	Object.defineProperty(Tone.Note.prototype, "loopEnd", {
		get : function(){
			return this.toNotation(this._loopEnd + "i");
		},
		set : function(loopEnd){
			//reset the loop
			this._loopEnd = this.toTicks(loopEnd);
			this.loop = this._loop;
		}
	});

	/**
	 *  The loopStart point determines when it will 
	 *  loop if Tone.Note.loop is true.
	 *  @memberOf Tone.Note#
	 *  @type {Boolean|Positive}
	 *  @name loopStart
	 */
	Object.defineProperty(Tone.Note.prototype, "loopStart", {
		get : function(){
			return this.toNotation(this._loopStart + "i");
		},
		set : function(loopStart){
			//reset the loop
			this._loopStart = this.toTicks(loopStart);
			this.loop = this._loop;
		}
	});

	/**
	 *  The current progress of the loop interval.
	 *  Returns 0 if the atom is not started yet or the 
	 *  atom is not set to loop.
	 *  @memberOf Tone.Note#
	 *  @type {NormalRange}
	 *  @name progress
	 *  @readOnly
	 */
	Object.defineProperty(Tone.Note.prototype, "progress", {
		get : function(){
			if (this._loop){
				var ticks = Tone.Transport.ticks;
				if (this._startTick !== -1 && ticks > this._startTick){
					var loopDuration = (this._loopEnd - this._loopStart) / this.playbackRate;
					var progress = (ticks - this._startTick) % loopDuration;
					return progress / loopDuration;
				} else {
					return 0;
				}
			} else {
				return 0;
			}
		}
	});

	/**
	 *  Clean up
	 *  @return  {Tone.Note}  this
	 */
	Tone.Note.prototype.dispose = function(){
		if (this._eventId !== -1){
			Tone.Transport.cancel(this._eventId);
		}
		this._callback = null;
		this.value = null;
	};

	return Tone.Note;
});