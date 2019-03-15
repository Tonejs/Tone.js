import Tone from "../core/Tone";
import "../signal/TickSignal";
import "../core/TimelineState";
import "../core/Timeline";
import "../core/Param";

/**
 *  @class  Uses [Tone.TickSignal](TickSignal) to track elapsed ticks with
 *  		complex automation curves.
 *
 * 	@constructor
 *  @extends {Tone}
 *  @param {Frequency} frequency The initial frequency that the signal ticks at
 *  @param {Tone.Param=} param A parameter to control (such as playbackRate)
 */
Tone.TickSource = function(){

	var options = Tone.defaults(arguments, ["frequency"], Tone.TickSource);

	/**
	 *  The frequency the callback function should be invoked.
	 *  @type  {Frequency}
	 *  @signal
	 */
	this.frequency = new Tone.TickSignal(options.frequency);
	this._readOnly("frequency");

	/**
	 *  The state timeline
	 *  @type {Tone.TimelineState}
	 *  @private
	 */
	this._state = new Tone.TimelineState(Tone.State.Stopped);
	this._state.setStateAtTime(Tone.State.Stopped, 0);

	/**
	 * The offset values of the ticks
	 * @type {Tone.Timeline}
	 * @private
	 */
	this._tickOffset = new Tone.Timeline();
	//add the first event
	this.setTicksAtTime(0, 0);
};

Tone.extend(Tone.TickSource);

/**
 *  The defaults
 *  @const
 *  @type  {Object}
 */
Tone.TickSource.defaults = {
	"frequency" : 1,
};

/**
 *  Returns the playback state of the source, either "started", "stopped" or "paused".
 *  @type {Tone.State}
 *  @readOnly
 *  @memberOf Tone.TickSource#
 *  @name state
 */
Object.defineProperty(Tone.TickSource.prototype, "state", {
	get : function(){
		return this._state.getValueAtTime(this.now());
	}
});

/**
 *  Start the clock at the given time. Optionally pass in an offset
 *  of where to start the tick counter from.
 *  @param  {Time=}  time    The time the clock should start
 *  @param {Ticks} [offset=0] The number of ticks to start the source at
 *  @return  {Tone.TickSource}  this
 */
Tone.TickSource.prototype.start = function(time, offset){
	time = this.toSeconds(time);
	if (this._state.getValueAtTime(time) !== Tone.State.Started){
		this._state.setStateAtTime(Tone.State.Started, time);
		if (Tone.isDefined(offset)){
			this.setTicksAtTime(offset, time);
		}
	}
	return this;
};

/**
 *  Stop the clock. Stopping the clock resets the tick counter to 0.
 *  @param {Time} [time=now] The time when the clock should stop.
 *  @returns {Tone.TickSource} this
 *  @example
 * clock.stop();
 */
Tone.TickSource.prototype.stop = function(time){
	time = this.toSeconds(time);
	//cancel the previous stop
	if (this._state.getValueAtTime(time) === Tone.State.Stopped){
		var event = this._state.get(time);
		if (event.time > 0){
			this._tickOffset.cancel(event.time);
			this._state.cancel(event.time);
		}
	}
	this._state.cancel(time);
	this._state.setStateAtTime(Tone.State.Stopped, time);
	this.setTicksAtTime(0, time);
	return this;
};

/**
 *  Pause the clock. Pausing does not reset the tick counter.
 *  @param {Time} [time=now] The time when the clock should stop.
 *  @returns {Tone.TickSource} this
 */
Tone.TickSource.prototype.pause = function(time){
	time = this.toSeconds(time);
	if (this._state.getValueAtTime(time) === Tone.State.Started){
		this._state.setStateAtTime(Tone.State.Paused, time);
	}
	return this;
};

/**
 *  Cancel start/stop/pause and setTickAtTime events scheduled after the given time.
 *  @param {Time} [time=now] When to clear the events after
 *  @returns {Tone.TickSource} this
 */
