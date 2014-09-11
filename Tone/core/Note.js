define(["Tone/core/Tone", "Tone/core/Transport"], function(Tone){

	"use strict";

	/**
	 *  @class  A timed note. Creating a note will register a callback 
	 *          which will be invoked on the channel at the time with
	 *          whatever value was specified. 
	 *
	 *  @constructor
	 *  @param {number|string} channel the channel name of the note
	 *  @param {Tone.Time} time the time when the note will occur
	 *  @param {string|number|Object|Array} value the value of the note
	 */
	Tone.Note = function(channel, time, value){

		/**
		 *  the value of the note. This value is returned
		 *  when the channel callback is invoked.
		 *  
		 *  @type {string|number|Object}
		 */
		this.value = value;

		/**
		 *  the channel name or number
		 *  
		 *  @type {string|number}
		 *  @private
		 */
		this._channel = channel;

		/**
		 *  an internal reference to the id of the timeline
		 *  callback which is set. 
		 *  
		 *  @type {number}
		 *  @private
		 */
		this._timelineID = Tone.Transport.setTimeline(this._trigger.bind(this), time);
	};

	/**
	 *  invoked by the timeline
	 *  @private
	 *  @param {number} time the time at which the note should play
	 */
	Tone.Note.prototype._trigger = function(time){
		//invoke the callback
		channelCallbacks(this._channel, time, this.value);
	};

	/**
	 *  clean up
	 */
	Tone.Note.prototype.dispose = function(){ 
		Tone.Tranport.clearTimeline(this._timelineID);
		this.value = null;
	};

	/**
	 *  @private
	 *  @static
	 *  @type {Object}
	 */
	var NoteChannels = {};

	/**
	 *  invoke all of the callbacks on a specific channel
	 *  @private
	 */
	function channelCallbacks(channel, time, value){
		if (NoteChannels.hasOwnProperty(channel)){
			var callbacks = NoteChannels[channel];
			for (var i = 0, len = callbacks.length; i < len; i++){
				var callback = callbacks[i];
				if (Array.isArray(value)){
					callback.apply(window, [time].concat(value));
				} else {
					callback(time, value);
				}
			}
		}
	}

	/**
	 *  listen to a specific channel, get all of the note callbacks
	 *  @static
	 *  @param {string|number} channel the channel to route note events from
	 *  @param {function(*)} callback callback to be invoked when a note will occur
	 *                                        on the specified channel
	 */
	Tone.Note.route = function(channel, callback){
		if (NoteChannels.hasOwnProperty(channel)){
			NoteChannels[channel].push(callback);
		} else {
			NoteChannels[channel] = [callback];
		}
	};

	/**
	 *  remove a callback from a channel
	 *  @static
	 */
	Tone.Note.unroute = function(channel, callback){
		if (NoteChannels.hasOwnProperty(channel)){
			var channelCallback = NoteChannels[channel];
			var index = channelCallback.indexOf(callback);
			if (index !== -1){
				NoteChannels[channel].splice(index, 1);
			}
		}
	};

	/**
	 *  Parses a score and registers all of the notes along the timeline. 
	 *
	 *  Scores are a JSON object with instruments at the top level
	 *  and an array of time and values. The value of a note can be 0 or more 
	 *  parameters. 
	 *
	 *  To convert MIDI files to score notation, take a look at utils/MidiToScore.js
	 *
	 *  @example
	 *  var score = { 
	 *  	"synth"  : [["0", "C3"], ["0:1", "D3"], ["0:2", "E3"], ... ],
	 *  	"bass"  : [["0", "C2"], ["1:0", "A2"], ["2:0", "C2"], ["3:0", "A2"], ... ],
	 *  	"drums"  : [["0", "kick"], ["0:2", "snare"], ["1:0", "kick"], ["1:2", "snare"], ... ],
	 *  	...
	 *  };
	 *
	 *  @static
	 *  @param {Object} score
	 *  @return {Array<Tone.Note>} an array of all of the notes that were created
	 */
	Tone.Note.parseScore = function(score){
		var notes = [];
		for (var inst in score){
			var part = score[inst];
			if (Array.isArray(part)){
				for (var i = 0; i < part.length; i++){
					var noteDescription = part[i];
					var note;
					if (Array.isArray(noteDescription)){
						var time = noteDescription[0];
						var value = noteDescription.slice(1);
						note = new Tone.Note(inst, time, value);
					} else {
						note = new Tone.Note(inst, noteDescription);
					}
					notes.push(note);
				}
			} else {
				throw new TypeError("score parts must be Arrays");
			}
		}
		return notes;
	};

	///////////////////////////////////////////////////////////////////////////
	//	MUSIC NOTES
	//	
	//	Augments Tone.prototype to include note methods
	///////////////////////////////////////////////////////////////////////////

	var noteToIndex = { "c" : 0, "c#" : 1, "db" : 1, "d" : 2, "d#" : 3, "eb" : 3, 
		"e" : 4, "f" : 5, "f#" : 6, "gb" : 6, "g" : 7, "g#" : 8, "ab" : 8, 
		"a" : 9, "a#" : 10, "bb" : 10, "b" : 11
	};

	var noteIndexToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

	var middleC = 261.6255653005986;

	/**
	 *  convert a note name to frequency (i.e. A4 to 440)
	 *  @param  {string} note
	 *  @return {number}         
	 */
	Tone.prototype.noteToFrequency = function(note){
		//break apart the note by frequency and octave
		var parts = note.split(/(\d+)/);
		if (parts.length === 3){
			var index = noteToIndex[parts[0].toLowerCase()];
			var octave = parts[1];
			var noteNumber = index + parseInt(octave, 10) * 12;
			return Math.pow(2, (noteNumber - 48) / 12) * middleC;
		} else {
			return 0;
		}
	};

	/**
	 *  convert a note name (i.e. A4, C#5, etc to a frequency)
	 *  @param  {number} freq
	 *  @return {string}         
	 */
	Tone.prototype.frequencyToNote = function(freq){
		var log = Math.log(freq / middleC) / Math.LN2;
		var noteNumber = Math.round(12 * log) + 48;
		var octave = Math.floor(noteNumber/12);
		var noteName = noteIndexToNote[noteNumber % 12];
		return noteName + octave.toString();
	};

	/**
	 *  convert a midi note number into a note name
	 *
	 *  @example
	 *  tone.midiToNote(60) => "C3"
	 *  
	 *  @param  {[type]} midiNumber [description]
	 *  @return {[type]}            [description]
	 */
	Tone.prototype.midiToNote = function(midiNumber){
		var octave = Math.floor(midiNumber / 12) - 2;
		var note = midiNumber % 12;
		return noteIndexToNote[note] + octave;
	};

	return Tone.Note;
});