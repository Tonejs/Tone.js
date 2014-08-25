define(["Tone/core/Tone", "Tone/core/Transport"], function(Tone){

	"use strict";

	/**
	 *  @class  A timed note. Creating a note will register a callback 
	 *          which will be invoked on the channel at the time with
	 *          whatever value was specified. 
	 *
	 *  @constructor
	 *  @param {Tone.Time} time the time when the note will occur
	 *  @param {string|number|Object} value the value of the note
	 *  @param {number|string} channel the channel name of the note
	 */
	Tone.Note = function(time, value, channel){

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
	Tone.Note.prototype._trigger = function(){
		//invoke the callback
		channelCallbacks(this._channel, this.value);
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
	function channelCallbacks(channel, note){
		if (NoteChannels.hasOwnProperty(channel)){
			var callbacks = NoteChannels[channel];
			for (var i = 0, len = callbacks.length; i < len; i++){
				callbacks[i](note);
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
	 *  parses a score and registers all of the notes
	 *
	 *  scores are a JSON object with instruments at the top level
	 *  and an array of time, value tuples
	 *
	 *  i.e. { 
	 *  	"synth"  : [["0", "C3"], ["0:1", "D3"], ["0:2", "E3"], ... ],
	 *  	"bass"  : [["0", "C2"], ["1:0", "A2"], ["2:0", "C2"], ["3:0", "A2"], ... ],
	 *  	"drums"  : [["0", "kick"], ["0:2", "snare"], ["1:0", "kick"], ["1:2", "snare"], ... ],
	 *  	...
	 *  }
	 *  @static
	 *  @param {Object} score
	 *  @return {Array<Tone.Note>} an array of all of the notes that were created
	 */
	Tone.Note.parseScore = function(score){
		var notes = [];
		for (var inst in score){
			for (var i = 0; i < inst.length; i++){
				var time = inst[i][0];
				var value = inst[i][1];
				var note = new Tone.Note(time, value, inst);
				notes.push(note);
			}
		}
		return notes;
	};

	return Tone.Note;
});