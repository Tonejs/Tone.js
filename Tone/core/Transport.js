define(["Tone/core/Tone", "Tone/core/Clock", "Tone/signal/Signal", 
	"Tone/signal/Multiply", "Tone/core/Types", "Tone/core/EventEmitter"], 
function(Tone){

	"use strict";

	/**
	 *  @class  Oscillator-based transport allows for timing musical events.
	 *          Supports tempo curves and time changes. A single transport is created
	 *          on initialization. Unlike browser-based timing (setInterval, requestAnimationFrame)
	 *          Tone.Transport timing events pass in the exact time of the scheduled event
	 *          in the argument of the callback function. Pass that time value to the object
	 *          you're scheduling. <br><br>
	 *          A single transport is created for you when the library is initialized. 
	 *
	 *  @extends {Tone.EventEmitter}
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
		this._clock = new Tone.Clock(0, this._processTick.bind(this));
		this._clock.onended = this._onended.bind(this);

		/**
		 *  The Beats Per Minute of the Transport. 
		 *  @type {BPM}
		 *  @signal
		 *  @example
		 * Tone.Transport.bpm.value = 80;
		 * //ramp the bpm to 120 over 10 seconds
		 * Tone.Transport.bpm.rampTo(120, 10);
		 */
		this.bpm = new Tone.Signal(TransportConstructor.defaults.bpm, Tone.Type.BPM);

		/**
		 *  the signal scalar
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._bpmMult = new Tone.Multiply(1/60 * this._ppq);

		/**
		 *  The time signature, or more accurately the numerator
		 *  of the time signature over a denominator of 4. 
		 *  @type {Number}
		 *  @private
		 */
		this._timeSignature = TransportConstructor.defaults.timeSignature;

		//connect it all up
		this.bpm.chain(this._bpmMult, this._clock.frequency);

		///////////////////////////////////////////////////////////////////////
		//	TIMELINE EVENTS
		//////////////////////////////////////////////////////////////////////

		/**
		 * 	The scheduled events.
		 *  @type {Array}
		 *  @private
		 */
		this._timeline = [];

		/**
		 *  The current position along the scheduledEvents array. 
		 *  @type {Number}
		 *  @private
		 */
		this._timelinePosition = 0;

		/**
		 *  Repeated events
		 *  @type {Array}
		 *  @private
		 */
		this._repeatedEvents = [];

		/**
		 *  Events that occur once
		 *  @type {Array}
		 *  @private
		 */
		this._onceEvents = [];

		/**
		 *  The elapsed ticks. 
		 *  @type {Ticks}
		 *  @private
		 */
		this._ticks = 0;

		///////////////////////////////////////////////////////////////////////
		//	STATE TIMING
		//////////////////////////////////////////////////////////////////////

		/**
		 *  The next time the state is started.
		 *  @type {Number}
		 *  @private
		 */
		this._nextStart = Infinity;

		/**
		 *  The next time the state is stopped.
		 *  @type {Number}
		 *  @private
		 */
		this._nextStop = Infinity;

		/**
		 *  The next time the state is paused.
		 *  @type {Number}
		 *  @private
		 */
		this._nextPause = Infinity;

		///////////////////////////////////////////////////////////////////////
		//	SWING
		//////////////////////////////////////////////////////////////////////

		/**
		 *  The subdivision of the swing
		 *  @type  {Ticks}
		 *  @private
		 */
		this._swingTicks = this.toTicks(TransportConstructor.defaults.swingSubdivision, TransportConstructor.defaults.bpm, TransportConstructor.defaults.timeSignature);

		/**
		 *  The swing amount
		 *  @type {NormalRange}
		 *  @private
		 */
		this._swingAmount = 0;

	};

	Tone.extend(Tone.Transport, Tone.EventEmitter);

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

	/** 
	 *  All of the synced Signals
	 *  @private 
	 *  @type {Array}
	 */
	var SyncedSignals = [];

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
			this._ticks % this._ppq !== 0 && //not on a downbeat
			this._ticks % this._swingTicks === 0){
			//add some swing
			tickTime += this.ticksToSeconds(this._swingTicks) * this._swingAmount;
		}
		//fire the next tick events if their time has come
		for (var i = this._timelinePosition; i < this._timeline.length; i++){
			var evnt = this._timeline[i];
			if (evnt.tick <= this._ticks){
				this._timelinePosition++;
				if (evnt.tick === this._ticks){
					evnt.callback(tickTime);
				}
			} else if (evnt.tick > this._ticks){
				break;
			}
		}
		//process the repeated events
		for (var j = this._repeatedEvents.length - 1; j >= 0; j--) {
			var repeatEvnt = this._repeatedEvents[j];
			if (this._ticks >= repeatEvnt.startTick){
				if ((this._ticks - repeatEvnt.startTick) % repeatEvnt.interval === 0){
					repeatEvnt.callback(tickTime);
				}
			}
		}
		//process the single occurrence events
		while(this._onceEvents.length > 0 && this._onceEvents[0].tick > this._ticks){
			if (this._onceEvents[0].tick === this._ticks){
				this._onceEvents.shift().callback(tickTime);
			}
		}
		//increment the tick counter and check for loops
		this._ticks++;
		if (this.loop){
			if (this._ticks === this._loopEnd){
				this._setTicks(this._loopStart);
			}
		}
	};

	/**
	 *  jump to a specific tick in the timeline
	 *  updates the timeline callbacks
	 *  
	 *  @param   {number} ticks the tick to jump to
	 *  @private
	 */
	Tone.Transport.prototype._setTicks = function(ticks){
		this._ticks = ticks;
		for (var i = 0; i < this._timeline.length; i++){
			var evnt = this._timeline[i];
			if (evnt.tick >= ticks){
				this._timelinePosition = i;
				break;
			}
		}
	};

	///////////////////////////////////////////////////////////////////////////////
	//	SCHEDULE
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  Schedule an event along the timeline.
	 *  @param {TimelineEvent} event
	 *  @param {Time}   time 
	 *  @return {Number} The id of the event which can be used for canceling the event. 
	 *  @example
	 *  //trigger the callback when the Transport reaches the desired time
	 *  Tone.Transport.schedule(function(time){
	 *  	envelope.triggerAttack(time);
	 *  }, "128i");
	 */
	Tone.Transport.prototype.schedule = function(callback, time){
		var event = new TimelineEvent(callback, this.toTicks(time));
		//put it in the right spot
		for (var i = 0, len = this._timeline.length; i<len; i++){
			var testEvnt = this._timeline[i];
			if (testEvnt.tick > event.tick){
				this._timeline.splice(i, 0, event);
				return event;
			}
		}
		//otherwise push it on the end
		this._timeline.push(event);
		return event.id;
	};

	/**
	 *  Schedule a repeated event along the timeline.
	 *  @param  {Function}  callback   The callback to invoke.
	 *  @param  {Time}    interval   The duration between successive
	 *                               callbacks.
	 *  @param  {Time=}    startTime  When along the timeline the events should
	 *                               start being invoked.
	 *  @return  {Number}    The ID of the scheduled event. Use this to cancel
	 *                           the event. 
	 */
	Tone.Transport.prototype.scheduleRepeat = function(callback, interval, startTime){
		var event = new RepeatEvent(callback, this.toTicks(interval), this.toTicks(startTime));
		this._repeatedEvents.push(event);
		return event.id;
	};

	/**
	 *  Schedule an event that will be removed after it is invoked
	 */
	Tone.Transport.prototype.scheduleOnce = function(callback, time){
		var event = new TimelineEvent(callback, this.toTicks(time));
		//put it in the right spot
		for (var i = 0, len = this._onceEvents.length; i<len; i++){
			var testEvnt = this._onceEvents[i];
			if (testEvnt.tick > event.tick){
				this._onceEvents.splice(i, 0, event);
				return event;
			}
		}
		//otherwise push it on the end
		this._onceEvents.push(event);
		return event.id;
	};

	/**
	 *  Cancel the passed in event.
	 *  @param {TimelineEvent} event The event to cancel.
	 *  @returns {Boolean} true if the event was removed, false otherwise. 
	 */
	Tone.Transport.prototype.cancel = function(eventId){
		for (var i = 0; i < this._timeline.length; i++){
			if (this._timeline[i].id === eventId){
				this._timeline[i].callback = null;
				this._timeline.splice(i, 1);
				return true;
			}
		}
		for (var j = 0; j < this._repeatedEvents.length; j++){
			if (this._repeatedEvents[j].id === eventId){
				this._repeatedEvents[j].callback = null;
				this._repeatedEvents.splice(j, 1);
				return true;
			}
		}
		for (var k = 0; k < this._onceEvents.length; k++){
			if (this._onceEvents[k].id === eventId){
				this._onceEvents[k].callback = null;
				this._onceEvents.splice(k, 1);
				return true;
			}
		}
		return false;
	};

	/**
	 *  Remove scheduled events from the timeline after
	 *  the given time. Repeated events will be removed
	 *  if their startTime is after the given time
	 *  @param {Time} [after=0] Clear all events after
	 *                          this time. 
	 *  @returns {Tone.Transport} this
	 */
	Tone.Transport.prototype.clear = function(after){
		after = this.defaultArg(after, 0);
		after = this.toTicks(after);
		for (var i = 0, len = this._timeline.length; i<len; i++){
			var testEvnt = this._timeline[i];
			if (testEvnt.tick > after){
				this._timeline = this._timeline.slice(0, i);
				break;
			}
		}
		//remove all of the repeat events after the 
		return this;
	};

	/*
	 *  @static
	 *  @private
	 *  @type {Number}
	 */
	var EventIds = 0;

	/**
	 *  @class A Transport Event
	 */
	var TimelineEvent = function(callback, tick){
		//add this to the transport timeline
		this.id = EventIds++;
		this.callback = callback;
		this.tick = tick;
		this.stopTick = Infinity;
	};

	/**
	 *  @class A repeating event
	 */
	var RepeatEvent = function(callback, interval, startTick){
		//add this to the transport timeline
		this.id = EventIds++;
		this.callback = callback;
		this.startTick = startTick;
		this.interval = interval;
		this.stopTick = Infinity;
	};

	///////////////////////////////////////////////////////////////////////////////
	//	QUANTIZATION
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  Returns the time of the next beat.
	 *  @param  {string} [subdivision="4n"]
	 *  @return {number} 	the time in seconds of the next subdivision
	 */
	Tone.Transport.prototype.nextBeat = function(subdivision){
		subdivision = this.defaultArg(subdivision, "4n");
		var tickNum = this.toTicks(subdivision);
		var remainingTicks = (transportTicks % tickNum);
	};


	///////////////////////////////////////////////////////////////////////////////
	//	START/STOP/PAUSE
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  Returns the playback state of the source, either "started", "stopped", or "paused"
	 *  @type {String}
	 *  @readOnly
	 *  @memberOf Tone.State#
	 *  @name state
	 */
	Object.defineProperty(Tone.Transport.prototype, "state", {
		get : function(){
			return this._stateAtTime(this.now());
		}
	});

	/**
	 *  Get the state of the source at the specified time.
	 *  @param  {Time}  time
	 *  @return  {Tone.Transport} 
	 *  @private
	 */
	Tone.Transport.prototype._stateAtTime = function(time){
		if (this._nextStart <= time && this._nextStop > time && this._nextPause > time){
			return Tone.State.Started;
		} else if (this._nextStop <= time){
			return Tone.State.Stopped;
		} else if (this._nextPause <= time){
			return Tone.State.Paused;
		} else {
			return Tone.State.Stopped;
		}
	};

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
		if (this._stateAtTime(time) !== Tone.State.Started){
			this._nextStart = time;
			this._nextStop = Infinity;
			this._nextPause = Infinity;
			offset = this.defaultArg(offset, this._ticks);
			//set the offset
			this._setTicks(this.toTicks(offset));
			//call start on each of the synced structures
			// this.trigger("start", time, offset);
			//start the clock
			this._clock.start(time);
		}
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
		if (this._stateAtTime(time) !== Tone.State.Stopped){
			this._nextStop = time;
			this._clock.stop(time);
			//clear the tick events
			this.clear(time);
			// this.trigger("stop", time);
		} else {
			this._onended();
		}
		return this;
	};

	/**
	 *  invoked when the transport is stopped
	 *  @private
	 */
	Tone.Transport.prototype._onended = function(){
		this._setTicks(0);
	};

	/**
	 *  Pause the transport and all sources synced to the transport.
	 *  @param  {Time} [time=now]
	 *  @returns {Tone.Transport} this
	 */
	Tone.Transport.prototype.pause = function(time){
		time = this.toSeconds(time);
		if (this._stateAtTime(time) === Tone.State.Started){
			this._nextPause = time;
			this._clock.stop(time);
			// this.trigger("pause", time);
		}
		return this;
	};

	///////////////////////////////////////////////////////////////////////////////
	//	SETTERS/GETTERS
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  The time signature as just the numerator over 4. 
	 *  For example 4/4 would be just 4 and 6/8 would be 3.
	 *  @memberOf Tone.Transport#
	 *  @type {number}
	 *  @name timeSignature
	 *  @example
	 * //common time
	 * Tone.Transport.timeSignature = 4;
	 * // 7/8
	 * Tone.Transport.timeSignature = 3.5;
	 */
	Object.defineProperty(Tone.Transport.prototype, "timeSignature", {
		get : function(){
			return this._timeSignature;
		},
		set : function(timeSig){
			if (Array.isArray(timeSig)){
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
			var sixteenths = ((quarters % 1) * 4).toFixed(3);
			quarters = Math.floor(quarters) % this._timeSignature;
			var progress = [measures, quarters, sixteenths];
			return progress.join(":");
		},
		set : function(progress){
			var ticks = this.toTicks(progress);
			this._setTicks(ticks);
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
			return this._ticks;
		},
		set : function(t){
			//should also trigger whatever is on this tick
			this._setTicks(t);
			//clear everything after that tick
			//trigger a tick to get everyone on the same page
			// this._trigger("scrub", this._ticks);
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
		}
	});

	///////////////////////////////////////////////////////////////////////////////
	//	SYNCING
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  Sync a source to the transport so that 
	 *  @param  {Tone.Source} source the source to sync to the transport
	 *  @param {Time} delay (optionally) start the source with a delay from the transport
	 *  @returns {Tone.Transport} this
	 *  @example
	 * Tone.Transport.syncSource(player, "1m");
	 * Tone.Transport.start();
	 * //the player will start 1 measure after the transport starts
	 */
	Tone.Transport.prototype.syncStructure = function(struct){
		this._structures.push(struct);
		return this;
	};

	/**
	 *  Sync a source to the transport so that 
	 *  @param  {Tone.Source} source the source to sync to the transport
	 *  @param {Time} delay (optionally) start the source with a delay from the transport
	 *  @returns {Tone.Transport} this
	 *  @example
	 * Tone.Transport.syncSource(player, "1m");
	 * Tone.Transport.start();
	 * //the player will start 1 measure after the transport starts
	 */
	Tone.Transport.prototype.syncSource = function(source, startDelay){
		SyncedSources.push({
			source : source,
			delay : this.toSeconds(this.defaultArg(startDelay, 0))
		});
		return this;
	};

	/**
	 *  Unsync the source from the transport. See Tone.Transport.syncSource. 
	 *  
	 *  @param  {Tone.Source} source [description]
	 *  @returns {Tone.Transport} this
	 */
	Tone.Transport.prototype.unsyncSource = function(source){
		for (var i = 0; i < SyncedSources.length; i++){
			if (SyncedSources[i].source === source){
				SyncedSources.splice(i, 1);
			}
		}
		return this;
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
			if (signal._value.value !== 0){
				ratio = signal._value.value / this.bpm.value;
			} else {
				ratio = 0;
			}
		}
		var ratioSignal = this.context.createGain();
		ratioSignal.gain.value = ratio;
		this.bpm.chain(ratioSignal, signal._value);
		SyncedSignals.push({
			"ratio" : ratioSignal,
			"signal" : signal,
			"initial" : signal._value.value
		});
		signal._value.value = 0;
		return this;
	};

	/**
	 *  Unsyncs a previously synced signal from the transport's control. 
	 *  See Tone.Transport.syncSignal.
	 *  @param  {Tone.Signal} signal 
	 *  @returns {Tone.Transport} this
	 */
	Tone.Transport.prototype.unsyncSignal = function(signal){
		for (var i = 0; i < SyncedSignals.length; i++){
			var syncedSignal = SyncedSignals[i];
			if (syncedSignal.signal === signal){
				syncedSignal.ratio.disconnect();
				syncedSignal.signal._value.value = syncedSignal.initial;
				SyncedSignals.splice(i, 1);
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
		this._clock.dispose();
		this._clock = null;
		this.bpm.dispose();
		this.bpm = null;
		this._bpmMult.dispose();
		this._bpmMult = null;
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
	 */
	Tone.Transport.prototype.clearInterval = function(id){
		console.warn("This method is deprecated. Use Tone.Transport.cancel instead.");
		return Tone.Transport.cancel(id);
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
	 */
	Tone.Transport.prototype.clearTimeout = function(id){
		console.warn("This method is deprecated. Use Tone.Transport.cancel instead.");
		return Tone.Transport.cancel(id);
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
	 */
	Tone.Transport.prototype.clearTimeline = function(id){
		console.warn("This method is deprecated. Use Tone.Transport.cancel instead.");
		return Tone.Transport.cancel(id);
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
