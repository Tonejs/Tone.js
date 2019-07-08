import Tone from "../core/Tone";
import "../event/Event";
import "../type/Type";
import "../core/Transport";

/**
 *  @class Tone.Part is a collection Tone.Events which can be
 *         started/stopped and looped as a single unit.
 *
 *  @extends {Tone.Event}
 *  @param {Function} callback The callback to invoke on each event
 *  @param {Array} events the array of events
 *  @example
 * var part = new Tone.Part(function(time, note){
 * 	//the notes given as the second element in the array
 * 	//will be passed in as the second argument
 * 	synth.triggerAttackRelease(note, "8n", time);
 * }, [[0, "C2"], ["0:2", "C3"], ["0:3:2", "G2"]]);
 *  @example
 * //use an array of objects as long as the object has a "time" attribute
 * var part = new Tone.Part(function(time, value){
 * 	//the value is an object which contains both the note and the velocity
 * 	synth.triggerAttackRelease(value.note, "8n", time, value.velocity);
 * }, [{"time" : 0, "note" : "C3", "velocity": 0.9},
 * 	   {"time" : "0:2", "note" : "C4", "velocity": 0.5}
 * ]).start(0);
 */
Tone.Part = function(){

	var options = Tone.defaults(arguments, ["callback", "events"], Tone.Part);
	Tone.Event.call(this, options);

	/**
	 *  An array of Objects.
	 *  @type  {Array}
	 *  @private
	 */
	this._events = [];

	//add the events
	for (var i = 0; i < options.events.length; i++){
		if (Array.isArray(options.events[i])){
			this.add(options.events[i][0], options.events[i][1]);
		} else {
			this.add(options.events[i]);
		}
	}
};

Tone.extend(Tone.Part, Tone.Event);

/**
 *  The default values
 *  @type  {Object}
 *  @const
 */
Tone.Part.defaults = {
	"callback" : Tone.noOp,
	"loop" : false,
	"loopEnd" : "1m",
	"loopStart" : 0,
	"playbackRate" : 1,
	"probability" : 1,
	"humanize" : false,
	"mute" : false,
	"events" : []
};

/**
 *  Start the part at the given time.
 *  @param  {TransportTime}  time    When to start the part.
 *  @param  {Time=}  offset  The offset from the start of the part
 *                           to begin playing at.
 *  @return  {Tone.Part}  this
 */
Tone.Part.prototype.start = function(time, offset){
	var ticks = this.toTicks(time);
	if (this._state.getValueAtTime(ticks) !== Tone.State.Started){
		if (this._loop){
			offset = Tone.defaultArg(offset, this._loopStart);
		} else {
			offset = Tone.defaultArg(offset, 0);
		}
		offset = this.toTicks(offset);
		this._state.add({
			"state" : Tone.State.Started,
			"time" : ticks,
			"offset" : offset
		});
		this._forEach(function(event){
			this._startNote(event, ticks, offset);
		});
	}
	return this;
};

/**
 *  Start the event in the given event at the correct time given
 *  the ticks and offset and looping.
 *  @param  {Tone.Event}  event
 *  @param  {Ticks}  ticks
 *  @param  {Ticks}  offset
 *  @private
 */
Tone.Part.prototype._startNote = function(event, ticks, offset){
	ticks -= offset;
	if (this._loop){
		if (event.startOffset >= this._loopStart && event.startOffset < this._loopEnd){
			if (event.startOffset < offset){
				//start it on the next loop
				ticks += this._getLoopDuration();
			}
			event.start(Tone.Ticks(ticks));
		} else if (event.startOffset < this._loopStart && event.startOffset >= offset){
			event.loop = false;
			event.start(Tone.Ticks(ticks));
		}
	} else if (event.startOffset >= offset){
		event.start(Tone.Ticks(ticks));
	}
};

/**
 *  The start from the scheduled start time
 *  @type {Ticks}
 *  @memberOf Tone.Part#
 *  @name startOffset
 *  @private
 */
Object.defineProperty(Tone.Part.prototype, "startOffset", {
	get : function(){
		return this._startOffset;
	},
	set : function(offset){
		this._startOffset = offset;
		this._forEach(function(event){
			event.startOffset += this._startOffset;
		});
	}
});

/**
 *  Stop the part at the given time.
 *  @param  {TimelinePosition}  time  When to stop the part.
 *  @return  {Tone.Part}  this
 */
Tone.Part.prototype.stop = function(time){
	var ticks = this.toTicks(time);
	this._state.cancel(ticks);
	this._state.setStateAtTime(Tone.State.Stopped, ticks);
	this._forEach(function(event){
		event.stop(time);
	});
	return this;
};