Tone.TickSource.prototype.cancel = function(time){
	time = this.toSeconds(time);
	this._state.cancel(time);
	this._tickOffset.cancel(time);
	return this;
};

/**
 * Get the elapsed ticks at the given time
 * @param  {Time} time  When to get the tick value
 * @return {Ticks}     The number of ticks
 */
Tone.TickSource.prototype.getTicksAtTime = function(time){
	time = this.toSeconds(time);
	var stopEvent = this._state.getLastState(Tone.State.Stopped, time);
	//this event allows forEachBetween to iterate until the current time
	var tmpEvent = { state : Tone.State.Paused, time : time };
	this._state.add(tmpEvent);

	//keep track of the previous offset event
	var lastState = stopEvent;
	var elapsedTicks = 0;

	//iterate through all the events since the last stop
	this._state.forEachBetween(stopEvent.time, time + this.sampleTime, function(e){
		var periodStartTime = lastState.time;
		//if there is an offset event in this period use that
		var offsetEvent = this._tickOffset.get(e.time);
		if (offsetEvent.time >= lastState.time){
			elapsedTicks = offsetEvent.ticks;
			periodStartTime = offsetEvent.time;
		}
		if (lastState.state === Tone.State.Started && e.state !== Tone.State.Started){
			elapsedTicks += this.frequency.getTicksAtTime(e.time) - this.frequency.getTicksAtTime(periodStartTime);
		} 
		lastState = e;
	}.bind(this));

	//remove the temporary event
	this._state.remove(tmpEvent);

	//return the ticks
	return elapsedTicks;
};

/**
 *  The number of times the callback was invoked. Starts counting at 0
 *  and increments after the callback was invoked. Returns -1 when stopped.
 *  @memberOf Tone.TickSource#
 *  @name ticks
 *  @type {Ticks}
 */
Object.defineProperty(Tone.TickSource.prototype, "ticks", {
	get : function(){
		return this.getTicksAtTime(this.now());
	},
	set : function(t){
		this.setTicksAtTime(t, this.now());
	}
});

/**
 *  The time since ticks=0 that the TickSource has been running. Accounts
 *  for tempo curves
 *  @memberOf Tone.TickSource#
 *  @name seconds
 *  @type {Seconds}
 */
Object.defineProperty(Tone.TickSource.prototype, "seconds", {
	get : function(){
		return this.getSecondsAtTime(this.now());
	},
	set : function(s){
		var now = this.now();
		var ticks = this.frequency.timeToTicks(s, now);
		this.setTicksAtTime(ticks, now);
	}
});

/**
 *  Return the elapsed seconds at the given time.
 *  @param  {Time}  time  When to get the elapsed seconds
 *  @return  {Seconds}  The number of elapsed seconds
 */
Tone.TickSource.prototype.getSecondsAtTime = function(time){
	time = this.toSeconds(time);
	var stopEvent = this._state.getLastState(Tone.State.Stopped, time);
	//this event allows forEachBetween to iterate until the current time
	var tmpEvent = { state : Tone.State.Paused, time : time };
	this._state.add(tmpEvent);

	//keep track of the previous offset event
	var lastState = stopEvent;
	var elapsedSeconds = 0;

	//iterate through all the events since the last stop
	this._state.forEachBetween(stopEvent.time, time + this.sampleTime, function(e){
		var periodStartTime = lastState.time;
		//if there is an offset event in this period use that
		var offsetEvent = this._tickOffset.get(e.time);
		if (offsetEvent.time >= lastState.time){
			elapsedSeconds = offsetEvent.seconds;
			periodStartTime = offsetEvent.time;
		}
		if (lastState.state === Tone.State.Started && e.state !== Tone.State.Started){
			elapsedSeconds += e.time - periodStartTime;
		} 
		lastState = e;
	}.bind(this));

	//remove the temporary event
	this._state.remove(tmpEvent);

	//return the ticks
	return elapsedSeconds;
};

/**
 * Set the clock's ticks at the given time.
 * @param  {Ticks} ticks The tick value to set
 * @param  {Time} time  When to set the tick value
 * @return {Tone.TickSource}       this
 */
