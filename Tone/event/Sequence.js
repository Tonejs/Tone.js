define(["Tone/core/Tone", "Tone/event/Part", "Tone/core/Transport"], function (Tone) {

	"use strict";

	/**
	 *  @class A sequence is an alternate notation of a part. Instead
	 *         of passing in an array of [time, event] pairs, pass
	 *         in an array of events which will be spaced at the
	 *         given subdivision. Sub-arrays will subdivide that beat
	 *         by the number of items are in the array. 
	 *         Sequence notation inspiration from [Tidal](http://yaxu.org/tidal/)
	 *  @param  {Function}  callback  The callback to invoke with every note
	 *  @param  {Array}    events  The sequence
	 *  @param  {Time} subdivision  The subdivision between which events are placed. 
	 *  @extends {Tone.Part}
	 *  @example
	 * var seq = new Tone.Sequence(function(time, note){
	 * 	console.log(note);
	 * //straight quater notes
	 * }, ["C4", "E4", "G4", "A4"], "4n");
	 *  @example
	 * var seq = new Tone.Sequence(function(time, note){
	 * 	console.log(note);
	 * //subdivisions are given as subarrays
	 * }, ["C4", ["E4", "D4", "E4"], "G4", ["A4", "G4"]]);
	 */
	Tone.Sequence = function(){

		var options = this.optionsObject(arguments, ["callback", "events", "subdivision"], Tone.Sequence.defaults);

		//remove the events
		var events = options.events;
		delete options.events;

		Tone.Part.call(this, options);

		/**
		 *  The subdivison of each note
		 *  @type  {Ticks}
		 *  @private
		 */
		this._subdivision = this.toTicks(options.subdivision);

		//if no time was passed in, the loop end is the end of the cycle
		if (this.isUndef(options.loopEnd) && !this.isUndef(events)){
			this._loopEnd = (events.length * this._subdivision);
		} 
		//defaults to looping
		this._loop = true;

		//add all of the events
		if (!this.isUndef(events)){
			for (var i = 0; i < events.length; i++){
				this.add(i, events[i]);
			}
		}
	};

	Tone.extend(Tone.Sequence, Tone.Part);

	/**
	 *  The default values.
	 *  @type  {Object}
	 */
	Tone.Sequence.defaults = {
		"subdivision" : "4n",
	};

	/**
	 *  The subdivision of the sequence. This can only be 
	 *  set in the constructor. The subdivision is the 
	 *  interval between successive steps. 
	 *  @type {Time}
	 *  @memberOf Tone.Sequence#
	 *  @name subdivision
	 *  @readOnly
	 */
	Object.defineProperty(Tone.Sequence.prototype, "subdivision", {
		get : function(){
			return Tone.Time(this._subdivision, "i").toNotation();
		}
	});

	/**
	 *  Get/Set an index of the sequence. If the index contains a subarray, 
	 *  a Tone.Sequence representing that sub-array will be returned. 
	 *  @example
	 * var sequence = new Tone.Sequence(playNote, ["E4", "C4", "F#4", ["A4", "Bb3"]])
	 * sequence.at(0)// => returns "E4"
	 * //set a value
	 * sequence.at(0, "G3");
	 * //get a nested sequence
	 * sequence.at(3).at(1)// => returns "Bb3"
	 * @param {Positive} index The index to get or set
	 * @param {*} value Optionally pass in the value to set at the given index.
	 */
	Tone.Sequence.prototype.at = function(index, value){
		//if the value is an array, 
		if (this.isArray(value)){
			//remove the current event at that index
			this.remove(index);
		}
		//call the parent's method
		return Tone.Part.prototype.at.call(this, this._indexTime(index), value);
	};

	/**
	 *  Add an event at an index, if there's already something
	 *  at that index, overwrite it. If `value` is an array, 
	 *  it will be parsed as a subsequence.
	 *  @param {Number} index The index to add the event to
	 *  @param {*} value The value to add at that index
	 *  @returns {Tone.Sequence} this
	 */
	Tone.Sequence.prototype.add = function(index, value){
		if (value === null){
			return this;
		}
		if (this.isArray(value)){
			//make a subsequence and add that to the sequence
			var subSubdivision = Math.round(this._subdivision / value.length);
			value = new Tone.Sequence(this._tick.bind(this), value, Tone.Time(subSubdivision, "i"));
		} 
		Tone.Part.prototype.add.call(this, this._indexTime(index), value);
		return this;
	};

	/**
	 *  Remove a value from the sequence by index
	 *  @param {Number} index The index of the event to remove
	 *  @returns {Tone.Sequence} this
	 */
	Tone.Sequence.prototype.remove = function(index, value){
		Tone.Part.prototype.remove.call(this, this._indexTime(index), value);
		return this;
	};

	/**
	 *  Get the time of the index given the Sequence's subdivision
	 *  @param  {Number}  index 
	 *  @return  {Time}  The time of that index
	 *  @private
	 */
	Tone.Sequence.prototype._indexTime = function(index){
		if (index instanceof Tone.TransportTime){
			return index;
		} else {
			return Tone.TransportTime(index * this._subdivision + this.startOffset, "i");
		}
	};

	/**
	 *  Clean up.
	 *  @return {Tone.Sequence} this
	 */
	Tone.Sequence.prototype.dispose = function(){
		Tone.Part.prototype.dispose.call(this);
		return this;
	};

	return Tone.Sequence;
});