/**
 *  Get/Set an Event's value at the given time.
 *  If a value is passed in and no event exists at
 *  the given time, one will be created with that value.
 *  If two events are at the same time, the first one will
 *  be returned.
 *  @example
 * part.at("1m"); //returns the part at the first measure
 *
 * part.at("2m", "C2"); //set the value at "2m" to C2.
 * //if an event didn't exist at that time, it will be created.
 *  @param {TransportTime} time The time of the event to get or set.
 *  @param {*=} value If a value is passed in, the value of the
 *                    event at the given time will be set to it.
 *  @return {Tone.Event} the event at the time
 */
Tone.Part.prototype.at = function(time, value){
	time = Tone.TransportTime(time);
	var tickTime = Tone.Ticks(1).toSeconds();
	for (var i = 0; i < this._events.length; i++){
		var event = this._events[i];
		if (Math.abs(time.toTicks() - event.startOffset) < tickTime){
			if (Tone.isDefined(value)){
				event.value = value;
			}
			return event;
		}
	}
	//if there was no event at that time, create one
	if (Tone.isDefined(value)){
		this.add(time, value);
		//return the new event
		return this._events[this._events.length - 1];
	} else {
		return null;
	}
};

/**
 *  Add a an event to the part.
 *  @param {Time} time The time the note should start.
 *                            If an object is passed in, it should
 *                            have a 'time' attribute and the rest
 *                            of the object will be used as the 'value'.
 *  @param  {Tone.Event|*}  value
 *  @returns {Tone.Part} this
 *  @example
 * part.add("1m", "C#+11");
 */
Tone.Part.prototype.add = function(time, value){
	//extract the parameters
	if (time.hasOwnProperty("time")){
		value = time;
		time = value.time;
	}
	time = this.toTicks(time);
	var event;
	if (value instanceof Tone.Event){
		event = value;
		event.callback = this._tick.bind(this);
	} else {
		event = new Tone.Event({
			"callback" : this._tick.bind(this),
			"value" : value,
		});
	}
	//the start offset
	event.startOffset = time;

	//initialize the values
	event.set({
		"loopEnd" : this.loopEnd,
		"loopStart" : this.loopStart,
		"loop" : this.loop,
		"humanize" : this.humanize,
		"playbackRate" : this.playbackRate,
		"probability" : this.probability
	});

	this._events.push(event);

	//start the note if it should be played right now
	this._restartEvent(event);
	return this;
};

/**
 *  Restart the given event
 *  @param  {Tone.Event}  event
 *  @private
 */
Tone.Part.prototype._restartEvent = function(event){
	this._state.forEach(function(stateEvent){
		if (stateEvent.state === Tone.State.Started){
			this._startNote(event, stateEvent.time, stateEvent.offset);
		} else {
			//stop the note
			event.stop(Tone.Ticks(stateEvent.time));
		}
	}.bind(this));
};

/**
 *  Remove an event from the part. If the event at that time is a Tone.Part,
 *  it will remove the entire part.
 *  @param {Time} time The time of the event
 *  @param {*} value Optionally select only a specific event value
 *  @return  {Tone.Part}  this
 */
Tone.Part.prototype.remove = function(time, value){
	//extract the parameters
	if (time.hasOwnProperty("time")){
		value = time;
		time = value.time;
	}
	time = this.toTicks(time);
	for (var i = this._events.length - 1; i >= 0; i--){
		var event = this._events[i];
		if (event.startOffset === time){
			if (Tone.isUndef(value) || (Tone.isDefined(value) && event.value === value)){
				this._events.splice(i, 1);
				event.dispose();
			}
		}
	}
	return this;
};

/**
 *  Remove all of the notes from the group.
 *  @return  {Tone.Part}  this
 */
Tone.Part.prototype.removeAll = function(){
	this._forEach(function(event){
		event.dispose();
	});
	this._events = [];
	return this;
};

/**
 *  Cancel scheduled state change events: i.e. "start" and "stop".
 *  @param {TimelinePosition} after The time after which to cancel the scheduled events.
 *  @return  {Tone.Part}  this
 */
Tone.Part.prototype.cancel = function(after){
	this._forEach(function(event){
		event.cancel(after);
	});
	this._state.cancel(this.toTicks(after));
	return this;
};

/**
 *  Iterate over all of the events
 *  @param {Function} callback
 *  @param {Object} ctx The context
 *  @private
 */
Tone.Part.prototype._forEach = function(callback, ctx){
	if (this._events){
		ctx = Tone.defaultArg(ctx, this);
		for (var i = this._events.length - 1; i >= 0; i--){
			var e = this._events[i];
			if (e instanceof Tone.Part){
				e._forEach(callback, ctx);
			} else {
				callback.call(ctx, e);
			}
		}
	}
	return this;
};

/**
 *  Set the attribute of all of the events
 *  @param  {String}  attr  the attribute to set
 *  @param  {*}  value      The value to set it to
 *  @private
 */
