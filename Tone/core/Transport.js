define(["Tone/core/Tone", "Tone/core/Clock", "Tone/type/Type", "Tone/core/Timeline", 
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
	 * Tone.Transport.scheduleRepeat(function(time){
	 * 	//do something with the time
	 * }, "8n");
	 *  @example
	 * //schedule an event on the 16th measure
	 * Tone.Transport.schedule(function(time){
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

		this._bindClockEvents();

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

		/**
		 *  The subdivision of the swing
		 *  @type  {Ticks}
		 *  @private
		 */
		this._swingTicks = TransportConstructor.defaults.PPQ / 2; //8n

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
		"swingSubdivision" : "8n",
		"timeSignature" : 4,
		"loopStart" : 0,
		"loopEnd" : "4m",
		"PPQ" : 192
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
		var ticks = this._clock.ticks;
		//handle swing
		if (this._swingAmount > 0 && 
			ticks % this._ppq !== 0 && //not on a downbeat
			ticks % (this._swingTicks * 2) !== 0){
			//add some swing
			var progress = (ticks % (this._swingTicks * 2)) / (this._swingTicks * 2);
			var amount = Math.sin((progress) * Math.PI) * this._swingAmount;
			tickTime += Tone.Time(this._swingTicks * 2/3, "i").eval() * amount;
		} 
		//do the loop test
		if (this.loop){
			if (ticks === this._loopEnd){
				this.emit("loopEnd", tickTime);
				this._clock.ticks = this._loopStart;
				ticks = this._loopStart;
				this.emit("loopStart", tickTime, this.seconds);
				this.emit("loop", tickTime);
			}
		}
		//process the single occurrence events
		this._onceEvents.forEachBefore(ticks, function(event){
			event.callback(tickTime);
			//remove the event
			delete this._scheduledEvents[event.id.toString()];
		}.bind(this));
		//and clear the single occurrence timeline
		this._onceEvents.cancelBefore(ticks);
		//fire the next tick events if their time has come
		this._timeline.forEachAtTime(ticks, function(event){
			event.callback(tickTime);
		});
		//process the repeated events
		this._repeatedEvents.forEachAtTime(ticks, function(event){
			if ((ticks - event.time) % event.interval === 0){
				event.callback(tickTime);
			}
		});
	};

	///////////////////////////////////////////////////////////////////////////////
	//	SCHEDULABLE EVENTS
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  Schedule an event along the timeline.
	 *  @param {Function} callback The callback to be invoked at the time.
	 *  @param {TransportTime}  time The time to invoke the callback at.
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
		this._timeline.add(event);
		return id;
	};

	/**
	 *  Schedule a repeated event along the timeline. The event will fire
	 *  at the `interval` starting at the `startTime` and for the specified
	 *  `duration`. 
	 *  @param  {Function}  callback   The callback to invoke.
	 *  @param  {Time}    interval   The duration between successive
	 *                               callbacks.
	 *  @param  {TimelinePosition=}    startTime  When along the timeline the events should
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
			throw new Error("Tone.Transport: repeat events must have an interval larger than 0");
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
		this._repeatedEvents.add(event);
		return id;
	};

	/**
	 *  Schedule an event that will be removed after it is invoked. 
	 *  Note that if the given time is less than the current transport time, 
	 *  the event will be invoked immediately. 
	 *  @param {Function} callback The callback to invoke once.
	 *  @param {TransportTime} time The time the callback should be invoked.
	 *  @returns {Number} The ID of the scheduled event. 
	 */
	Tone.Transport.prototype.scheduleOnce = function(callback, time){
		var id = this._eventID++;
		var event = {
			"time" : this.toTicks(time),
			"callback" : callback,
			"id" : id
		};
		this._scheduledEvents[id.toString()] = {
			"event" : event,
			"timeline" : this._onceEvents
		};
		this._onceEvents.add(event);
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
			item.timeline.remove(item.event);
			delete this._scheduledEvents[eventId.toString()];
		}
		return this;
	};

	/**
	 *  Remove scheduled events from the timeline after
	 *  the given time. Repeated events will be removed
	 *  if their startTime is after the given time
	 *  @param {TransportTime} [after=0] Clear all events after
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
	//	START/STOP/PAUSE
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  Bind start/stop/pause events from the clock and emit them.
	 */
	Tone.Transport.prototype._bindClockEvents = function(){
		this._clock.on("start", function(time, offset){
			offset = Tone.Time(this._clock.ticks, "i").toSeconds();
			this.emit("start", time, offset);
		}.bind(this));

		this._clock.on("stop", function(time){
			this.emit("stop", time);
		}.bind(this));

		this._clock.on("pause", function(time){
			this.emit("pause", time);
		}.bind(this));
	};

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
	 *  @param  {TransportTime=} offset The timeline offset to start the transport.
	 *  @returns {Tone.Transport} this
	 *  @example
	 * //start the transport in one second starting at beginning of the 5th measure. 
	 * Tone.Transport.start("+1", "4:0:0");
	 */
	Tone.Transport.prototype.start = function(time, offset){
		//start the clock
		if (!this.isUndef(offset)){
			offset = this.toTicks(offset);
		}
		this._clock.start(time, offset);
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
		this._clock.stop(time);
		return this;
	};

	/**
	 *  Pause the transport and all sources synced to the transport.
	 *  @param  {Time} [time=now]
	 *  @returns {Tone.Transport} this
	 */
	Tone.Transport.prototype.pause = function(time){
		this._clock.pause(time);
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
	 * @type {TransportTime}
	 * @name loopStart
	 */
	Object.defineProperty(Tone.Transport.prototype, "loopStart", {
		get : function(){
			return Tone.TransportTime(this._loopStart, "i").toSeconds();
		},
		set : function(startPosition){
			this._loopStart = this.toTicks(startPosition);
		}
	});

	/**
	 * When the Tone.Transport.loop = true, this is the ending position of the loop.
	 * @memberOf Tone.Transport#
	 * @type {TransportTime}
	 * @name loopEnd
	 */
	Object.defineProperty(Tone.Transport.prototype, "loopEnd", {
		get : function(){
			return Tone.TransportTime(this._loopEnd, "i").toSeconds();
		},
		set : function(endPosition){
			this._loopEnd = this.toTicks(endPosition);
		}
	});

	/**
	 *  Set the loop start and stop at the same time. 
	 *  @param {TransportTime} startPosition 
	 *  @param {TransportTime} endPosition   
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
			return this._swingAmount;
		},
		set : function(amount){
			//scale the values to a normal range
			this._swingAmount = amount;
		}
	});

	/**
	 *  Set the subdivision which the swing will be applied to. 
	 *  The default value is an 8th note. Value must be less 
	 *  than a quarter note.
	 *  
	 *  @memberOf Tone.Transport#
	 *  @type {Time}
	 *  @name swingSubdivision
	 */
	Object.defineProperty(Tone.Transport.prototype, "swingSubdivision", {
		get : function(){
			return Tone.Time(this._swingTicks, "i").toNotation();
		},
		set : function(subdivision){
			this._swingTicks = this.toTicks(subdivision);
		}
	});

	/**
	 *  The Transport's position in Bars:Beats:Sixteenths.
	 *  Setting the value will jump to that position right away. 
	 *  @memberOf Tone.Transport#
	 *  @type {BarsBeatsSixteenths}
	 *  @name position
	 */
	Object.defineProperty(Tone.Transport.prototype, "position", {
		get : function(){
			return Tone.TransportTime(this.ticks, "i").toBarsBeatsSixteenths();
		},
		set : function(progress){
			var ticks = this.toTicks(progress);
			this.ticks = ticks;
		}
	});

	/**
	 *  The Transport's position in seconds
	 *  Setting the value will jump to that position right away. 
	 *  @memberOf Tone.Transport#
	 *  @type {Seconds}
	 *  @name seconds
	 */
	Object.defineProperty(Tone.Transport.prototype, "seconds", {
		get : function(){
			return Tone.TransportTime(this.ticks, "i").toSeconds();
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
			var now = this.now();
			//stop everything synced to the transport
			if (this.state === Tone.State.Started){
				this.emit("stop", now);
				this._clock.ticks = t;
				//restart it with the new time
				this.emit("start", now, this.seconds);
			} else {
				this._clock.ticks = t;
			}
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
			var bpm = this.bpm.value;
			this._ppq = ppq;
			this.bpm.value = bpm;
		}
	});

	/**
	 *  The hint to the type of playback. Affects tradeoffs between audio 
	 *  output latency and responsiveness. 
	 *  
	 *  In addition to setting the value in seconds, the latencyHint also
	 *  accepts the strings "interactive" (prioritizes low latency), 
	 *  "playback" (prioritizes sustained playback), "balanced" (balances
	 *  latency and performance), and "fastest" (lowest latency, might glitch more often). 
	 *  @memberOf Tone.Transport#
	 *  @type {Seconds|String}
	 *  @name latencyHint
	 */
	Object.defineProperty(Tone.Transport.prototype, "latencyHint", {
		get : function(){
			return Tone.Clock.latencyHint;
		},
		set : function(hint){
			Tone.Clock.latencyHint = hint;
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
	 *  Returns the time aligned to the next subdivision
	 *  of the Transport. If the Transport is not started,
	 *  it will return 0.
	 *  Note: this will not work precisely during tempo ramps.
	 *  @param  {Time}  subdivision  The subdivision to quantize to
	 *  @return  {Number}  The context time of the next subdivision.
	 *  @example
	 * Tone.Transport.start(); //the transport must be started
	 * Tone.Transport.nextSubdivision("4n");
	 */
	Tone.Transport.prototype.nextSubdivision = function(subdivision){
		subdivision = this.toSeconds(subdivision);
		//if the transport's not started, return 0
		var now;
		if (this.state === Tone.State.Started){
			now = this._clock._nextTick;
		} else {
			return 0;
		}
		var transportPos = Tone.Time(this.ticks, "i").eval();
		var remainingTime = subdivision - (transportPos % subdivision);
		if (remainingTime === 0){
			remainingTime = subdivision;
		}
		return now + remainingTime;
	};

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
