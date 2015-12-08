define(["Tone/core/Tone", "Tone/core/Clock", "Tone/core/Type", "Tone/core/Timeline", 
	"Tone/core/Emitter", "Tone/core/Gain", "Tone/core/IntervalTimeline"], 
function(Tone){

	"use strict";

	/**
	 *  @class  Transport for timing musical events.
	 *          Supports tempo curves and time changes. Unlike browser-based timing (setInterval, requestAnimationFrame)
	 *          Tone.Transport timing events pass in the exact time of the scheduled event
	 *          in the argument of the callback function. Pass that time value to the object
	 *          you're scheduling. <br><br>
	 *          A single transport is created for you when the library is initialized. 
	 *          <br><br>
	 *          The transport emits the events: "start", "stop", "pause", and "loop" which are
	 *          called with the time of that event as the argument. 
	 *
	 *  @extends {Tone.Emitter}
	 *  @singleton
	 *  @example
	 * //repeated event every 8th note
	 * Tone.Transport.setInterval(function(time){
	 * 	//do something with the time
	 * }, "8n");
	 *  @example
	 * //one time event 1 second in the future
	 * Tone.Transport.setTimeout(function(time){
	 * 	//do something with the time
	 * }, 1);
	 *  @example
	 * //event fixed to the Transports timeline. 
	 * Tone.Transport.setTimeline(function(time){
	 * 	//do something with the time
	 * }, "16:0:0");
	 */
	Tone.Transport = function(){

		Tone.Emitter.call(this);

		///////////////////////////////////////////////////////////////////////
		//	LOOPING
		//////////////////////////////////////////////////////////////////////

		/** 
		 * 	If the transport loops or not.
		 *  @type {boolean}
		 */
		this.loop = false;

		/** 
		 * 	The loop start position in ticks
		 *  @type {Ticks}
		 *  @private
		 */
		this._loopStart = 0;

		/** 
		 * 	The loop end position in ticks
		 *  @type {Ticks}
		 *  @private
		 */
		this._loopEnd = 0;

		///////////////////////////////////////////////////////////////////////
		//	CLOCK/TEMPO
		//////////////////////////////////////////////////////////////////////

		/**
		 *  Pulses per quarter is the number of ticks per quarter note.
		 *  @private
		 *  @type  {Number}
		 */
		this._ppq = TransportConstructor.defaults.PPQ;

		/**
		 *  watches the main oscillator for timing ticks
		 *  initially starts at 120bpm
		 *  @private
		 *  @type {Tone.Clock}
		 */
		this._clock = new Tone.Clock({
			"callback" : this._processTick.bind(this), 
			"frequency" : 0,
		});
		/**
		 *  The Beats Per Minute of the Transport. 
		 *  @type {BPM}
		 *  @signal
		 *  @example
		 * Tone.Transport.bpm.value = 80;
		 * //ramp the bpm to 120 over 10 seconds
		 * Tone.Transport.bpm.rampTo(120, 10);
		 */
		this.bpm = this._clock.frequency;
		this.bpm._toUnits = this._toUnits.bind(this);
		this.bpm._fromUnits = this._fromUnits.bind(this);
		this.bpm.units = Tone.Type.BPM;
		this.bpm.value = TransportConstructor.defaults.bpm;
		this._readOnly("bpm");

		/**
		 *  The time signature, or more accurately the numerator
		 *  of the time signature over a denominator of 4. 
		 *  @type {Number}
		 *  @private
		 */
		this._timeSignature = TransportConstructor.defaults.timeSignature;

		///////////////////////////////////////////////////////////////////////
		//	TIMELINE EVENTS
		//////////////////////////////////////////////////////////////////////

		/**
		 *  All the events in an object to keep track by ID
		 *  @type {Object}
		 *  @private
		 */
		this._scheduledEvents = {};

		/**
		 *  The event ID counter
		 *  @type {Number}
		 *  @private
		 */
		this._eventID = 0;

		/**
		 * 	The scheduled events.
		 *  @type {Tone.Timeline}
		 *  @private
		 */
		this._timeline = new Tone.Timeline();

		/**
		 *  Repeated events
		 *  @type {Array}
		 *  @private
		 */
		this._repeatedEvents = new Tone.IntervalTimeline();

		/**
		 *  Events that occur once
		 *  @type {Array}
		 *  @private
		 */
		this._onceEvents = new Tone.Timeline();

		/** 
		 *  All of the synced Signals
		 *  @private 
		 *  @type {Array}
		 */
		this._syncedSignals = [];

		///////////////////////////////////////////////////////////////////////
		//	SWING
		//////////////////////////////////////////////////////////////////////

		var swingSeconds = this.notationToSeconds(TransportConstructor.defaults.swingSubdivision, TransportConstructor.defaults.bpm, TransportConstructor.defaults.timeSignature);

		/**
		 *  The subdivision of the swing
		 *  @type  {Ticks}
		 *  @private
		 */
		this._swingTicks = (swingSeconds / (60 / TransportConstructor.defaults.bpm)) * this._ppq;

		/**
		 *  The swing amount
		 *  @type {NormalRange}
		 *  @private
		 */
		this._swingAmount = 0;

	};

	Tone.extend(Tone.Transport, Tone.Emitter);

	/**
	 *  the defaults
	 *  @type {Object}
	 *  @const
	 *  @static
	 */
	Tone.Transport.defaults = {
		"bpm" : 120,
		"swing" : 0,
		"swingSubdivision" : "16n",
		"timeSignature" : 4,
		"loopStart" : 0,
		"loopEnd" : "4m",
		"PPQ" : 48
	};

	///////////////////////////////////////////////////////////////////////////////
	//	TICKS
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  called on every tick
	 *  @param   {number} tickTime clock relative tick time
	 *  @private
	 */
	Tone.Transport.prototype._processTick = function(tickTime){
		//handle swing
		if (this._swingAmount > 0 && 
			this._clock.ticks % this._ppq !== 0 && //not on a downbeat
			this._clock.ticks % this._swingTicks === 0){
			//add some swing
			tickTime += this.ticksToSeconds(this._swingTicks) * this._swingAmount;
		}
		//do the loop test
		if (this.loop){
			if (this._clock.ticks === this._loopEnd){
				this.ticks = this._loopStart;
				this.trigger("loop", tickTime);
			}
		}
		var ticks = this._clock.ticks;
		//fire the next tick events if their time has come
		this._timeline.forEachAtTime(ticks, function(event){
			event.callback(tickTime);
		});
		//process the repeated events
		this._repeatedEvents.forEachOverlap(ticks, function(event){
			if ((ticks - event.time) % event.interval === 0){
				event.callback(tickTime);
			}
		});
		//process the single occurrence events
		this._onceEvents.forEachBefore(ticks, function(event){
			event.callback(tickTime);
		});
		//and clear the single occurrence timeline
		this._onceEvents.cancelBefore(ticks);
	};

	///////////////////////////////////////////////////////////////////////////////
	//	SCHEDULABLE EVENTS
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  Schedule an event along the timeline.
	 *  @param {Function} callback The callback to be invoked at the time.
	 *  @param {Time}  time The time to invoke the callback at.
	 *  @return {Number} The id of the event which can be used for canceling the event. 
	 *  @example
	 * //trigger the callback when the Transport reaches the desired time
	 * Tone.Transport.schedule(function(time){
	 * 	envelope.triggerAttack(time);
	 * }, "128i");
	 */
	Tone.Transport.prototype.schedule = function(callback, time){
		var event = {
			"time" : this.toTicks(time),
			"callback" : callback
		};
		var id = this._eventID++;
		this._scheduledEvents[id.toString()] = {
			"event" : event,
			"timeline" : this._timeline
		};
		this._timeline.addEvent(event);
		return id;
	};

	/**
	 *  Schedule a repeated event along the timeline. The event will fire
	 *  at the `interval` starting at the `startTime` and for the specified
	 *  `duration`. 
	 *  @param  {Function}  callback   The callback to invoke.
	 *  @param  {Time}    interval   The duration between successive
	 *                               callbacks.
	 *  @param  {Time=}    startTime  When along the timeline the events should
	 *                               start being invoked.
	 *  @param {Time} [duration=Infinity] How long the event should repeat. 
	 *  @return  {Number}    The ID of the scheduled event. Use this to cancel
	 *                           the event. 
	 *  @example
	 * //a callback invoked every eighth note after the first measure
	 * Tone.Transport.scheduleRepeat(callback, "8n", "1m");
	 */
	Tone.Transport.prototype.scheduleRepeat = function(callback, interval, startTime, duration){
		if (interval <= 0){
			throw new Error("repeat events must have an interval larger than 0");
		}
		var event = {
			"time" : this.toTicks(startTime),
			"duration" : this.toTicks(this.defaultArg(duration, Infinity)),
			"interval" : this.toTicks(interval),
			"callback" : callback
		};
		var id = this._eventID++;
		this._scheduledEvents[id.toString()] = {
			"event" : event,
			"timeline" : this._repeatedEvents
		};
		this._repeatedEvents.addEvent(event);
		return id;
	};

	/**
	 *  Schedule an event that will be removed after it is invoked. 
	 *  Note that if the given time is less than the current transport time, 
	 *  the event will be invoked immediately. 
	 *  @param {Function} callback The callback to invoke once.
	 *  @param {Time} time The time the callback should be invoked.
	 *  @returns {Number} The ID of the scheduled event. 
	 */
	Tone.Transport.prototype.scheduleOnce = function(callback, time){
		var event = {
			"time" : this.toTicks(time),
			"callback" : callback
		};
		var id = this._eventID++;
		this._scheduledEvents[id.toString()] = {
			"event" : event,
			"timeline" : this._onceEvents
		};
		this._onceEvents.addEvent(event);
		return id;
	};

	/**
	 *  Clear the passed in event id from the timeline
	 *  @param {Number} eventId The id of the event.
	 *  @returns {Tone.Transport} this
	 */
	Tone.Transport.prototype.clear = function(eventId){
		if (this._scheduledEvents.hasOwnProperty(eventId)){
			var item = this._scheduledEvents[eventId.toString()];
			item.timeline.removeEvent(item.event);
			delete this._scheduledEvents[eventId.toString()];
		}
		return this;
	};

	/**
	 *  Remove scheduled events from the timeline after
	 *  the given time. Repeated events will be removed
	 *  if their startTime is after the given time
	 *  @param {Time} [after=0] Clear all events after
	 *                          this time. 
	 *  @returns {Tone.Transport} this
	 */
	Tone.Transport.prototype.cancel = function(after){
		after = this.defaultArg(after, 0);
		after = this.toTicks(after);
		this._timeline.cancel(after);
		this._onceEvents.cancel(after);
		this._repeatedEvents.cancel(after);
		return this;
	};

	///////////////////////////////////////////////////////////////////////////////
	//	QUANTIZATION
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  Returns the time closest time (equal to or after the given time) that aligns 
	 *  to the subidivision. 
	 *  @param {Time} time The time value to quantize to the given subdivision
	 *  @param  {String} [subdivision="4n"] The subdivision to quantize to.
	 *  @return {Number} 	the time in seconds until the next subdivision.
	 *  @example
	 * Tone.Transport.bpm.value = 120;
	 * Tone.Transport.quantize("3 * 4n", "1m"); //return 0.5
	 * //if the clock is started, it will return a value less than 0.5
	 */
	Tone.Transport.prototype.quantize = function(time, subdivision){
		subdivision = this.defaultArg(subdivision, "4n");
		var tickTime = this.toTicks(time);
		subdivision = this.toTicks(subdivision);
		var remainingTicks = subdivision - (tickTime % subdivision);
		if (remainingTicks === subdivision){
			remainingTicks = 0;
		}
		var now = this.now();
		if (this.state === Tone.State.Started){
			now = this._clock._nextTick;
		}
		return this.toSeconds(time, now) + this.ticksToSeconds(remainingTicks);
	};

	///////////////////////////////////////////////////////////////////////////////
	//	START/STOP/PAUSE
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  Returns the playback state of the source, either "started", "stopped", or "paused"
	 *  @type {Tone.State}
	 *  @readOnly
	 *  @memberOf Tone.Transport#
	 *  @name state
	 */
	Object.defineProperty(Tone.Transport.prototype, "state", {
		get : function(){
			return this._clock.getStateAtTime(this.now());
		}
	});

	/**
	 *  Start the transport and all sources synced to the transport.
	 *  @param  {Time} [time=now] The time when the transport should start.
	 *  @param  {Time=} offset The timeline offset to start the transport.
	 *  @returns {Tone.Transport} this
	 *  @example
	 * //start the transport in one second starting at beginning of the 5th measure. 
	 * Tone.Transport.start("+1", "4:0:0");
	 */
	Tone.Transport.prototype.start = function(time, offset){
		time = this.toSeconds(time);
		if (!this.isUndef(offset)){
			offset = this.toTicks(offset);
		} else {
			offset = this.defaultArg(offset, this._clock.ticks);
		}
		//start the clock
		this._clock.start(time, offset);
		this.trigger("start", time, this.ticksToSeconds(offset));
		return this;
	};

	/**
	 *  Stop the transport and all sources synced to the transport.
	 *  @param  {Time} [time=now] The time when the transport should stop. 
	 *  @returns {Tone.Transport} this
	 *  @example
	 * Tone.Transport.stop();
	 */
	Tone.Transport.prototype.stop = function(time){
		time = this.toSeconds(time);
		this._clock.stop(time);
		this.trigger("stop", time);
		return this;
	};

	/**
	 *  Pause the transport and all sources synced to the transport.
	 *  @param  {Time} [time=now]
	 *  @returns {Tone.Transport} this
	 */
	Tone.Transport.prototype.pause = function(time){
		time = this.toSeconds(time);
		this._clock.pause(time);
		this.trigger("pause", time);
		return this;
	};

	///////////////////////////////////////////////////////////////////////////////
	//	SETTERS/GETTERS
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  The time signature as just the numerator over 4. 
	 *  For example 4/4 would be just 4 and 6/8 would be 3.
	 *  @memberOf Tone.Transport#
	 *  @type {Number|Array}
	 *  @name timeSignature
	 *  @example
	 * //common time
	 * Tone.Transport.timeSignature = 4;
	 * // 7/8
	 * Tone.Transport.timeSignature = [7, 8];
	 * //this will be reduced to a single number
	 * Tone.Transport.timeSignature; //returns 3.5
	 */
	Object.defineProperty(Tone.Transport.prototype, "timeSignature", {
		get : function(){
			return this._timeSignature;
		},
		set : function(timeSig){
			if (this.isArray(timeSig)){
				timeSig = (timeSig[0] / timeSig[1]) * 4;
			}
			this._timeSignature = timeSig;
		}
	});


	/**
	 * When the Tone.Transport.loop = true, this is the starting position of the loop.
	 * @memberOf Tone.Transport#
	 * @type {Time}
	 * @name loopStart
	 */
	Object.defineProperty(Tone.Transport.prototype, "loopStart", {
		get : function(){
			return this.ticksToSeconds(this._loopStart);
		},
		set : function(startPosition){
			this._loopStart = this.toTicks(startPosition);
		}
	});

	/**
	 * When the Tone.Transport.loop = true, this is the ending position of the loop.
	 * @memberOf Tone.Transport#
	 * @type {Time}
	 * @name loopEnd
	 */
	Object.defineProperty(Tone.Transport.prototype, "loopEnd", {
		get : function(){
			return this.ticksToSeconds(this._loopEnd);
		},
		set : function(endPosition){
			this._loopEnd = this.toTicks(endPosition);
		}
	});

	/**
	 *  Set the loop start and stop at the same time. 
	 *  @param {Time} startPosition 
	 *  @param {Time} endPosition   
	 *  @returns {Tone.Transport} this
	 *  @example
	 * //loop over the first measure
	 * Tone.Transport.setLoopPoints(0, "1m");
	 * Tone.Transport.loop = true;
	 */
	Tone.Transport.prototype.setLoopPoints = function(startPosition, endPosition){
		this.loopStart = startPosition;
		this.loopEnd = endPosition;
		return this;
	};

	/**
	 *  The swing value. Between 0-1 where 1 equal to 
	 *  the note + half the subdivision.
	 *  @memberOf Tone.Transport#
	 *  @type {NormalRange}
	 *  @name swing
	 */
	Object.defineProperty(Tone.Transport.prototype, "swing", {
		get : function(){
			return this._swingAmount * 2;
		},
		set : function(amount){
			//scale the values to a normal range
			this._swingAmount = amount * 0.5;
		}
	});

	/**
	 *  Set the subdivision which the swing will be applied to. 
	 *  The default values is a 16th note. Value must be less 
	 *  than a quarter note.
	 *  
	 *  @memberOf Tone.Transport#
	 *  @type {Time}
	 *  @name swingSubdivision
	 */
	Object.defineProperty(Tone.Transport.prototype, "swingSubdivision", {
		get : function(){
			return this.toNotation(this._swingTicks + "i");
		},
		set : function(subdivision){
			this._swingTicks = this.toTicks(subdivision);
		}
	});

	/**
	 *  The Transport's position in MEASURES:BEATS:SIXTEENTHS.
	 *  Setting the value will jump to that position right away. 
	 *  
	 *  @memberOf Tone.Transport#
	 *  @type {TransportTime}
	 *  @name position
	 */
	Object.defineProperty(Tone.Transport.prototype, "position", {
		get : function(){
			var quarters = this.ticks / this._ppq;
			var measures = Math.floor(quarters / this._timeSignature);
			var sixteenths = ((quarters % 1) * 4);
			//if the sixteenths aren't a whole number, fix their length
			if (sixteenths % 1 > 0){
				sixteenths = sixteenths.toFixed(3);	
			}
			quarters = Math.floor(quarters) % this._timeSignature;
			var progress = [measures, quarters, sixteenths];
			return progress.join(":");
		},
		set : function(progress){
			var ticks = this.toTicks(progress);
			this.ticks = ticks;
		}
	});

	/**
	 *  The Transport's loop position as a normalized value. Always
	 *  returns 0 if the transport if loop is not true. 
	 *  @memberOf Tone.Transport#
	 *  @name progress
	 *  @type {NormalRange}
	 */
	Object.defineProperty(Tone.Transport.prototype, "progress", {
		get : function(){
			if (this.loop){
				return (this.ticks - this._loopStart) / (this._loopEnd - this._loopStart);
			} else {
				return 0;
			}
		}
	});

	/**
	 *  The transports current tick position.
	 *  
	 *  @memberOf Tone.Transport#
	 *  @type {Ticks}
	 *  @name ticks
	 */
	Object.defineProperty(Tone.Transport.prototype, "ticks", {
		get : function(){
			return this._clock.ticks;
		},
		set : function(t){
			this._clock.ticks = t;
		}
	});

	/**
	 *  Pulses Per Quarter note. This is the smallest resolution
	 *  the Transport timing supports. This should be set once
	 *  on initialization and not set again. Changing this value 
	 *  after other objects have been created can cause problems. 
	 *  
	 *  @memberOf Tone.Transport#
	 *  @type {Number}
	 *  @name PPQ
	 */
	Object.defineProperty(Tone.Transport.prototype, "PPQ", {
		get : function(){
			return this._ppq;
		},
		set : function(ppq){
			this._ppq = ppq;
			this.bpm.value = this.bpm.value;
		}
	});

	/**
	 *  Convert from BPM to frequency (factoring in PPQ)
	 *  @param  {BPM}  bpm The BPM value to convert to frequency
	 *  @return  {Frequency}  The BPM as a frequency with PPQ factored in.
	 *  @private
	 */
	Tone.Transport.prototype._fromUnits = function(bpm){
		return 1 / (60 / bpm / this.PPQ);
	};

	/**
	 *  Convert from frequency (with PPQ) into BPM
	 *  @param  {Frequency}  freq The clocks frequency to convert to BPM
	 *  @return  {BPM}  The frequency value as BPM.
	 *  @private
	 */
	Tone.Transport.prototype._toUnits = function(freq){
		return (freq / this.PPQ) * 60;
	};

	///////////////////////////////////////////////////////////////////////////////
	//	SYNCING
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  Attaches the signal to the tempo control signal so that 
	 *  any changes in the tempo will change the signal in the same
	 *  ratio. 
	 *  
	 *  @param  {Tone.Signal} signal 
	 *  @param {number=} ratio Optionally pass in the ratio between
	 *                         the two signals. Otherwise it will be computed
	 *                         based on their current values. 
	 *  @returns {Tone.Transport} this
	 */
	Tone.Transport.prototype.syncSignal = function(signal, ratio){
		if (!ratio){
			//get the sync ratio
			if (signal._param.value !== 0){
				ratio = signal._param.value / this.bpm._param.value;
			} else {
				ratio = 0;
			}
		}
		var ratioSignal = new Tone.Gain(ratio);
		this.bpm.chain(ratioSignal, signal._param);
		this._syncedSignals.push({
			"ratio" : ratioSignal,
			"signal" : signal,
			"initial" : signal._param.value
		});
		signal._param.value = 0;
		return this;
	};

	/**
	 *  Unsyncs a previously synced signal from the transport's control. 
	 *  See Tone.Transport.syncSignal.
	 *  @param  {Tone.Signal} signal 
	 *  @returns {Tone.Transport} this
	 */
	Tone.Transport.prototype.unsyncSignal = function(signal){
		for (var i = this._syncedSignals.length - 1; i >= 0; i--){
			var syncedSignal = this._syncedSignals[i];
			if (syncedSignal.signal === signal){
				syncedSignal.ratio.dispose();
				syncedSignal.signal._param.value = syncedSignal.initial;
				this._syncedSignals.splice(i, 1);
			}
		}
		return this;
	};

	/**
	 *  Clean up. 
	 *  @returns {Tone.Transport} this
	 *  @private
	 */
	Tone.Transport.prototype.dispose = function(){
		Tone.Emitter.prototype.dispose.call(this);
		this._clock.dispose();
		this._clock = null;
		this._writable("bpm");
		this.bpm = null;
		this._timeline.dispose();
		this._timeline = null;
		this._onceEvents.dispose();
		this._onceEvents = null;
		this._repeatedEvents.dispose();
		this._repeatedEvents = null;
		return this;
	};

	///////////////////////////////////////////////////////////////////////////////
	//	DEPRECATED FUNCTIONS
	//	(will be removed in r7)
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  @deprecated Use Tone.scheduleRepeat instead.
	 *  Set a callback for a recurring event.
	 *  @param {function} callback
	 *  @param {Time}   interval 
	 *  @return {number} the id of the interval
	 *  @example
	 *  //triggers a callback every 8th note with the exact time of the event
	 *  Tone.Transport.setInterval(function(time){
	 *  	envelope.triggerAttack(time);
	 *  }, "8n");
	 *  @private
	 */
	Tone.Transport.prototype.setInterval = function(callback, interval){
		console.warn("This method is deprecated. Use Tone.Transport.scheduleRepeat instead.");
		return Tone.Transport.scheduleRepeat(callback, interval);
	};

	/**
	 *  @deprecated Use Tone.cancel instead.
	 *  Stop and ongoing interval.
	 *  @param  {number} intervalID  The ID of interval to remove. The interval
	 *                               ID is given as the return value in Tone.Transport.setInterval.
	 *  @return {boolean}            	true if the event was removed
	 *  @private
	 */
	Tone.Transport.prototype.clearInterval = function(id){
		console.warn("This method is deprecated. Use Tone.Transport.clear instead.");
		return Tone.Transport.clear(id);
	};

	/**
	 *  @deprecated Use Tone.Note instead.
	 *  Set a timeout to occur after time from now. NB: the transport must be 
	 *  running for this to be triggered. All timeout events are cleared when the 
	 *  transport is stopped. 
	 *
	 *  @param {function} callback 
	 *  @param {Time}   time    The time (from now) that the callback will be invoked.
	 *  @return {number} The id of the timeout.
	 *  @example
	 *  //trigger an event to happen 1 second from now
	 *  Tone.Transport.setTimeout(function(time){
	 *  	player.start(time);
	 *  }, 1)
	 *  @private
	 */
	Tone.Transport.prototype.setTimeout = function(callback, timeout){
		console.warn("This method is deprecated. Use Tone.Transport.scheduleOnce instead.");
		return Tone.Transport.scheduleOnce(callback, timeout);
	};

	/**
	 *  @deprecated Use Tone.Note instead.
	 *  Clear a timeout using it's ID.
	 *  @param  {number} intervalID  The ID of timeout to remove. The timeout
	 *                               ID is given as the return value in Tone.Transport.setTimeout.
	 *  @return {boolean}           true if the timeout was removed
	 *  @private
	 */
	Tone.Transport.prototype.clearTimeout = function(id){
		console.warn("This method is deprecated. Use Tone.Transport.clear instead.");
		return Tone.Transport.clear(id);
	};

	/**
	 *  @deprecated Use Tone.Note instead.
	 *  Timeline events are synced to the timeline of the Tone.Transport.
	 *  Unlike Timeout, Timeline events will restart after the 
	 *  Tone.Transport has been stopped and restarted. 
	 *
	 *  @param {function} 	callback 	
	 *  @param {Time}  time  
	 *  @return {number} 				the id for clearing the transportTimeline event
	 *  @example
	 *  //trigger the start of a part on the 16th measure
	 *  Tone.Transport.setTimeline(function(time){
	 *  	part.start(time);
	 *  }, "16m");
	 *  @private
	 */
	Tone.Transport.prototype.setTimeline = function(callback, time){
		console.warn("This method is deprecated. Use Tone.Transport.schedule instead.");
		return Tone.Transport.schedule(callback, time);
	};

	/**
	 *  @deprecated Use Tone.Note instead.
	 *  Clear the timeline event.
	 *  @param  {number} id 
	 *  @return {boolean} true if it was removed
	 *  @private
	 */
	Tone.Transport.prototype.clearTimeline = function(id){
		console.warn("This method is deprecated. Use Tone.Transport.clear instead.");
		return Tone.Transport.clear(id);
	};

	///////////////////////////////////////////////////////////////////////////////
	//	INITIALIZATION
	///////////////////////////////////////////////////////////////////////////////

	var TransportConstructor = Tone.Transport;

	Tone._initAudioContext(function(){
		if (typeof Tone.Transport === "function"){
			//a single transport object
			Tone.Transport = new Tone.Transport();
		} else {
			//stop the clock
			Tone.Transport.stop();
			//get the previous values
			var prevSettings = Tone.Transport.get();
			//destory the old transport
			Tone.Transport.dispose();
			//make new Transport insides
			TransportConstructor.call(Tone.Transport);
			//set the previous config
			Tone.Transport.set(prevSettings);
		}
	});

	return Tone.Transport;
});
