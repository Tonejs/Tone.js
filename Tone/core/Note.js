define(["Tone/core/Tone", "Tone/core/Transport"], function(Tone){

	"use strict";

	/**
	 *  @class  A timed note. Creating a note will register a callback 
	 *          which will be invoked on the channel at the time with
	 *          whatever value was specified. 
	 *
	 *  @constructor
	 *  @param {number|string} channel the channel name of the note
	 *  @param {Time} time the time when the note will occur
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
	 *  @returns {Tone.Note} this
	 */
	Tone.Note.prototype.dispose = function(){ 
		Tone.Transport.clearTimeline(this._timelineID);
		this.value = null;
		return this;
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
	 *  Remove a previously routed callback from a channel. 
	 *  @static
	 *  @param {string|number} channel The channel to unroute note events from
	 *  @param {function(*)} callback Callback which was registered to the channel.
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
	 *  <br><br>
	 *  Scores are a JSON object with instruments at the top level
	 *  and an array of time and values. The value of a note can be 0 or more 
	 *  parameters. 
	 *  <br><br>
	 *  The only requirement for the score format is that the time is the first (or only)
	 *  value in the array. All other values are optional and will be passed into the callback
	 *  function registered using `Note.route(channelName, callback)`.
	 *  <br><br>
	 *  To convert MIDI files to score notation, take a look at utils/MidiToScore.js
	 *
	 *  @example
	 * //an example JSON score which sets up events on channels
	 * var score = { 
	 * 	"synth"  : [["0", "C3"], ["0:1", "D3"], ["0:2", "E3"], ... ],
	 * 	"bass"  : [["0", "C2"], ["1:0", "A2"], ["2:0", "C2"], ["3:0", "A2"], ... ],
	 * 	"kick"  : ["0", "0:2", "1:0", "1:2", "2:0", ... ],
	 * 	//...
	 * };
	 * //parse the score into Notes
	 * Tone.Note.parseScore(score);
	 * //route all notes on the "synth" channel
	 * Tone.Note.route("synth", function(time, note){
	 * 	//trigger synth
	 * });
	 *  @static
	 *  @param {Object} score
	 *  @return {Array} an array of all of the notes that were created
	 */
	Tone.Note.parseScore = function(score){
		var notes = [];
		for (var inst in score){
			var part = score[inst];
			if (inst === "tempo"){
				Tone.Transport.bpm.value = part;
			} else if (inst === "timeSignature"){
				Tone.Transport.timeSignature = part[0] / (part[1] / 4);
			} else if (Array.isArray(part)){
				for (var i = 0; i < part.length; i++){
					var noteDescription = part[i];
					var note;
					if (Array.isArray(noteDescription)){
						var time = noteDescription[0];
						var value = noteDescription.slice(1);
						note = new Tone.Note(inst, time, value);
					} else if (typeof noteDescription === "object"){
						note = new Tone.Note(inst, noteDescription.time, noteDescription);
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

	return Tone.Note;
});