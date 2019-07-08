import Tone from "../core/Tone";
import "../core/Transport";
import "../type/Type";
import "../core/TimelineState";

/**
 *  @class  Tone.Event abstracts away Tone.Transport.schedule and provides a schedulable
 *          callback for a single or repeatable events along the timeline.
 *
 *  @extends {Tone}
 *  @param {function} callback The callback to invoke at the time.
 *  @param {*} value The value or values which should be passed to
 *                      the callback function on invocation.
 *  @example
 * var chord = new Tone.Event(function(time, chord){
 * 	//the chord as well as the exact time of the event
 * 	//are passed in as arguments to the callback function
 * }, ["D4", "E4", "F4"]);
 * //start the chord at the beginning of the transport timeline
 * chord.start();
 * //loop it every measure for 8 measures
 * chord.loop = 8;
 * chord.loopEnd = "1m";
 */
Tone.Event = function(){

	var options = Tone.defaults(arguments, ["callback", "value"], Tone.Event);
	Tone.call(this);

	/**
	 *  Loop value
	 *  @type  {Boolean|Positive}
	 *  @private
	 */
	this._loop = options.loop;

	/**
	 *  The callback to invoke.
	 *  @type  {Function}
	 */
	this.callback = options.callback;

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
	this._loopStart = this.toTicks(options.loopStart);

	/**
	 *  When the note is scheduled to start.
	 *  @type  {Number}
	 *  @private
	 */
	this._loopEnd = this.toTicks(options.loopEnd);

	/**
	 *  Tracks the scheduled events
	 *  @type {Tone.TimelineState}
	 *  @private
	 */
	this._state = new Tone.TimelineState(Tone.State.Stopped);

	/**
	 *  The playback speed of the note. A speed of 1
	 *  is no change.
	 *  @private
	 *  @type {Positive}
	 */
	this._playbackRate = 1;

	/**
	 *  A delay time from when the event is scheduled to start
	 *  @type {Ticks}
	 *  @private
	 */
	this._startOffset = 0;

	/**
	 *  private holder of probability value
	 *  @type {NormalRange}
	 *  @private
	 */
	this._probability = options.probability;

	/**
	 *  the amount of variation from the
	 *  given time.
	 *  @type {Boolean|Time}
	 *  @private
	 */
	this._humanize = options.humanize;

	/**
	 *  If mute is true, the callback won't be
	 *  invoked.
	 *  @type {Boolean}
	 */
	this.mute = options.mute;

	//set the initial values
	this.playbackRate = options.playbackRate;
};

Tone.extend(Tone.Event);

/**
 *  The default values
 *  @type  {Object}
 *  @const
 */
Tone.Event.defaults = {
	"callback" : Tone.noOp,
	"loop" : false,
	"loopEnd" : "1m",
	"loopStart" : 0,
	"playbackRate" : 1,
	"value" : null,
	"probability" : 1,
	"mute" : false,
	"humanize" : false,
};

/**
 *  Reschedule all of the events along the timeline
 *  with the updated values.
 *  @param {Time} after Only reschedules events after the given time.
 *  @return  {Tone.Event}  this
 *  @private
 */
Tone.Event.prototype._rescheduleEvents = function(after){
	//if no argument is given, schedules all of the events
	after = Tone.defaultArg(after, -1);
	this._state.forEachFrom(after, function(event){
		var duration;
		if (event.state === Tone.State.Started){
			if (Tone.isDefined(event.id)){
				Tone.Transport.clear(event.id);
			}
			var startTick = event.time + Math.round(this.startOffset / this._playbackRate);
			if (this._loop === true || Tone.isNumber(this._loop) && this._loop > 1){
				duration = Infinity;
				if (Tone.isNumber(this._loop)){
					duration = (this._loop) * this._getLoopDuration();
				}
				var nextEvent = this._state.getAfter(startTick);
				if (nextEvent !== null){
					duration = Math.min(duration, nextEvent.time - startTick);
				}
				if (duration !== Infinity){
					//schedule a stop since it's finite duration
					this._state.setStateAtTime(Tone.State.Stopped, startTick + duration + 1);
					duration = Tone.Ticks(duration);
				}
				var interval = Tone.Ticks(this._getLoopDuration());
				event.id = Tone.Transport.scheduleRepeat(this._tick.bind(this), interval, Tone.Ticks(startTick), duration);
			} else {
				event.id = Tone.Transport.schedule(this._tick.bind(this), Tone.Ticks(startTick));
			}
		}
	}.bind(this));
	return this;
};

/**
 *  Returns the playback state of the note, either "started" or "stopped".
 *  @type {String}
 *  @readOnly
 *  @memberOf Tone.Event#
 *  @name state
 */
Object.defineProperty(Tone.Event.prototype, "state", {
	get : function(){
		return this._state.getValueAtTime(Tone.Transport.ticks);
	}
});

/**
 *  The start from the scheduled start time
 *  @type {Ticks}
 *  @memberOf Tone.Event#
 *  @name startOffset
 *  @private
 */
Object.defineProperty(Tone.Event.prototype, "startOffset", {
	get : function(){
		return this._startOffset;
	},
	set : function(offset){
		this._startOffset = offset;
	}
});

/**
 *  The probability of the notes being triggered.
 *  @memberOf Tone.Event#
 *  @type {NormalRange}
 *  @name probability
 */
Object.defineProperty(Tone.Event.prototype, "probability", {
	get : function(){
		return this._probability;
	},
	set : function(prob){
		this._probability = prob;
	}
});

