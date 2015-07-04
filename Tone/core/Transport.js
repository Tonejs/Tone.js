define(["Tone/core/Tone", "Tone/core/Clock", "Tone/signal/Signal", "Tone/signal/Multiply"], 
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
	 *  @extends {Tone}
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

		/**
		 *  watches the main oscillator for timing ticks
		 *  initially starts at 120bpm
		 *  
		 *  @private
		 *  @type {Tone.Clock}
		 */
		this._clock = new Tone.Clock(0, this._processTick.bind(this));
		this._clock.onended = this._onended.bind(this);

		/** 
		 * 	If the transport loops or not.
		 *  @type {boolean}
		 */
		this.loop = false;

		/**
		 *  The Beats Per Minute of the Transport. 
		 *  @type {BPM}
		 *  @signal
		 *  @example
		 * Tone.Transport.bpm.value = 80;
		 * //ramp the bpm to 120 over 10 seconds
		 * Tone.Transport.bpm.rampTo(120, 10);
		 */
		this.bpm = new Tone.Signal(120, Tone.Type.BPM);

		/**
		 *  the signal scalar
		 *  @type {Tone.Multiply}
		 *  @private
		 */
		this._bpmMult = new Tone.Multiply(1/60 * tatum);

		/**
		 * 	The state of the transport. READ ONLY. 
		 *  @type {Tone.State}
		 */
		this.state = Tone.State.Stopped;

		//connect it all up
		this.bpm.chain(this._bpmMult, this._clock.frequency);
	};

	Tone.extend(Tone.Transport);

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
		"loopEnd" : "4m"
	};

	/** 
	 * @private
	 * @type {number}
	 */
	var tatum = 12;

	/** 
	 * @private 
	 * @type {number} 
	 */
	var timelineTicks = 0;

	/** 
	 * @private 
	 * @type {number} 
	 */
	var transportTicks = 0;

	/**
	 *  Which subdivision the swing is applied to.
	 *  defaults to an 16th note
	 *  @private
	 *  @type {number}
	 */
	var swingSubdivision = "16n";

	/**
	 *  controls which beat the swing is applied to
	 *  defaults to an 16th note
	 *  @private
	 *  @type {number}
	 */
	var swingTatum = 3;

	/**
	 *  controls which beat the swing is applied to
	 *  @private
	 *  @type {number}
	 */
	var swingAmount = 0;

	/** 
	 * @private
	 * @type {number}
	 */
	var transportTimeSignature = 4;

	/** 
	 * @private
	 * @type {number}
	 */
	var loopStart = 0;

	/** 
	 * @private
	 * @type {number}
	 */
	var loopEnd = tatum * 4;

	/** 
	 * @private
	 * @type {Array}
	 */
	var intervals = [];
	
	/** 
	 * @private
	 * @type {Array}
	 */
	var timeouts = [];
	
	/** 
	 * @private
	 * @type {Array}
	 */
	var transportTimeline = [];
	
	/** 
	 * @private
	 * @type {number}
	 */
	var timelineProgress = 0;

	/** 
	 *  All of the synced components
	 *  @private 
	 *  @type {Array}
	 */
	var SyncedSources = [];

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
		if (this.state === Tone.State.Started){
			if (swingAmount > 0 && 
				timelineTicks % tatum !== 0 && //not on a downbeat
				timelineTicks % swingTatum === 0){
				//add some swing
				tickTime += this._ticksToSeconds(swingTatum) * swingAmount;
			}
			processIntervals(tickTime);
			processTimeouts(tickTime);
			processTimeline(tickTime);
			transportTicks += 1;
			timelineTicks += 1;
			if (this.loop){
				if (timelineTicks === loopEnd){
					this._setTicks(loopStart);
				}
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
		timelineTicks = ticks;
		for (var i = 0; i < transportTimeline.length; i++){
			var timeout = transportTimeline[i];
			if (timeout.callbackTick() >= ticks){
				timelineProgress = i;
				break;
			}
		}
	};

	///////////////////////////////////////////////////////////////////////////////
	//	EVENT PROCESSING
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  process the intervals
	 *  @param  {number} time 
	 */
	var processIntervals = function(time){
		for (var i = 0, len = intervals.length; i<len; i++){
			var interval = intervals[i];
			if (interval.testInterval(transportTicks)){
				interval.doCallback(time);
			}
		}
	};

	/**
	 *  process the timeouts
	 *  @param  {number} time 
	 */
	var processTimeouts = function(time){
		var removeTimeouts = 0;
		for (var i = 0, len = timeouts.length; i<len; i++){
			var timeout = timeouts[i];
			var callbackTick = timeout.callbackTick();
			if (callbackTick <= transportTicks){
				timeout.doCallback(time);
				removeTimeouts++;
			} else if (callbackTick > transportTicks){
				break;
			} 
		}
		//remove the timeouts off the front of the array after they've been called
		timeouts.splice(0, removeTimeouts);
	};

	/**
	 *  process the transportTimeline events
	 *  @param  {number} time 
	 */
	var processTimeline = function(time){
		for (var i = timelineProgress, len = transportTimeline.length; i<len; i++){
			var evnt = transportTimeline[i];
			var callbackTick = evnt.callbackTick();
			if (callbackTick === timelineTicks){
				timelineProgress = i;
				evnt.doCallback(time);
			} else if (callbackTick > timelineTicks){
				break;
			} 
		}
	};

	///////////////////////////////////////////////////////////////////////////////
	//	INTERVAL
	///////////////////////////////////////////////////////////////////////////////

	/**
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
	Tone.Transport.prototype.setInterval = function(callback, interval, ctx){
		var tickTime = this._toTicks(interval);
		var timeout = new TimelineEvent(callback, ctx, tickTime, transportTicks);
		intervals.push(timeout);
		return timeout.id;
	};

	/**
	 *  Stop and ongoing interval.
	 *  @param  {number} intervalID  The ID of interval to remove. The interval
	 *                               ID is given as the return value in Tone.Transport.setInterval.
	 *  @return {boolean}            	true if the event was removed
	 */
	Tone.Transport.prototype.clearInterval = function(rmInterval){
		for (var i = 0; i < intervals.length; i++){
			var interval = intervals[i];
			if (interval.id === rmInterval){
				intervals.splice(i, 1);
				return true;
			}
		}
		return false;
	};

	/**
	 *  Removes all of the intervals that are currently set. 
	 *  @return {boolean}            	true if the event was removed
	 */
	Tone.Transport.prototype.clearIntervals = function(){
		var willRemove = intervals.length > 0;
		intervals = [];
		return willRemove;
	};

	///////////////////////////////////////////////////////////////////////////////
	//	TIMEOUT
	///////////////////////////////////////////////////////////////////////////////

	/**
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
	Tone.Transport.prototype.setTimeout = function(callback, time, ctx){
		var ticks = this._toTicks(time);
		var timeout = new TimelineEvent(callback, ctx, ticks + transportTicks, 0);
		//put it in the right spot
		for (var i = 0, len = timeouts.length; i<len; i++){
			var testEvnt = timeouts[i];
			if (testEvnt.callbackTick() > timeout.callbackTick()){
				timeouts.splice(i, 0, timeout);
				return timeout.id;
			}
		}
		//otherwise push it on the end
		timeouts.push(timeout);
		return timeout.id;
	};

	/**
	 *  Clear a timeout using it's ID.
	 *  @param  {number} intervalID  The ID of timeout to remove. The timeout
	 *                               ID is given as the return value in Tone.Transport.setTimeout.
	 *  @return {boolean}           true if the timeout was removed
	 */
	Tone.Transport.prototype.clearTimeout = function(timeoutID){
		for (var i = 0; i < timeouts.length; i++){
			var testTimeout = timeouts[i];
			if (testTimeout.id === timeoutID){
				timeouts.splice(i, 1);
				return true;
			}
		}
		return false;
	};

	/**
	 *  Removes all of the timeouts that are currently set. 
	 *  @return {boolean}            	true if the event was removed
	 */
	Tone.Transport.prototype.clearTimeouts = function(){
		var willRemove = timeouts.length > 0;
		timeouts = [];
		return willRemove;
	};

	///////////////////////////////////////////////////////////////////////////////
	//	TIMELINE
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  Timeline events are synced to the timeline of the Tone.Transport.
	 *  Unlike Timeout, Timeline events will restart after the 
	 *  Tone.Transport has been stopped and restarted. 
	 *
	 *  @param {function} 	callback 	
	 *  @param {Tome.Time}  timeout  
	 *  @return {number} 				the id for clearing the transportTimeline event
	 *  @example
	 *  //trigger the start of a part on the 16th measure
	 *  Tone.Transport.setTimeline(function(time){
	 *  	part.start(time);
	 *  }, "16m");
	 */
	Tone.Transport.prototype.setTimeline = function(callback, timeout, ctx){
		var ticks = this._toTicks(timeout);
		var timelineEvnt = new TimelineEvent(callback, ctx, ticks, 0);
		//put it in the right spot
		for (var i = timelineProgress, len = transportTimeline.length; i<len; i++){
			var testEvnt = transportTimeline[i];
			if (testEvnt.callbackTick() > timelineEvnt.callbackTick()){
				transportTimeline.splice(i, 0, timelineEvnt);
				return timelineEvnt.id;
			}
		}
		//otherwise push it on the end
		transportTimeline.push(timelineEvnt);
		return timelineEvnt.id;
	};

	/**
	 *  Clear the timeline event.
	 *  @param  {number} timelineID 
	 *  @return {boolean} true if it was removed
	 */
	Tone.Transport.prototype.clearTimeline = function(timelineID){
		for (var i = 0; i < transportTimeline.length; i++){
			var testTimeline = transportTimeline[i];
			if (testTimeline.id === timelineID){
				transportTimeline.splice(i, 1);
				return true;
			}
		}
		return false;
	};

	/**
	 *  Remove all events from the timeline.
	 *  @returns {boolean} true if the events were removed
	 */
	Tone.Transport.prototype.clearTimelines = function(){
		timelineProgress = 0;
		var willRemove = transportTimeline.length > 0;
		transportTimeline = [];
		return willRemove;
	};

	///////////////////////////////////////////////////////////////////////////////
	//	TIME CONVERSIONS
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  turns the time into
	 *  @param  {Time} time
	 *  @return {number}   
	 *  @private   
	 */
	Tone.Transport.prototype._toTicks = function(time){
		//get the seconds
		var seconds = this.toSeconds(time);
		var quarter = this.notationToSeconds("4n");
		var quarters = seconds / quarter;
		var tickNum = quarters * tatum;
		//quantize to tick value
		return Math.round(tickNum);
	};

	/**
	 *  convert ticks into seconds
	 *  
	 *  @param  {number} ticks 
	 *  @param {number=} bpm 
	 *  @param {number=} timeSignature
	 *  @return {number}               seconds
	 *  @private
	 */
	Tone.Transport.prototype._ticksToSeconds = function(ticks, bpm, timeSignature){
		ticks = Math.floor(ticks);
		var quater = this.notationToSeconds("4n", bpm, timeSignature);
		return (quater * ticks) / (tatum);
	};

	/**
	 *  Returns the time of the next beat.
	 *  @param  {string} [subdivision="4n"]
	 *  @return {number} 	the time in seconds of the next subdivision
	 */
	Tone.Transport.prototype.nextBeat = function(subdivision){
		subdivision = this.defaultArg(subdivision, "4n");
		var tickNum = this._toTicks(subdivision);
		var remainingTicks = (transportTicks % tickNum);
		var nextTick = remainingTicks;
		if (remainingTicks > 0){
			nextTick = tickNum - remainingTicks;
		}
		return this._ticksToSeconds(nextTick);
	};


	///////////////////////////////////////////////////////////////////////////////
	//	START/STOP/PAUSE
	///////////////////////////////////////////////////////////////////////////////

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
		if (this.state === Tone.State.Stopped || this.state === Tone.State.Paused){
			if (!this.isUndef(offset)){
				this._setTicks(this._toTicks(offset));
			}
			this.state = Tone.State.Started;
			var startTime = this.toSeconds(time);
			this._clock.start(startTime);
			//call start on each of the synced sources
			for (var i = 0; i < SyncedSources.length; i++){
				var source = SyncedSources[i].source;
				var delay = SyncedSources[i].delay;
				source.start(startTime + delay);
			}
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
		if (this.state === Tone.State.Started || this.state === Tone.State.Paused){
			var stopTime = this.toSeconds(time);
			this._clock.stop(stopTime);
			//call start on each of the synced sources
			for (var i = 0; i < SyncedSources.length; i++){
				var source = SyncedSources[i].source;
				source.stop(stopTime);
			}
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
		transportTicks = 0;
		this._setTicks(0);
		this.clearTimeouts();
		this.state = Tone.State.Stopped;
	};

	/**
	 *  Pause the transport and all sources synced to the transport.
	 *  @param  {Time} [time=now]
	 *  @returns {Tone.Transport} this
	 */
	Tone.Transport.prototype.pause = function(time){
		if (this.state === Tone.State.Started){
			this.state = Tone.State.Paused;
			var stopTime = this.toSeconds(time);
			this._clock.stop(stopTime);
			//call pause on each of the synced sources
			for (var i = 0; i < SyncedSources.length; i++){
				var source = SyncedSources[i].source;
				source.pause(stopTime);
			}
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
			return transportTimeSignature;
		},
		set : function(numerator){
			transportTimeSignature = numerator;
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
			return this._ticksToSeconds(loopStart);
		},
		set : function(startPosition){
			loopStart = this._toTicks(startPosition);
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
			return this._ticksToSeconds(loopEnd);
		},
		set : function(endPosition){
			loopEnd = this._toTicks(endPosition);
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
			return swingAmount * 2;
		},
		set : function(amount){
			//scale the values to a normal range
			swingAmount = amount * 0.5;
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
			return swingSubdivision;
		},
		set : function(subdivision){
			//scale the values to a normal range
			swingSubdivision = subdivision;
			swingTatum = this._toTicks(subdivision);
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
			var quarters = timelineTicks / tatum;
			var measures = Math.floor(quarters / transportTimeSignature);
			var sixteenths = Math.floor((quarters % 1) * 4);
			quarters = Math.floor(quarters) % transportTimeSignature;
			var progress = [measures, quarters, sixteenths];
			return progress.join(":");
		},
		set : function(progress){
			var ticks = this._toTicks(progress);
			this._setTicks(ticks);
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
	//	TIMELINE EVENT
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  @static
	 *  @type {number}
	 */
	var TimelineEventIDCounter = 0;

	/**
	 *  A Timeline event
	 *
	 *  @constructor
	 *  @private
	 *  @param {function(number)} callback   
	 *  @param {Object}   context    
	 *  @param {number}   tickTime
 	 *  @param {number}   startTicks
	 */
	var TimelineEvent = function(callback, context, tickTime, startTicks){
		this.startTicks = startTicks;
		this.tickTime = tickTime;
		this.callback = callback;
		this.context = context;
		this.id = TimelineEventIDCounter++;
	};
	
	/**
	 *  invoke the callback in the correct context
	 *  passes in the playback time
	 *  
	 *  @param  {number} playbackTime 
	 */
	TimelineEvent.prototype.doCallback = function(playbackTime){
		this.callback.call(this.context, playbackTime); 
	};

	/**
	 *  get the tick which the callback is supposed to occur on
	 *  
	 *  @return {number} 
	 */
	TimelineEvent.prototype.callbackTick = function(){
		return this.startTicks + this.tickTime;
	};

	/**
	 *  test if the tick occurs on the interval
	 *  
	 *  @param  {number} tick 
	 *  @return {boolean}      
	 */
	TimelineEvent.prototype.testInterval = function(tick){
		return (tick - this.startTicks) % this.tickTime === 0;
	};


	///////////////////////////////////////////////////////////////////////////////
	//	AUGMENT TONE'S PROTOTYPE TO INCLUDE TRANSPORT TIMING
	///////////////////////////////////////////////////////////////////////////////

	/**
	 *  tests if a string is musical notation
	 *  i.e.:
	 *  	4n = quarter note
	 *   	2m = two measures
	 *    	8t = eighth-note triplet
	 *  
	 *  @return {boolean} 
	 *  @method isNotation
	 *  @lends Tone.prototype.isNotation
	 */
	Tone.prototype.isNotation = (function(){
		var notationFormat = new RegExp(/[0-9]+[mnt]$/i);
		return function(note){
			return notationFormat.test(note);
		};
	})();

	/**
	 *  tests if a string is transportTime
	 *  i.e. :
	 *  	1:2:0 = 1 measure + two quarter notes + 0 sixteenth notes
	 *  	
	 *  @return {boolean} 
	 *
	 *  @method isTransportTime
	 *  @lends Tone.prototype.isTransportTime
	 */
	Tone.prototype.isTransportTime = (function(){
		var transportTimeFormat = new RegExp(/^\d+(\.\d+)?:\d+(\.\d+)?(:\d+(\.\d+)?)?$/i);
		return function(transportTime){
			return transportTimeFormat.test(transportTime);
		};
	})();

	/**
	 *
	 *  convert notation format strings to seconds
	 *  
	 *  @param  {string} notation     
	 *  @param {number=} bpm 
	 *  @param {number=} timeSignature 
	 *  @return {number} 
	 *                
	 */
	Tone.prototype.notationToSeconds = function(notation, bpm, timeSignature){
		bpm = this.defaultArg(bpm, Tone.Transport.bpm.value);
		timeSignature = this.defaultArg(timeSignature, transportTimeSignature);
		var beatTime = (60 / bpm);
		var subdivision = parseInt(notation, 10);
		var beats = 0;
		if (subdivision === 0){
			beats = 0;
		}
		var lastLetter = notation.slice(-1);
		if (lastLetter === "t"){
			beats = (4 / subdivision) * 2/3;
		} else if (lastLetter === "n"){
			beats = 4 / subdivision;
		} else if (lastLetter === "m"){
			beats = subdivision * timeSignature;
		} else {
			beats = 0;
		}
		return beatTime * beats;
	};

	/**
	 *  convert transportTime into seconds.
	 *  
	 *  ie: 4:2:3 == 4 measures + 2 quarters + 3 sixteenths
	 *
	 *  @param  {string} transportTime 
	 *  @param {number=} bpm 
	 *  @param {number=} timeSignature
	 *  @return {number}               seconds
	 *
	 *  @lends Tone.prototype.transportTimeToSeconds
	 */
	Tone.prototype.transportTimeToSeconds = function(transportTime, bpm, timeSignature){
		bpm = this.defaultArg(bpm, Tone.Transport.bpm.value);
		timeSignature = this.defaultArg(timeSignature, transportTimeSignature);
		var measures = 0;
		var quarters = 0;
		var sixteenths = 0;
		var split = transportTime.split(":");
		if (split.length === 2){
			measures = parseFloat(split[0]);
			quarters = parseFloat(split[1]);
		} else if (split.length === 1){
			quarters = parseFloat(split[0]);
		} else if (split.length === 3){
			measures = parseFloat(split[0]);
			quarters = parseFloat(split[1]);
			sixteenths = parseFloat(split[2]);
		}
		var beats = (measures * timeSignature + quarters + sixteenths / 4);
		return beats * this.notationToSeconds("4n");
	};

	/**
	 *  Convert seconds to the closest transportTime in the form 
	 *  	measures:quarters:sixteenths
	 *
	 *  @method toTransportTime
	 *  
	 *  @param {Time} seconds 
	 *  @param {number=} bpm 
	 *  @param {number=} timeSignature
	 *  @return {string}  
	 *  
	 *  @lends Tone.prototype.toTransportTime
	 */
	Tone.prototype.toTransportTime = function(time, bpm, timeSignature){
		var seconds = this.toSeconds(time, bpm, timeSignature);
		bpm = this.defaultArg(bpm, Tone.Transport.bpm.value);
		timeSignature = this.defaultArg(timeSignature, transportTimeSignature);
		var quarterTime = this.notationToSeconds("4n");
		var quarters = seconds / quarterTime;
		var measures = Math.floor(quarters / timeSignature);
		var sixteenths = Math.floor((quarters % 1) * 4);
		quarters = Math.floor(quarters) % timeSignature;
		var progress = [measures, quarters, sixteenths];
		return progress.join(":");
	};

	/**
	 *  Convert a frequency representation into a number.
	 *  	
	 *  @param  {Frequency} freq 
	 *  @param {number=} 	now 	if passed in, this number will be 
	 *                        		used for all 'now' relative timings
	 *  @return {number}      the frequency in hertz
	 */
	Tone.prototype.toFrequency = function(freq, now){
		if (this.isFrequency(freq)){
			return parseFloat(freq);
		} else if (this.isNotation(freq) || this.isTransportTime(freq)) {
			return this.secondsToFrequency(this.toSeconds(freq, now));
		} else {
			return freq;
		}
	};

	/**
	 *  Convert Time into seconds.
	 *  
	 *  Unlike the method which it overrides, this takes into account 
	 *  transporttime and musical notation.
	 *
	 *  Time : 1.40
	 *  Notation: 4n|1m|2t
	 *  TransportTime: 2:4:1 (measure:quarters:sixteens)
	 *  Now Relative: +3n
	 *  Math: 3n+16n or even very complicated expressions ((3n*2)/6 + 1)
	 *
	 *  @override
	 *  @param  {Time} time       
	 *  @param {number=} 	now 	if passed in, this number will be 
	 *                        		used for all 'now' relative timings
	 *  @return {number} 
	 */
	Tone.prototype.toSeconds = function(time, now){
		now = this.defaultArg(now, this.now());
		if (typeof time === "number"){
			return time; //assuming that it's seconds
		} else if (typeof time === "string"){
			var plusTime = 0;
			if(time.charAt(0) === "+") {
				plusTime = now;
				time = time.slice(1);
			} 
			var components = time.split(/[\(\)\-\+\/\*]/);
			if (components.length > 1){
				var originalTime = time;
				for(var i = 0; i < components.length; i++){
					var symb = components[i].trim();
					if (symb !== ""){
						var val = this.toSeconds(symb);
						time = time.replace(symb, val);
					}
				}
				try {
					//i know eval is evil, but i think it's safe here
					time = eval(time); // jshint ignore:line
				} catch (e){
					throw new EvalError("problem evaluating Tone.Type.Time: "+originalTime);
				}
			} else if (this.isNotation(time)){
				time = this.notationToSeconds(time);
			} else if (this.isTransportTime(time)){
				time = this.transportTimeToSeconds(time);
			} else if (this.isFrequency(time)){
				time = this.frequencyToSeconds(time);
			} else {
				time = parseFloat(time);
			}
			return time + plusTime;
		} else {
			return now;
		}
	};

	var TransportConstructor = Tone.Transport;

	Tone._initAudioContext(function(){
		if (typeof Tone.Transport === "function"){
			//a single transport object
			Tone.Transport = new Tone.Transport();
		} else {
			//stop the clock
			Tone.Transport.stop();
			//get the previous bpm
			var bpm = Tone.Transport.bpm.value;
			//destory the old clock
			Tone.Transport._clock.dispose();
			//make new Transport insides
			TransportConstructor.call(Tone.Transport);
			//set the bpm
			Tone.Transport.bpm.value = bpm;
		}
	});

	return Tone.Transport;
});
