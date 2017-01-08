define(["Tone/core/Tone", "Tone/type/TimeBase"], function (Tone) {

	/**
	 *  @class Tone.Frequency is a primitive type for encoding Frequency values. 
	 *         Eventually all time values are evaluated to hertz
	 *         using the `eval` method. 
	 *  @constructor
	 *  @extends {Tone.TimeBase}
	 *  @param  {String|Number}  val    The time value.
	 *  @param  {String=}  units  The units of the value.
	 *  @example
	 * Tone.Frequency("C3").eval() // 261
	 * Tone.Frequency(38, "midi").eval() //
	 * Tone.Frequency("C3").transpose(4).eval();
	 */
	Tone.Frequency = function(val, units){
		if (this instanceof Tone.Frequency){
			
			Tone.TimeBase.call(this, val, units);

		} else {
			return new Tone.Frequency(val, units);
		}
	};

	Tone.extend(Tone.Frequency, Tone.TimeBase);

	///////////////////////////////////////////////////////////////////////////
	//	AUGMENT BASE EXPRESSIONS
	///////////////////////////////////////////////////////////////////////////

	//clone the expressions so that 
	//we can add more without modifying the original
	Tone.Frequency.prototype._primaryExpressions = Object.create(Tone.TimeBase.prototype._primaryExpressions);

	/*
	 *  midi type primary expression
	 *  @type {Object}
	 *  @private
	 */
	Tone.Frequency.prototype._primaryExpressions.midi = {
		regexp : /^(\d+(?:\.\d+)?midi)/,
		method : function(value){
			return this.midiToFrequency(value);
		}	
	};

	/*
	 *  note type primary expression
	 *  @type {Object}
	 *  @private
	 */
	Tone.Frequency.prototype._primaryExpressions.note = {
		regexp : /^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i,
		method : function(pitch, octave){
			var index = noteToScaleIndex[pitch.toLowerCase()];
			var noteNumber = index + (parseInt(octave) + 1) * 12;
			return this.midiToFrequency(noteNumber);
		}	
	};

	/*
	 *  BeatsBarsSixteenths type primary expression
	 *  @type {Object}
	 *  @private
	 */
	Tone.Frequency.prototype._primaryExpressions.tr = {
			regexp : /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?/,
			method : function(m, q, s){
			var total = 1;
			if (m && m !== "0"){
				total *= this._beatsToUnits(this._timeSignature() * parseFloat(m));
			}
			if (q && q !== "0"){
				total *= this._beatsToUnits(parseFloat(q));
			}
			if (s && s !== "0"){
				total *= this._beatsToUnits(parseFloat(s) / 4);
			}
			return total;
		}
	};

	///////////////////////////////////////////////////////////////////////////
	//	EXPRESSIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Transposes the frequency by the given number of semitones.
	 *  @param  {Interval}  interval
	 *  @return  {Tone.Frequency} this
	 *  @example
	 * Tone.Frequency("A4").transpose(3); //"C5"
	 */
	Tone.Frequency.prototype.transpose = function(interval){
		this._expr = function(expr, interval){
			var val = expr();
			return val * this.intervalToFrequencyRatio(interval);
		}.bind(this, this._expr, interval);
		return this;
	};

	/**
	 *  Takes an array of semitone intervals and returns
	 *  an array of frequencies transposed by those intervals.
	 *  @param  {Array}  intervals
	 *  @return  {Tone.Frequency} this
	 *  @example
	 * Tone.Frequency("A4").harmonize([0, 3, 7]); //["A4", "C5", "E5"]
	 */
	Tone.Frequency.prototype.harmonize = function(intervals){
		this._expr = function(expr, intervals){
			var val = expr();
			var ret = [];
			for (var i = 0; i < intervals.length; i++){
				ret[i] = val * this.intervalToFrequencyRatio(intervals[i]);
			}
			return ret;
		}.bind(this, this._expr, intervals);
		return this;
	};

	///////////////////////////////////////////////////////////////////////////
	//	UNIT CONVERSIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Return the value of the frequency as a MIDI note
	 *  @return  {MIDI}
	 *  @example
	 * Tone.Frequency("C4").toMidi(); //60
	 */
	Tone.Frequency.prototype.toMidi = function(){
		return this.frequencyToMidi(this.eval());
	};

	/**
	 *  Return the value of the frequency in Scientific Pitch Notation
	 *  @return  {Note}
	 *  @example
	 * Tone.Frequency(69, "midi").toNote(); //"A4"
	 */
	Tone.Frequency.prototype.toNote = function(){
		var freq = this.eval();
		var log = Math.log(freq / Tone.Frequency.A4) / Math.LN2;
		var noteNumber = Math.round(12 * log) + 57;
		var octave = Math.floor(noteNumber/12);
		if(octave < 0){
			noteNumber += -12 * octave;
		}
		var noteName = scaleIndexToNote[noteNumber % 12];
		return noteName + octave.toString();
	};

	/**
	 *  Return the duration of one cycle in seconds.
	 *  @return  {Seconds}
	 */
	Tone.Frequency.prototype.toSeconds = function(){
		return 1 / this.eval();
	};

	/**
	 *  Return the value in Hertz
	 *  @return  {Frequency}
	 */
	Tone.Frequency.prototype.toFrequency = function(){
		return this.eval();
	};

	/**
	 *  Return the duration of one cycle in ticks
	 *  @return  {Ticks}
	 */
	Tone.Frequency.prototype.toTicks = function(){
		var quarterTime = this._beatsToUnits(1);
		var quarters = this.eval() / quarterTime;
		return Math.floor(quarters * Tone.Transport.PPQ);
	};

	///////////////////////////////////////////////////////////////////////////
	//	UNIT CONVERSIONS HELPERS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Returns the value of a frequency in the current units
	 *  @param {Frequency} freq
	 *  @return  {Number}
	 *  @private
	 */
	Tone.Frequency.prototype._frequencyToUnits = function(freq){
		return freq;
	};

	/**
	 *  Returns the value of a tick in the current time units
	 *  @param {Ticks} ticks
	 *  @return  {Number}
	 *  @private
	 */
	Tone.Frequency.prototype._ticksToUnits = function(ticks){
		return 1 / ((ticks * 60) / (Tone.Transport.bpm.value * Tone.Transport.PPQ));
	};

	/**
	 *  Return the value of the beats in the current units
	 *  @param {Number} beats
	 *  @return  {Number}
	 *  @private
	 */
	Tone.Frequency.prototype._beatsToUnits = function(beats){
		return 1 / Tone.TimeBase.prototype._beatsToUnits.call(this, beats);
	};

	/**
	 *  Returns the value of a second in the current units
	 *  @param {Seconds} seconds
	 *  @return  {Number}
	 *  @private
	 */
	Tone.Frequency.prototype._secondsToUnits = function(seconds){
		return 1 / seconds;
	};

	/**
	 *  The default units if none are given.
	 *  @private
	 */
	Tone.Frequency.prototype._defaultUnits = "hz";

	///////////////////////////////////////////////////////////////////////////
	//	FREQUENCY CONVERSIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Note to scale index
	 *  @type  {Object}
	 */
	var noteToScaleIndex = {
		"cbb" : -2, "cb" : -1, "c" : 0,  "c#" : 1,  "cx" : 2, 
		"dbb" : 0,  "db" : 1,  "d" : 2,  "d#" : 3,  "dx" : 4,
		"ebb" : 2,  "eb" : 3,  "e" : 4,  "e#" : 5,  "ex" : 6, 
		"fbb" : 3,  "fb" : 4,  "f" : 5,  "f#" : 6,  "fx" : 7,
		"gbb" : 5,  "gb" : 6,  "g" : 7,  "g#" : 8,  "gx" : 9,
		"abb" : 7,  "ab" : 8,  "a" : 9,  "a#" : 10, "ax" : 11,
		"bbb" : 9,  "bb" : 10, "b" : 11, "b#" : 12, "bx" : 13,
	};

	/**
	 *  scale index to note (sharps)
	 *  @type  {Array}
	 */
	var scaleIndexToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

	/**
	 *  The [concert pitch](https://en.wikipedia.org/wiki/Concert_pitch)
	 *  A4's values in Hertz. 
	 *  @type {Frequency}
	 *  @static
	 */
	Tone.Frequency.A4 = 440;

	/**
	 *  Convert a MIDI note to frequency value. 
	 *  @param  {MIDI} midi The midi number to convert.
	 *  @return {Frequency} the corresponding frequency value
	 *  @example
	 * tone.midiToFrequency(69); // returns 440
	 */
	Tone.Frequency.prototype.midiToFrequency = function(midi){
		return Tone.Frequency.A4 * Math.pow(2, (midi - 69) / 12);
	};

	/**
	 *  Convert a frequency value to a MIDI note.
	 *  @param {Frequency} frequency The value to frequency value to convert.
	 *  @returns  {MIDI}
	 *  @example
	 * tone.midiToFrequency(440); // returns 69
	 */
	Tone.Frequency.prototype.frequencyToMidi = function(frequency){
		return 69 + 12 * Math.log(frequency / Tone.Frequency.A4) / Math.LN2;
	};

	return Tone.Frequency;
});