Tone.TickSource.prototype.setTicksAtTime = function(ticks, time){
	time = this.toSeconds(time);
	this._tickOffset.cancel(time);
	this._tickOffset.add({
		"time" : time,
		"ticks" : ticks,
		"seconds" : this.frequency.getDurationOfTicks(ticks, time)
	});
	return this;
};

/**
 *  Returns the scheduled state at the given time.
 *  @param  {Time}  time  The time to query.
 *  @return  {String}  The name of the state input in setStateAtTime.
 *  @example
 * source.start("+0.1");
 * source.getStateAtTime("+0.1"); //returns "started"
 */
Tone.TickSource.prototype.getStateAtTime = function(time){
	time = this.toSeconds(time);
	return this._state.getValueAtTime(time);
};

/**
 * Get the time of the given tick. The second argument
 * is when to test before. Since ticks can be set (with setTicksAtTime)
 * there may be multiple times for a given tick value. 
 * @param  {Ticks} ticks The tick number.
 * @param  {Time=} before When to measure the tick value from. 
 * @return {Time}       The time of the tick
 */
Tone.TickSource.prototype.getTimeOfTick = function(tick, before){
	before = Tone.defaultArg(before, this.now());
	var offset = this._tickOffset.get(before);
	var event = this._state.get(before);
	var startTime = Math.max(offset.time, event.time);
	var absoluteTicks = this.frequency.getTicksAtTime(startTime) + tick - offset.ticks;
	return this.frequency.getTimeOfTick(absoluteTicks);
};

/**
 * @callback forEachTickBetween
 * @param {Time} when
 * @param {Ticks} when
 */

/**
 *  Invoke the callback event at all scheduled ticks between the 
 *  start time and the end time
 *  @param  {Time}    startTime  The beginning of the search range
 *  @param  {Time}    endTime    The end of the search range
 *  @param  {ForEachCallback}  callback   The callback to invoke with each tick
 *  @return  {Tone.TickSource}    this
 */
Tone.TickSource.prototype.forEachTickBetween = function(startTime, endTime, callback){

	//only iterate through the sections where it is "started"
	var lastStateEvent = this._state.get(startTime);
	this._state.forEachBetween(startTime, endTime, function(event){
		if (lastStateEvent.state === Tone.State.Started && event.state !== Tone.State.Started){
			this.forEachTickBetween(Math.max(lastStateEvent.time, startTime), event.time - this.sampleTime, callback);
		}
		lastStateEvent = event;
	}.bind(this));

	startTime = Math.max(lastStateEvent.time, startTime);

	if (lastStateEvent.state === Tone.State.Started && this._state){
		//figure out the difference between the frequency ticks and the 
		var startTicks = this.frequency.getTicksAtTime(startTime);
		var ticksAtStart = this.frequency.getTicksAtTime(lastStateEvent.time);
		var diff = startTicks - ticksAtStart;
		var offset = diff % 1;
		if (offset !== 0){
			offset = 1 - offset;
		}
		var nextTickTime = this.frequency.getTimeOfTick(startTicks + offset);
		var error = null;
		while (nextTickTime < endTime && this._state){
			try {
				callback(nextTickTime, Math.round(this.getTicksAtTime(nextTickTime)));
			} catch (e){
				error = e;
				break;
			}
			if (this._state){
				nextTickTime += this.frequency.getDurationOfTicks(1, nextTickTime);
			} 
		}
	}

	if (error){
		throw error;
	}
	
	return this;
};

/**
 *  Clean up
 *  @returns {Tone.TickSource} this
 */
Tone.TickSource.prototype.dispose = function(){
	Tone.Param.prototype.dispose.call(this);
	this._state.dispose();
	this._state = null;
	this._tickOffset.dispose();
	this._tickOffset = null;
	this._writable("frequency");
	this.frequency.dispose();
	this.frequency = null;
	return this;
};

export default Tone.TickSource;

