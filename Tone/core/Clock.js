define(["Tone/core/Tone", "Tone/signal/TimelineSignal", "Tone/core/TimelineState", "Tone/core/Emitter"], function (Tone) {

	"use strict";

	/**
	 *  @class  A sample accurate clock which provides a callback at the given rate. 
	 *          While the callback is not sample-accurate (it is still susceptible to
	 *          loose JS timing), the time passed in as the argument to the callback
	 *          is precise. For most applications, it is better to use Tone.Transport
	 *          instead of the Clock by itself since you can synchronize multiple callbacks.
	 *
	 * 	@constructor
	 *  @extends {Tone.Emitter}
	 * 	@param {function} callback The callback to be invoked with the time of the audio event
	 * 	@param {Frequency} frequency The rate of the callback
	 * 	@example
	 * //the callback will be invoked approximately once a second
	 * //and will print the time exactly once a second apart.
	 * var clock = new Tone.Clock(function(time){
	 * 	console.log(time);
	 * }, 1);
	 */
	Tone.Clock = function(){

		Tone.Emitter.call(this);

		var options = this.optionsObject(arguments, ["callback", "frequency"], Tone.Clock.defaults);

		/**
		 *  The callback function to invoke at the scheduled tick.
		 *  @type  {Function}
		 */
		this.callback = options.callback;

		/**
		 *  The next time the callback is scheduled.
		 *  @type {Number}
		 *  @private
		 */
		this._nextTick = 0;

		/**
		 *  The last state of the clock.
		 *  @type  {State}
		 *  @private
		 */
		this._lastState = Tone.State.Stopped;

		/**
		 *  The rate the callback function should be invoked. 
		 *  @type  {BPM}
		 *  @signal
		 */
		this.frequency = new Tone.TimelineSignal(options.frequency, Tone.Type.Frequency);
		this._readOnly("frequency");

		/**
		 *  The number of times the callback was invoked. Starts counting at 0
		 *  and increments after the callback was invoked. 
		 *  @type {Ticks}
		 *  @readOnly
		 */
		this.ticks = 0;

		/**
		 *  The state timeline
		 *  @type {Tone.TimelineState}
		 *  @private
		 */
		this._state = new Tone.TimelineState(Tone.State.Stopped);

		/**
		 *  The loop function bound to its context. 
		 *  This is necessary to remove the event in the end.
		 *  @type {Function}
		 *  @private
		 */
		this._boundLoop = this._loop.bind(this);

		//bind a callback to the worker thread
    	Tone.Clock._worker.addEventListener("message", this._boundLoop);
	};

	Tone.extend(Tone.Clock, Tone.Emitter);

	/**
	 *  The defaults
	 *  @const
	 *  @type  {Object}
	 */
	Tone.Clock.defaults = {
		"callback" : Tone.noOp,
		"frequency" : 1,
		"lookAhead" : "auto",
	};

	/**
	 *  Returns the playback state of the source, either "started", "stopped" or "paused".
	 *  @type {Tone.State}
	 *  @readOnly
	 *  @memberOf Tone.Clock#
	 *  @name state
	 */
	Object.defineProperty(Tone.Clock.prototype, "state", {
		get : function(){
			return this._state.getValueAtTime(this.now());
		}
	});

	/**
	 *  Start the clock at the given time. Optionally pass in an offset
	 *  of where to start the tick counter from.
	 *  @param  {Time}  time    The time the clock should start
	 *  @param  {Ticks=}  offset  Where the tick counter starts counting from.
	 *  @return  {Tone.Clock}  this
	 */
	Tone.Clock.prototype.start = function(time, offset){
		time = this.toSeconds(time);
		if (this._state.getValueAtTime(time) !== Tone.State.Started){
			this._state.add({
				"state" : Tone.State.Started, 
				"time" : time,
				"offset" : offset
			});
		}
		return this;	
	};

	/**
	 *  Stop the clock. Stopping the clock resets the tick counter to 0.
	 *  @param {Time} [time=now] The time when the clock should stop.
	 *  @returns {Tone.Clock} this
	 *  @example
	 * clock.stop();
	 */
	Tone.Clock.prototype.stop = function(time){
		time = this.toSeconds(time);
		this._state.cancel(time);
		this._state.setStateAtTime(Tone.State.Stopped, time);
		return this;	
	};


	/**
	 *  Pause the clock. Pausing does not reset the tick counter.
	 *  @param {Time} [time=now] The time when the clock should stop.
	 *  @returns {Tone.Clock} this
	 */
	Tone.Clock.prototype.pause = function(time){
		time = this.toSeconds(time);
		if (this._state.getValueAtTime(time) === Tone.State.Started){
			this._state.setStateAtTime(Tone.State.Paused, time);
		}
		return this;	
	};

	/**
	 *  The scheduling loop.
	 *  @param  {Number}  time  The current page time starting from 0
	 *                          when the page was loaded.
	 *  @private
	 */
	Tone.Clock.prototype._loop = function(){
		//get the frequency value to compute the value of the next loop
		var now = this.now();
		//if it's started
		var lookAhead = Tone.Clock.lookAhead;
		var updateInterval = Tone.Clock.updateInterval;
		var lagCompensation = Tone.Clock.lag * 2;
		var loopInterval = now + lookAhead + updateInterval + lagCompensation;
		while (loopInterval > this._nextTick && this._state){
			var currentState = this._state.getValueAtTime(this._nextTick);
			if (currentState !== this._lastState){
				this._lastState = currentState;
				var event = this._state.get(this._nextTick);
				// emit an event
				if (currentState === Tone.State.Started){
					//correct the time
					this._nextTick = event.time;
					if (!this.isUndef(event.offset)){
						this.ticks = event.offset;
					}
					this.emit("start", event.time, this.ticks);
				} else if (currentState === Tone.State.Stopped){
					this.ticks = 0;

					this.emit("stop", event.time);
				} else if (currentState === Tone.State.Paused){
					this.emit("pause", event.time);
				}
			}
			var tickTime = this._nextTick;
			if (this.frequency){
				this._nextTick += 1 / this.frequency.getValueAtTime(this._nextTick);
				if (currentState === Tone.State.Started){
					this.callback(tickTime);
					this.ticks++;
				}
			}
		}
	};

	/**
	 *  Returns the scheduled state at the given time.
	 *  @param  {Time}  time  The time to query.
	 *  @return  {String}  The name of the state input in setStateAtTime.
	 *  @example
	 * clock.start("+0.1");
	 * clock.getStateAtTime("+0.1"); //returns "started"
	 */
	Tone.Clock.prototype.getStateAtTime = function(time){
		time = this.toSeconds(time);
		return this._state.getValueAtTime(time);
	};

	/**
	 *  Clean up
	 *  @returns {Tone.Clock} this
	 */
	Tone.Clock.prototype.dispose = function(){
		Tone.Emitter.prototype.dispose.call(this);
		Tone.Clock._worker.removeEventListener("message", this._boundLoop);
		this._writable("frequency");
		this.frequency.dispose();
		this.frequency = null;
		this._boundLoop = null;
		this._nextTick = Infinity;
		this.callback = null;
		this._state.dispose();
		this._state = null;
	};

	///////////////////////////////////////////////////////////////////////////
	// WORKER
	///////////////////////////////////////////////////////////////////////////

	//URL Shim
	window.URL = window.URL || window.webkitURL;

	/**
	 *  The minimum amount of time events are 
	 *  scheduled in advance.
	 *  @private
	 *  @type  {Number}
	 */
	Tone.Clock._lookAhead = 0.1;

	/**
	 *  How often the worker ticks
	 *  @type  {Seconds}
	 *  @private
	 */
	Tone.Clock._updateInterval = Tone.Clock._lookAhead / 3;

	/**
	 *  The script which runs in a web worker
	 *  @type {Blob}
	 *  @private
	 */
	var blob = new Blob([
		//the initial timeout time
		"var timeoutTime = "+(Tone.Clock._updateInterval * 1000)+";" +
		//onmessage callback
		"self.onmessage = function(msg){" +
		"	timeoutTime = parseInt(msg.data);" + 
		"};" + 
		//the tick function which posts a message
		//and schedules a new tick
		"function tick(){" +
		"	setTimeout(tick, timeoutTime);" +
		"	self.postMessage('tick');" +
		"}" +
		//call tick initially
		"tick();"
	]);

	/**
	 *  Create a blob url from the Blob
	 *  @type  {URL}
	 *  @private
	 */
  	var blobUrl = URL.createObjectURL(blob);

  	/**
	 *  The Worker which generates a regular callback
	 *  @type {Worker}
	 *  @private
	 *  @static
	 */
	Tone.Clock._worker = new Worker(blobUrl);

	/**
	 *  @private
	 *  @type  {Number}
	 *  The time of the last update
	 */
	var lastUpdate = -1;

	/**
	 *  The current computed update rate of the clock.
	 *  @type  {Number}
	 *  @private
	 */
	var computedUpdateInterval = 0;

	//listen for message events and update the global clock lookahead
	Tone.Clock._worker.addEventListener("message", function(){
		var now = Tone.now();
		if (lastUpdate !== -1){
			var diff = now - lastUpdate;
			computedUpdateInterval = Math.max(diff, computedUpdateInterval * 0.97);
		}
		lastUpdate = now;
	});

	/**
	 *  This is the time that the clock is falling behind
	 *  the scheduled update interval. The Clock automatically
	 *  adjusts for the lag and schedules further in advance.
	 *  @type {Number}
	 *  @memberOf Tone.Clock
	 *  @name lag
	 *  @static
	 *  @readOnly
	 */
	Object.defineProperty(Tone.Clock, "lag", {
		get : function(){
			var diff = computedUpdateInterval - Tone.Clock._updateInterval;
			diff = Math.max(diff, 0);
			return diff;
		}
	});

	/**
	 *  The amount of time in advance that events are scheduled.
	 *  The lookAhead will adjust slightly in response to the 
	 *  measured update time to try to avoid clicks.
	 *  @type {Number}
	 *  @memberOf Tone.Clock
	 *  @name lookAhead
	 *  @static
	 */
	Object.defineProperty(Tone.Clock, "lookAhead", {
		get : function(){
			return Tone.Clock._lookAhead;
		},
		set : function(lA){
			Tone.Clock._lookAhead = lA;
		}
	});

	/**
	 *  How often the Web Worker callback is invoked.
	 *  This number corresponds to how responsive the scheduling
	 *  can be. Clock.updateInterval + Clock.lookAhead gives you the
	 *  total latency between scheduling an event and hearing it.
	 *  @type {Number}
	 *  @memberOf Tone.Clock
	 *  @name updateInterval
	 *  @static
	 */
	Object.defineProperty(Tone.Clock, "updateInterval", {
		get : function(){
			return Tone.Clock._updateInterval;
		},
		set : function(interval){
			Tone.Clock._updateInterval = Math.max(interval, 0.01);
			Tone.Clock._worker.postMessage(interval * 1000);
		}
	});

	/**
	 *  The latency hint
	 *  @private
	 *  @type {String|Number}
	 */
	var latencyHint = "interactive";

	/**
	 *  The type of playback, which affects tradeoffs between audio 
	 *  output latency and responsiveness. 
	 *  
	 *  In addition to setting the value in seconds, the latencyHint also
	 *  accepts the strings "interactive" (prioritizes low latency), 
	 *  "playback" (prioritizes sustained playback), "balanced" (balances
	 *  latency and performance), and "fastest" (lowest latency, might glitch more often). 
	 *  @type {String|Seconds}
	 *  @memberOf Tone.Clock#
	 *  @name latencyHint
	 *  @static
	 *  @example
	 * //set the lookAhead to 0.3 seconds
	 * Tone.Clock.latencyHint = 0.3;
	 */
	Object.defineProperty(Tone.Clock, "latencyHint", {
		get : function(){
			return latencyHint;
		},
		set : function(hint){
			var lookAhead = hint;
			latencyHint = hint;
			if (Tone.prototype.isString(hint)){
				switch(hint){
					case "interactive" :
						lookAhead = 0.1;
						Tone.context.latencyHint = hint;
						break;
					case "playback" :
						lookAhead = 0.8;
						Tone.context.latencyHint = hint;
						break;
					case "balanced" :
						lookAhead = 0.25;
						Tone.context.latencyHint = hint;
						break;
					case "fastest" :
						lookAhead = 0.01;
						break;
				}
			}
			Tone.Clock.lookAhead = lookAhead;
			Tone.Clock.updateInterval = lookAhead/3;
		}
	});

	Tone._initAudioContext(function(){
		lastUpdate = -1;
		computedUpdateInterval = 0;
	});

	return Tone.Clock;
});