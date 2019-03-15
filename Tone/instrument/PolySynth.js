import Tone from "../core/Tone";
import "../instrument/Synth";
import "../source/Source";

/**
 *  @class  Tone.PolySynth handles voice creation and allocation for any
 *          instruments passed in as the second paramter. PolySynth is
 *          not a synthesizer by itself, it merely manages voices of
 *          one of the other types of synths, allowing any of the
 *          monophonic synthesizers to be polyphonic.
 *
 *  @constructor
 *  @extends {Tone.Instrument}
 *  @param {number|Object} [polyphony=4] The number of voices to create
 *  @param {function} [voice=Tone.Synth] The constructor of the voices
 *                                            uses Tone.Synth by default.
 *  @param {...*}	voiceArgs	All additional arguments will be passed into the class constructor.
 *  @example
 * //a polysynth composed of 6 Voices of Synth
 * var synth = new Tone.PolySynth(6, Tone.Synth, {
 *   oscillator : {
 * 		type : "square"
 * 	}
 * }).toMaster();
 * //set the attributes using the set interface
 * synth.set("detune", -1200);
 * //play a chord
 * synth.triggerAttackRelease(["C4", "E4", "A4"], "4n");
 */
Tone.PolySynth = function(){

	var options = Tone.defaults(arguments, ["polyphony", "voice"], Tone.PolySynth);
	Tone.Instrument.call(this, options);
	options = Tone.defaultArg(options, Tone.Instrument.defaults);

	//max polyphony
	options.polyphony = Math.min(Tone.PolySynth.MAX_POLYPHONY, options.polyphony);

	/**
	 *  the array of voices
	 *  @type {Array}
	 */
	this.voices = new Array(options.polyphony);
	this.assert(options.polyphony > 0, "polyphony must be greater than 0");

	/**
	 *  The detune in cents
	 *  @type {Cents}
	 *  @signal
	 */
	this.detune = new Tone.Signal(options.detune, Tone.Type.Cents);
	this._readOnly("detune");

	//create the voices
	for (var i = 0; i < options.polyphony; i++){
		var v = new options.voice(arguments[2], arguments[3]);
		if (!(v instanceof Tone.Monophonic)){
			throw new Error("Synth constructor must be instance of Tone.Monophonic");
		}
		this.voices[i] = v;
		v.index = i;
		v.connect(this.output);
		if (v.hasOwnProperty("detune")){
			this.detune.connect(v.detune);
		}
	}
};

Tone.extend(Tone.PolySynth, Tone.Instrument);

/**
 *  the defaults
 *  @const
 *  @static
 *  @type {Object}
 */
Tone.PolySynth.defaults = {
	"polyphony" : 4,
	"volume" : 0,
	"detune" : 0,
	"voice" : Tone.Synth
};

/**
 *  Get the closest available voice, that is the
 *  one that is either the closest to the note,
 *  or has the lowest envelope value.
 *  @param {Time} time return the voice that has the lowest energy at this time.
 *  @param  {Note}  note  if there is a voice with this note, that should be returned
 *  @return  {Tone.Monophonic}  A synth voice.
 *  @private
 */
Tone.PolySynth.prototype._getClosestVoice = function(time, note){
	//play the note which has the same frequency, if that exists
	var sameNote = this.voices.find(function(voice){
		//break if it's within a small epsion of the voice's frequency
		if (Math.abs(voice.frequency.getValueAtTime(time) - Tone.Frequency(note)) < 1e-4 && 
			//and that note is currently active
			voice.getLevelAtTime(time) > 1e-5){
			return voice;
		} 
	});
	if (sameNote){
		return sameNote;
	}

	var sortedVoices = this.voices.slice().sort(function(a, b){
		//check that it's not scheduled in the future
		var aLevel = a.getLevelAtTime(time + this.blockTime);
		var bLevel = b.getLevelAtTime(time + this.blockTime);

		var silenceThresh = 1e-5;
		if (aLevel < silenceThresh){
			aLevel = 0;
		}
		if (bLevel < silenceThresh){
			bLevel = 0;
		}
		return aLevel - bLevel;
	}.bind(this));

	return sortedVoices[0];
};

/**
 *  Trigger the attack portion of the note
 *  @param  {Frequency|Array} notes The notes to play. Accepts a single
 *                                  Frequency or an array of frequencies.
 *  @param  {Time} [time=now]  The start time of the note.
 *  @param {number} [velocity=1] The velocity of the note.
 *  @returns {Tone.PolySynth} this
 *  @example
 * //trigger a chord immediately with a velocity of 0.2
 * poly.triggerAttack(["Ab3", "C4", "F5"], undefined, 0.2);
 */
Tone.PolySynth.prototype.triggerAttack = function(notes, time, velocity){
	if (!Array.isArray(notes)){
		notes = [notes];
	}
	time = this.toSeconds(time);
	notes.forEach(function(note){
		var voice = this._getClosestVoice(time, note);
		voice.triggerAttack(note, time, velocity);
		this.log("triggerAttack", voice.index, note);
	}.bind(this));
	return this;
};

