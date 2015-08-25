define(["Tone/core/Tone", "Tone/structure/Atom", "Tone/core/Types", "Tone/core/Transport"], function (Tone) {

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
	Tone.Part = function(callback, atoms){

		/**
		 *  When the atom is scheduled to start.
		 *  @type  {Number}
		 *  @private
		 */
		this._loopStart = 0;

		/**
		 *  When the atom is scheduled to start.
		 *  @type  {Number}
		 *  @private
		 */
		this._loopEnd = this.toTicks("1m");

		/**
		 *  The time the part was started
		 *  @type {Ticks}
		 *  @private
		 */
		this._startTick = -1;

		/**
		 *  An array of Objects. Each one
		 *  contains a atom object and the relative
		 *  start time of the atom.
		 *  @type  {Array}
		 *  @private
		 */
		this._atoms = [];

		/**
		 *  The callback to invoke on every atom
		 *  @type {Function}
		 *  @private
		 */
		this._callback = callback;

		for (var i = 0; i < atoms.length; i++){
			this.add.apply(this, atoms[i]);
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
		if (this._startTick === -1){
			this._startTick = this.toTicks(time);
			offset = this.defaultArg(offset, 0);
			offset = this.toTicks(offset);
			for (var i = 0; i < this._atoms.length; i++){
				var event = this._atoms[i];
				if (event.time >= offset){
					event.atom.start(Math.round((event.time - offset) / this.playbackRate + this._startTick) + "i");
				}
			}
		}
		return this;
	};

	/**
	 *  Stop the part at the given time.
	 *  @param  {Time}  time  When to stop the part.
	 *  @return  {Tone.Part}  this
	 */
	Tone.Part.prototype.stop = function(time){
		if (this._startTick !== -1){
			this._startTick = -1;
			for (var i = 0; i < this._atoms.length; i++){
				this._atoms[i].atom.stop(time);
			}
		}
		return this;
	};

	/**
	 *  Add a atom or part to the part. 
	 *  @param {Time|Object} time The time the atom should start.
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
		if (value instanceof Tone.Note || value instanceof Tone.Part){
			value._callback = this._callback;
			this._atoms.push({
				"time" : time,
				"atom" : value
			});
		} else {
			var atom = new Tone.Note(this._callback, value);
			this._atoms.push({
				"time" : time,
				"atom" : atom
			});
		}
		return this;
	};

	/**
	 *  Remove a atom from the part. 
	 */
	Tone.Part.prototype.remove = function(time, value){
		//extract the parameters
		if (typeof time === "object" && time.hasOwnProperty("time")){
			value = time;
			time = value.time;
		} 
		for (var i = 0; i < this._atoms.length; i++){
			var event = this._atoms[i];
			if (event.time === time && event.atom.value === value){
				this._atoms.splice(i, 1);
				event.atom.dispose();
				break;
			}
		}
		return this;
	};

	/**
	 *  Remove all of the atoms from the group. 
	 *  @return  {Tone.Part}  this
	 */
	Tone.Part.prototype.clear = function(){
		for (var i = 0; i < this._atoms.length; i++){
			this._atoms[i].atom.dispose();
		}
		return this;
	};

	/**
	 *  If the atom should loop or not
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
			for (var i = 0; i < this._atoms.length; i++){
				var event = this._atoms[i];
				if (event.time >= this._loopStart && event.time < this._loopEnd){
					event.atom.loopEnd = (this._loopEnd - this._loopStart) + "i";
					event.atom.loop = true;
				} else if (this._startTick !== -1){
					event.atom.stop();
				}
			}
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
			//reset the loop
			this._loopEnd = this.toTicks(loopEnd);
			this.loop = this._loop;
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
			//reset the loop
			this._loopStart = this.toTicks(loopStart);
			this.loop = this._loop;
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
			return this._atoms[0].atom.playbackRate;
		},
		set : function(rate){
			for (var i = 0; i < this._atoms.length; i++){
				var event = this._atoms[i];
				//if it's started, move the start position based on the rate
				if (this._startTick !== -1){
					event.atom._startTick = Math.round((event.time) / rate + this._startTick);
				}
				event.atom.playbackRate = rate;
			}
		}
	});

	/**
	 *  The current progress of the loop interval.
	 *  0 if the atom is not started yet or the 
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
		this._atoms = null;
		return this;
	};

	return Tone.Part;
});