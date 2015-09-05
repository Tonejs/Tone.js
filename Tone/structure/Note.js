define(["Tone/core/Tone", "Tone/core/Transport", "Tone/core/Type", "Tone/core/Timeline"], function (Tone) {

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
		 *  Tracks the scheduled events
		 *  @type {Tone.Timeline}
		 *  @private
		 */
		this._events = new Tone.Timeline();

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
	 *  Reschedule all of the events along the timeline
	 *  with the updated values.
	 *  @param {Time} after Only reschedules events after the given time.
	 *  @return  {Tone.Note}  this
	 *  @private
	 */
	Tone.Note.prototype._rescheduleEvents = function(after){
		//if no argument is given, schedules all of the events
		after = this.defaultArg(after, -1);
		this._events.forEachAfter(after, function(event){
			var duration;
			if (event.state === Tone.State.Started){
				if (!this.isUndef(event.id)){
					Tone.Transport.clear(event.id);
				}
				if (this._loop){
					duration = Infinity;
					if (typeof this._loop === "number"){
						duration =  (this._loop - 1) * this._getLoopDuration();
					}
					var nextEvent = this._events.getEventAfter(event.time);
					if (nextEvent !== null){
						duration = Math.min(duration, nextEvent.time - event.time);
					}
					event.id = Tone.Transport.scheduleRepeat(this._tick.bind(this), this._getLoopDuration().toString() + "i", event.time + "i", duration + "i");
				} else {
					event.id = Tone.Transport.schedule(this._tick.bind(this), event.time + "i");
				}
			} 
		}.bind(this));
		return this;
	};

	/**
	 *  Start the note at the given time. 
	 *  @param  {Time}  time  When the note should start.
	 *  @return  {Tone.Note}  this
	 */
	Tone.Note.prototype.start = function(time){
		var scheduledEvent = this._events.getEvent(time);
		if (scheduledEvent === null || scheduledEvent.state === Tone.State.Stopped){
			time = this.toTicks(time);
			this._events.addEvent({
				"state" : Tone.State.Started,
				"time" : time,
				"id" : undefined,
			});
			this._rescheduleEvents(time - 0.001);
		}
		return this;
	};

	/**
	 *  Stop the Note at the given time.
	 *  @param  {Time}  time  When the note should stop.
	 *  @return  {Tone.Note}  this
	 */
	Tone.Note.prototype.stop = function(time){
		var scheduledEvent = this._events.getEvent(time);
		if (scheduledEvent === null || scheduledEvent.state === Tone.State.Started){
			time = this.toTicks(time);
			this._events.addEvent({
				"state" : Tone.State.Stopped,
				"time" : time
			});
			var previousEvent = this._events.getEventBefore(time);
			var reschedulTime = time;
			if (previousEvent !== null){
				reschedulTime = previousEvent.time;
			}
			this._rescheduleEvents(reschedulTime - 0.001);
		}
		return this;
	};

	/**
	 *  Cancel all scheduled events greater than or equal to the given time
	 *  @param  {Time}  [time=0]  The time after which events will be cancel.
	 *  @return  {Tone.Note}  this
	 */
	Tone.Note.prototype.cancel = function(time){
		time = this.defaultArg(time, -Infinity);
		time = this.toTicks(time);
		this._events.forEachAfter(time - 0.001, function(event){
			Tone.Transport.clear(event.id);
		});
		this._events.cancel(time);
		return this;
	};

	/**
	 *  The callback function invoker. Also 
	 *  checks if the Note is done playing
	 *  @param  {Number}  time  The time of the event in seconds
	 *  @private
	 */
	Tone.Note.prototype._tick = function(time){
		var currentState = this._events.getEvent(Tone.Transport.ticks);
		if (currentState !== null && currentState.state === Tone.State.Started){
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
			this._loop = loop;
			this._rescheduleEvents();
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
			if (this._loop){
				this._rescheduleEvents();
			}
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
			this._loopEnd = this.toTicks(loopEnd);
			if (this._loop){
				this._rescheduleEvents();
			}
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
			this._loopStart = this.toTicks(loopStart);
			if (this._loop){
				this._rescheduleEvents();
			}
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
				var lastEvent = this._events.getEvent(ticks);
				if (lastEvent !== null && lastEvent.state === Tone.State.Started){
					var loopDuration = this._getLoopDuration();
					if (typeof this._loop === "number"){
						var endTime = loopDuration * (this._loop);
						if (ticks > endTime){
							return 0;
						}
					}
					var progress = (ticks - lastEvent.time) % loopDuration;
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
		this.cancel();
		this._events.dispose();
		this._events = null;
		this._callback = null;
		this.value = null;
	};

	return Tone.Note;
});