/**
 *  If set to true, will apply small random variation
 *  to the callback time. If the value is given as a time, it will randomize
 *  by that amount.
 *  @type {Boolean|Time}
 *  @name humanize
 *  @memberof Tone.Event#
 *  @example
 * event.humanize = true;
 */
Object.defineProperty(Tone.Event.prototype, "humanize", {
	get : function(){
		return this._humanize;
	},
	set : function(variation){
		this._humanize = variation;
	}
});

/**
 *  Start the note at the given time.
 *  @param  {TimelinePosition}  time  When the note should start.
 *  @return  {Tone.Event}  this
 */
Tone.Event.prototype.start = function(time){
	time = this.toTicks(time);
	if (this._state.getValueAtTime(time) === Tone.State.Stopped){
		this._state.add({
			"state" : Tone.State.Started,
			"time" : time,
			"id" : undefined,
		});
		this._rescheduleEvents(time);
	}
	return this;
};

/**
 *  Stop the Event at the given time.
 *  @param  {TimelinePosition}  time  When the note should stop.
 *  @return  {Tone.Event}  this
 */
Tone.Event.prototype.stop = function(time){
	this.cancel(time);
	time = this.toTicks(time);
	if (this._state.getValueAtTime(time) === Tone.State.Started){
		this._state.setStateAtTime(Tone.State.Stopped, time);
		var previousEvent = this._state.getBefore(time);
		var reschedulTime = time;
		if (previousEvent !== null){
			reschedulTime = previousEvent.time;
		}
		this._rescheduleEvents(reschedulTime);
	}
	return this;
};

/**
 *  Cancel all scheduled events greater than or equal to the given time
 *  @param  {TimelinePosition}  [time=0]  The time after which events will be cancel.
 *  @return  {Tone.Event}  this
 */
Tone.Event.prototype.cancel = function(time){
	time = Tone.defaultArg(time, -Infinity);
	time = this.toTicks(time);
	this._state.forEachFrom(time, function(event){
		Tone.Transport.clear(event.id);
	});
	this._state.cancel(time);
	return this;
};

/**
 *  The callback function invoker. Also
 *  checks if the Event is done playing
 *  @param  {Number}  time  The time of the event in seconds
 *  @private
 */
Tone.Event.prototype._tick = function(time){
	var ticks = Tone.Transport.getTicksAtTime(time);
	if (!this.mute && this._state.getValueAtTime(ticks) === Tone.State.Started){
		if (this.probability < 1 && Math.random() > this.probability){
			return;
		}
		if (this.humanize){
			var variation = 0.02;
			if (!Tone.isBoolean(this.humanize)){
				variation = this.toSeconds(this.humanize);
			}
			time += (Math.random() * 2 - 1) * variation;
		}
		this.callback(time, this.value);
	}
};

/**
 *  Get the duration of the loop.
 *  @return  {Ticks}
 *  @private
 */
Tone.Event.prototype._getLoopDuration = function(){
	return Math.round((this._loopEnd - this._loopStart) / this._playbackRate);
};

/**
 *  If the note should loop or not
 *  between Tone.Event.loopStart and
 *  Tone.Event.loopEnd. If set to true,
 *  the event will loop indefinitely,
 *  if set to a number greater than 1
 *  it will play a specific number of
 *  times, if set to false, 0 or 1, the
 *  part will only play once.
 *  @memberOf Tone.Event#
 *  @type {Boolean|Positive}
 *  @name loop
 */
Object.defineProperty(Tone.Event.prototype, "loop", {
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
 *  @memberOf Tone.Event#
 *  @type {Positive}
 *  @name playbackRate
 *  @example
 * note.loop = true;
 * //repeat the note twice as fast
 * note.playbackRate = 2;
 */
Object.defineProperty(Tone.Event.prototype, "playbackRate", {
	get : function(){
		return this._playbackRate;
	},
	set : function(rate){
		this._playbackRate = rate;
		this._rescheduleEvents();
	}
});

/**
 *  The loopEnd point is the time the event will loop
 *  if Tone.Event.loop is true.
 *  @memberOf Tone.Event#
 *  @type {Time}
 *  @name loopEnd
 */
Object.defineProperty(Tone.Event.prototype, "loopEnd", {
	get : function(){
		return Tone.Ticks(this._loopEnd).toSeconds();
	},
	set : function(loopEnd){
		this._loopEnd = this.toTicks(loopEnd);
		if (this._loop){
			this._rescheduleEvents();
		}
	}
});

/**
 *  The time when the loop should start.
 *  @memberOf Tone.Event#
 *  @type {Time}
 *  @name loopStart
 */
Object.defineProperty(Tone.Event.prototype, "loopStart", {
	get : function(){
		return Tone.Ticks(this._loopStart).toSeconds();
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
 *  Returns 0 if the event is not started yet or
 *  it is not set to loop.
 *  @memberOf Tone.Event#
 *  @type {NormalRange}
 *  @name progress
 *  @readOnly
 */
Object.defineProperty(Tone.Event.prototype, "progress", {
	get : function(){
		if (this._loop){
			var ticks = Tone.Transport.ticks;
			var lastEvent = this._state.get(ticks);
			if (lastEvent !== null && lastEvent.state === Tone.State.Started){
				var loopDuration = this._getLoopDuration();
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
 *  @return  {Tone.Event}  this
 */
Tone.Event.prototype.dispose = function(){
	this.cancel();
	this._state.dispose();
	this._state = null;
	this.callback = null;
	this.value = null;
};

export default Tone.Event;