/**
 *  Trigger the release of the note. Unlike monophonic instruments,
 *  a note (or array of notes) needs to be passed in as the first argument.
 *  @param  {Frequency|Array} notes The notes to play. Accepts a single
 *                                  Frequency or an array of frequencies.
 *  @param  {Time} [time=now]  When the release will be triggered.
 *  @returns {Tone.PolySynth} this
 *  @example
 * poly.triggerRelease(["Ab3", "C4", "F5"], "+2n");
 */
Tone.PolySynth.prototype.triggerRelease = function(notes, time){
	if (!Array.isArray(notes)){
		notes = [notes];
	}
	time = this.toSeconds(time);
	notes.forEach(function(note){
		var voice = this._getClosestVoice(time, note);
		this.log("triggerRelease", voice.index, note);
		voice.triggerRelease(time);
	}.bind(this));
	return this;
};

/**
 *  Trigger the attack and release after the specified duration
 *
 *  @param  {Frequency|Array} notes The notes to play. Accepts a single
 *                                  Frequency or an array of frequencies.
 *  @param  {Time} duration the duration of the note
 *  @param  {Time} [time=now]     if no time is given, defaults to now
 *  @param  {number} [velocity=1] the velocity of the attack (0-1)
 *  @returns {Tone.PolySynth} this
 *  @example
 * //trigger a chord for a duration of a half note
 * poly.triggerAttackRelease(["Eb3", "G4", "C5"], "2n");
 *  @example
 * //can pass in an array of durations as well
 * poly.triggerAttackRelease(["Eb3", "G4", "C5"], ["2n", "4n", "4n"]);
 */
Tone.PolySynth.prototype.triggerAttackRelease = function(notes, duration, time, velocity){
	time = this.toSeconds(time);
	this.triggerAttack(notes, time, velocity);
	if (Tone.isArray(duration) && Tone.isArray(notes)){
		for (var i = 0; i < notes.length; i++){
			var d = duration[Math.min(i, duration.length - 1)];
			this.triggerRelease(notes[i], time + this.toSeconds(d));
		}
	} else {
		this.triggerRelease(notes, time + this.toSeconds(duration));
	}
	return this;
};

/**
 * Sync the instrument to the Transport. All subsequent calls of
 * [triggerAttack](#triggerattack) and [triggerRelease](#triggerrelease)
 * will be scheduled along the transport.
 * @example
 * synth.sync()
 * //schedule 3 notes when the transport first starts
 * synth.triggerAttackRelease('8n', 0)
 * synth.triggerAttackRelease('8n', '8n')
 * synth.triggerAttackRelease('8n', '4n')
 * //start the transport to hear the notes
 * Transport.start()
 * @returns {Tone.Instrument} this
 */
Tone.PolySynth.prototype.sync = function(){
	this._syncMethod("triggerAttack", 1);
	this._syncMethod("triggerRelease", 1);
	return this;
};

/**
 *  Set a member/attribute of the voices.
 *  @param {Object|string} params
 *  @param {number=} value
 *  @param {Time=} rampTime
 *  @returns {Tone.PolySynth} this
 *  @example
 * poly.set({
 * 	"filter" : {
 * 		"type" : "highpass"
 * 	},
 * 	"envelope" : {
 * 		"attack" : 0.25
 * 	}
 * });
 */
Tone.PolySynth.prototype.set = function(params, value, rampTime){
	for (var i = 0; i < this.voices.length; i++){
		this.voices[i].set(params, value, rampTime);
	}
	return this;
};

/**
 *  Get the synth's attributes. Given no arguments get
 *  will return all available object properties and their corresponding
 *  values. Pass in a single attribute to retrieve or an array
 *  of attributes. The attribute strings can also include a "."
 *  to access deeper properties.
 *  @param {Array=} params the parameters to get, otherwise will return
 *  					   all available.
 */
Tone.PolySynth.prototype.get = function(params){
	return this.voices[0].get(params);
};

/**
 *  Trigger the release portion of all the currently active voices.
 *  @param {Time} [time=now] When the notes should be released.
 *  @return {Tone.PolySynth} this
 */
Tone.PolySynth.prototype.releaseAll = function(time){
	time = this.toSeconds(time);
	this.voices.forEach(function(voice){
		voice.triggerRelease(time);
	});
	return this;
};

/**
 *  Clean up.
 *  @returns {Tone.PolySynth} this
 */
Tone.PolySynth.prototype.dispose = function(){
	Tone.Instrument.prototype.dispose.call(this);
	this.voices.forEach(function(voice){
		voice.dispose();
	});
	this._writable("detune");
	this.detune.dispose();
	this.detune = null;
	this.voices = null;
	return this;
};

/**
 *  The maximum number of notes that can be allocated
 *  to a polysynth.
 *  @type  {Number}
 *  @static
 */
Tone.PolySynth.MAX_POLYPHONY = 20;

export default Tone.PolySynth;

