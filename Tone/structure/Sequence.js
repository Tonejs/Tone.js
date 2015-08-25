define(["Tone/core/Tone", "Tone/structure/Group", "Tone/core/Transport"], function (Tone) {

	"use strict";

	/**
	 *  @class A sequence is an alternate notation of a part. Instead
	 *         of passing in an array of [time, event] pairs, pass
	 *         in an array of events which will be parsed
	 *         as quarter note events. Subdivisions are given
	 *         as sub arrays. Sequence notation inspiration from [Tidal](http://yaxu.org/tidal/)
	 *  @param  {Function}  callback  The callback to invoke with every note
	 *  @param  {Array}    sequence  The sequence
	 *  @extends {Tone.Part}
	 *  @example
	 * //straight quater notes
	 * var seq = new Tone.Sequence(function(time, note){
	 * 	console.log(note);
	 * }, ["C4", "E4", "G4", "A4"]);
	 *  @example
	 * //subdivisions are given as subarrays
	 * var seq = new Tone.Sequence(function(time, note){
	 * 	console.log(note);
	 * }, ["C4", "E4", "G4", ["A4", "G4"]]);
	 * @example
	 * //A sequence with objects which are converted into Atoms
	 * var seq = new Tone.Sequence(function(time, val){
	 * 
	 * }, [{"note" : "C4", "probability" : 1}, 
	 * 	   {"note" : "E4", "probability" : 0.8}, 
	 * 	   {"note" : "G4", "probability" : 0.6}, 
	 * 	   [{"note" : "A4", "probability" : 0.8}, 
	 * 	   	{"note" : "G4", "probability" : 0.1}
	 * 	   ]
	 * 	  ]);
	 */
	Tone.Sequence = function(callback, sequence){

		this._sequence = sequence;

		var notes = this._parseSequence(sequence, Tone.Transport.PPQ, 0);

		Tone.Part.call(this, callback, notes);
	};

	Tone.extend(Tone.Sequence, Tone.Part);

	/**
	 *  Parse an array into [time, value] pairs
	 *  @param  {Array}  seq  The sequence to parse
	 *  @param  {Ticks}  subdiv  The current subdivision at that tick level
	 *  @param  {Ticks}  offset  The offset from the 
	 *  @return  {Array}  An array of notes in the form of [time, value]
	 */
	Tone.Sequence.prototype._parseSequence = function(seq, subdiv, offset){
		var notes = [];
		for (var i = 0; i < seq.length; i++){
			if (Array.isArray(seq[i])){
				var subSeq = seq[i];
				notes = notes.concat(this._parseSequence(subSeq, subdiv / subSeq.length, offset));
			} else if (seq[i] !== null){
				notes.push([Math.round(offset) + "i", seq[i]]);
			}
			offset+=subdiv;
		}
		return notes;
	};

	/**
	 *  The sequence to play
	 *  @memberOf Tone.Sequence#
	 *  @type {Array}
	 *  @name sequence
	 */
	Object.defineProperty(Tone.Sequence.prototype, "sequence", {
		get : function(){
			return this._sequence;
		},
		set : function(seq){
			//clear the current notes
			this.clear();
			//set the notes
			var notes = this._parseSequence(seq, Tone.Transport.PPQ, 0);
			for (var i = 0; i < notes.length; i++){
				this.add.apply(this, notes[i]);
			}
		}
	});

	/**
	 *  Clean up.
	 *  @return {Tone.Sequence} this
	 */
	Tone.Sequence.prototype.dispose = function(){
		Tone.Part.prototype.dispose.call(this);
		this._sequence = null;
		return this;
	};

	return Tone.Sequence;
});