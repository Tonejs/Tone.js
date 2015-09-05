define(["Tone/core/Tone", "Tone/structure/Note", "Tone/core/Type", "Tone/core/Transport"], function (Tone) {

	"use strict";
	
	/**
	 *  @class Tone.Part is a collection Tone.Notes which can be
	 *         started/stoped and looped as a single unit.
	 *
	 *  @example
	 * var part = new Tone.Part(function(time, note){
	 * 	synth.triggerAttackRelease(note, "8n", time);
	 * }, [[0, "C2"], ["0:2", "C3"], ["0:3:2", "G2"]]).start();
	 *  @example
	 * //use JSON as long as the object has a "time" attribute
	 * var part = new Tone.Part(function(time, value){
	 * 	synth.triggerAttackRelease(value.note, "8n", time, value.velocity);
	 * }, [{"time" : 0, "note" : "C3", "velocity": 0.9}, 
	 * 	   {"time" : "0:2", "note" : "C4", "velocity": 0.5}
	 * ]).start();
	 */
	Tone.Part = function(){

		var options = this.optionsObject(arguments, ["callback", "notes"], Tone.Part.defaults);

		/**
		 *  If the part is looping or not
		 *  @type  {Boolean|Positive}
		 *  @private
		 */
		this._loop = options.loop;

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
		 *  The playback rate of the part
		 *  @type  {Positive}
		 *  @private
		 */
		this._playbackRate = 1;

		/**
		 *  Keeps track of the current state
		 *  @type {Tone.TimelineState}
		 *  @private
		 */
		this._state = new Tone.TimelineState(Tone.State.Stopped);

		/**
		 *  An array of Objects. Each one
		 *  contains a note object and the relative
		 *  start time of the note.
		 *  @type  {Array}
		 *  @private
		 */
		this._notes = [];

		/**
		 *  The callback to invoke on every note
		 *  @type {Function}
		 *  @private
		 */
		this._callback = options.callback;

		//setup
		this.loopEnd = options.loopEnd;
		this.loopStart = options.loopStart;
		this.playbackRate = options.playbackRate;

		//add the notes
		var notes = this.defaultArg(options.notes, []);
		for (var i = 0; i < notes.length; i++){
			if (Array.isArray(notes[i])){
				this.add(notes[i][0], notes[i][1]);
			} else {
				this.add(notes[i]);
			}
		}
	};

	Tone.extend(Tone.Part);

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
	};

	/**
	 *  Start the part at the given time. Optionally
	 *  set an offset time.
	 *  @param  {Time}  time    When to start the part.
	 *  @param  {Time=}  offset  The offset from the start of the part
	 *                           to begin playing at.
	 *  @return  {Tone.Part}  this
	 */
	Tone.Part.prototype.start = function(time, offset){
		if (this._state.getStateAtTime(time) !== Tone.State.Started){
			this._state.setStateAtTime(Tone.State.Started, time);
			var ticks = this.toTicks(time);
			offset = this.defaultArg(offset, 0);
			offset = this.toTicks(offset);
			this._forEach(function(event){
				var startTick;
				if (this._loop){
					if (event.time >= this._loopStart && event.time < this._loopEnd){
						startTick = event.time - offset - this._loopStart;
						event.note.start(Math.round(startTick / this.playbackRate + ticks) + "i");
					}
				} else {
					startTick = event.time - offset;
					event.note.start(Math.round(startTick / this.playbackRate + ticks) + "i");
				}
			}.bind(this));
		}
		return this;
	};

	/**
	 *  Stop the part at the given time.
	 *  @param  {Time}  time  When to stop the part.
	 *  @return  {Tone.Part}  this
	 */
	Tone.Part.prototype.stop = function(time){
		if (this._state.getStateAtTime(time) === Tone.State.Started){
			this._state.setStateAtTime(Tone.State.Stopped, time);
			this._forEach(function(event){
				event.note.stop(time);
			});
		}
		return this;
	};

	/**
	 *  Add a note or part to the part. 
	 *  @param {Time|Object} time The time the note should start.
	 *                            If an object is passed in, it should
	 *                            have a 'time' attribute and the rest
	 *                            of the object will be used as the 'value'.
	 *  @param  {Tone.Note|Tone.Part|*}  value 
	 *  @example
	 * part.add("1m", "C#+11");
	 *  @example
	 * part.add({
	 * 	"time" : "1m",
	 * 	"chord" : "C#+11",
	 * });
	 */
	Tone.Part.prototype.add = function(time, value){
		//extract the parameters
		if (typeof time === "object" && time.hasOwnProperty("time")){
			value = time;
			time = value.time;
		}
		time = this.toTicks(time);
		var note;
		if (value instanceof Tone.Note || value instanceof Tone.Part){
			note = value;
			note._callback = this._tick.bind(this);
		} else {
			note = new Tone.Note(this._tick.bind(this), value);
		}
		//initialize the stuff
		note.playbackRate *= this._playbackRate;
		note.loopStart = 0;
		note.loopEnd = this.loopEnd;
		note.loop = this.loop;
		//add it to the notes
		this._notes.push({
			"time" : time,
			"note" : note
		});
		return this;
	};

	/**
	 *  Remove a note from the part. 
	 */
	Tone.Part.prototype.remove = function(time, value){
		//extract the parameters
		if (typeof time === "object" && time.hasOwnProperty("time")){
			value = time;
			time = value.time;
		} 
		this._forEach(function(event, index){
			if (event.time === time && event.note.value === value){
				this._notes.splice(index, 1);
				event.note.dispose();
			}
		});
		return this;
	};

	/**
	 *  Remove all of the notes from the group. 
	 *  @return  {Tone.Part}  this
	 */
	Tone.Part.prototype.clear = function(){
		this._forEach(function(event){
			event.note.dispose();
		});
		this._notes = [];
		return this;
	};

	/**
	 *  Cancel scheduled state change events: i.e. "start" and "stop".
	 *  @param {Time} after The time after which to cancel the scheduled events.
	 *  @return  {Tone.Part}  this
	 */
	Tone.Part.prototype.cancel = function(after){
		this._forEach(function(event){
			event.note.cancel(after);
		});
		this._state.cancel(after);
		return this;
	};

	/**
	 *  Iterate over all of the notes
	 *  @param {Function} callback
	 *  @private
	 */
	Tone.Part.prototype._forEach = function(callback){
		for (var i = this._notes.length - 1; i >= 0; i--){
			callback(this._notes[i], i);
		}
		return this;
	};

	/**
	 *  Internal tick method
	 *  @param  {Number}  time  The time of the event in seconds
	 *  @private
	 */
	Tone.Part.prototype._tick = function(time, value){
		console.log(time, value, this._state.getStateAtTime(time));
		if (this._state.getStateAtTime(time) === Tone.State.Started){
			this._callback(time, value);
		}
	};

	/**
	 *  If the note should loop or not
	 *  between Tone.Part.loopStart and 
	 *  Tone.Part.loopEnd. An integer
	 *  value corresponds to the number of
	 *  loops the Part does after it starts.
	 *  @memberOf Tone.Part#
	 *  @type {Boolean|Positive}
	 *  @name loop
	 */
	Object.defineProperty(Tone.Part.prototype, "loop", {
		get : function(){
			return this._loop;
		},
		set : function(loop){
			this._loop = loop;
			this._forEach(function(event){
				event.note.loop = loop;
			});
			this.loopEnd = this._loopEnd + "i";
			this.loopStart = this._loopStart + "i";
		}
	});

	/**
	 *  The loopEnd point determines when it will 
	 *  loop if Tone.Part.loop is true.
	 *  @memberOf Tone.Part#
	 *  @type {Boolean|Positive}
	 *  @name loopEnd
	 */
	Object.defineProperty(Tone.Part.prototype, "loopEnd", {
		get : function(){
			return this.toNotation(this._loopEnd + "i");
		},
		set : function(loopEnd){
			this._loopEnd = this.toTicks(loopEnd);
			if (this._loop){
				this._forEach(function(event){
					event.note.loopEnd = (this._loopEnd - this._loopStart) + "i";
					if (event.note.time > this._loopEnd){
						event.note.cancel();
					}
				}.bind(this));
			}
		}
	});

	/**
	 *  The loopStart point determines when it will 
	 *  loop if Tone.Part.loop is true.
	 *  @memberOf Tone.Part#
	 *  @type {Boolean|Positive}
	 *  @name loopStart
	 */
	Object.defineProperty(Tone.Part.prototype, "loopStart", {
		get : function(){
			return this.toNotation(this._loopStart + "i");
		},
		set : function(loopStart){
			this._loopStart = this.toTicks(loopStart);
			if (this._loop){
				this._forEach(function(event){
					event.note.loopEnd = (this._loopEnd - this._loopStart) + "i";
					if (event.note.time <= this._loopStart){
						event.note.cancel();
					}
				}.bind(this));
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
			this._forEach(function(event){
				var ratio = event.note.playbackRate / this._playbackRate;
				event.note.playbackRate = rate * ratio;
			}.bind(this));
			this._playbackRate = rate;

		}
	});

	/**
	 *  The current progress of the loop interval.
	 *  0 if the note is not started yet or the 
	 *  part is not set to loop.
	 *  @memberOf Tone.Part#
	 *  @type {NormalRange}
	 *  @name progress
	 *  @readOnly
	 */
	Object.defineProperty(Tone.Part.prototype, "progress", {
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
	 *  @return  {Tone.Part}  this
	 */
	Tone.Part.prototype.dispose = function(){
		this._callback = null;
		this.clear();
		this._notes = null;
		return this;
	};

	return Tone.Part;
});