Tone.Part.prototype._setAll = function(attr, value){
	this._forEach(function(event){
		event[attr] = value;
	});
};

/**
 *  Internal tick method
 *  @param  {Number}  time  The time of the event in seconds
 *  @private
 */
Tone.Part.prototype._tick = function(time, value){
	if (!this.mute){
		this.callback(time, value);
	}
};

/**
 *  Determine if the event should be currently looping
 *  given the loop boundries of this Part.
 *  @param  {Tone.Event}  event  The event to test
 *  @private
 */
Tone.Part.prototype._testLoopBoundries = function(event){
	if (this._loop && (event.startOffset < this._loopStart || event.startOffset >= this._loopEnd)){
		event.cancel(0);
	} else if (event.state === Tone.State.Stopped){
		//reschedule it if it's stopped
		this._restartEvent(event);
	}
};

/**
 *  The probability of the notes being triggered.
 *  @memberOf Tone.Part#
 *  @type {NormalRange}
 *  @name probability
 */
Object.defineProperty(Tone.Part.prototype, "probability", {
	get : function(){
		return this._probability;
	},
	set : function(prob){
		this._probability = prob;
		this._setAll("probability", prob);
	}
});

/**
 *  If set to true, will apply small random variation
 *  to the callback time. If the value is given as a time, it will randomize
 *  by that amount.
 *  @example
 * event.humanize = true;
 *  @type {Boolean|Time}
 *  @name humanize
 *  @memberof Tone.Part#
 */
Object.defineProperty(Tone.Part.prototype, "humanize", {
	get : function(){
		return this._humanize;
	},
	set : function(variation){
		this._humanize = variation;
		this._setAll("humanize", variation);
	}
});

/**
 *  If the part should loop or not
 *  between Tone.Part.loopStart and
 *  Tone.Part.loopEnd. If set to true,
 *  the part will loop indefinitely,
 *  if set to a number greater than 1
 *  it will play a specific number of
 *  times, if set to false, 0 or 1, the
 *  part will only play once.
 *  @memberOf Tone.Part#
 *  @type {Boolean|Positive}
 *  @name loop
 *  @example
 * //loop the part 8 times
 * part.loop = 8;
 */
Object.defineProperty(Tone.Part.prototype, "loop", {
	get : function(){
		return this._loop;
	},
	set : function(loop){
		this._loop = loop;
		this._forEach(function(event){
			event._loopStart = this._loopStart;
			event._loopEnd = this._loopEnd;
			event.loop = loop;
			this._testLoopBoundries(event);
		});
	}
});

/**
 *  The loopEnd point determines when it will
 *  loop if Tone.Part.loop is true.
 *  @memberOf Tone.Part#
 *  @type {Time}
 *  @name loopEnd
 */
Object.defineProperty(Tone.Part.prototype, "loopEnd", {
	get : function(){
		return Tone.Ticks(this._loopEnd).toSeconds();
	},
	set : function(loopEnd){
		this._loopEnd = this.toTicks(loopEnd);
		if (this._loop){
			this._forEach(function(event){
				event.loopEnd = loopEnd;
				this._testLoopBoundries(event);
			});
		}
	}
});

/**
 *  The loopStart point determines when it will
 *  loop if Tone.Part.loop is true.
 *  @memberOf Tone.Part#
 *  @type {Time}
 *  @name loopStart
 */
Object.defineProperty(Tone.Part.prototype, "loopStart", {
	get : function(){
		return Tone.Ticks(this._loopStart).toSeconds();
	},
	set : function(loopStart){
		this._loopStart = this.toTicks(loopStart);
		if (this._loop){
			this._forEach(function(event){
				event.loopStart = this.loopStart;
				this._testLoopBoundries(event);
			});
		}
	}
});

/**
 * 	The playback rate of the part
 *  @memberOf Tone.Part#
 *  @type {Positive}
 *  @name playbackRate
 */
Object.defineProperty(Tone.Part.prototype, "playbackRate", {
	get : function(){
		return this._playbackRate;
	},
	set : function(rate){
		this._playbackRate = rate;
		this._setAll("playbackRate", rate);
	}
});

/**
 * 	The number of scheduled notes in the part.
 *  @memberOf Tone.Part#
 *  @type {Positive}
 *  @name length
 *  @readOnly
 */
Object.defineProperty(Tone.Part.prototype, "length", {
	get : function(){
		return this._events.length;
	}
});

/**
 *  Clean up
 *  @return  {Tone.Part}  this
 */
Tone.Part.prototype.dispose = function(){
	Tone.Event.prototype.dispose.call(this);
	this.removeAll();
	this.callback = null;
	this._events = null;
	return this;
};

export default Tone.Part;

