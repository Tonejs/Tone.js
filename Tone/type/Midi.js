import Tone from "../core/Tone";
import "../type/Frequency";

/**
 *  @class Tone.Midi is a primitive type for encoding Time values.
 *         Tone.Midi can be constructed with or without the `new` keyword. Tone.Midi can be passed
 *         into the parameter of any method which takes time as an argument.
 *  @constructor
 *  @extends {Tone.Frequency}
 *  @param  {String|Number}  val    The time value.
 *  @param  {String=}  units  The units of the value.
 *  @example
 * var t = Tone.Midi("4n");//a quarter note
 */
Tone.Midi = function(val, units){
	if (this instanceof Tone.Midi){

		Tone.Frequency.call(this, val, units);

	} else {
		return new Tone.Midi(val, units);
	}
};

Tone.extend(Tone.Midi, Tone.Frequency);

/**
 *  The default units if none are given.
 *  @type {String}
 *  @private
 */
Tone.Midi.prototype._defaultUnits = "midi";

/**
 *  Returns the value of a frequency in the current units
 *  @param {Frequency} freq
 *  @return  {Number}
 *  @private
 */
Tone.Midi.prototype._frequencyToUnits = function(freq){
	return Tone.Frequency.ftom(Tone.Frequency.prototype._frequencyToUnits.call(this, freq));
};

/**
 *  Returns the value of a tick in the current time units
 *  @param {Ticks} ticks
 *  @return  {Number}
 *  @private
 */
Tone.Midi.prototype._ticksToUnits = function(ticks){
	return Tone.Frequency.ftom(Tone.Frequency.prototype._ticksToUnits.call(this, ticks));
};

/**
 *  Return the value of the beats in the current units
 *  @param {Number} beats
 *  @return  {Number}
 *  @private
 */
Tone.Midi.prototype._beatsToUnits = function(beats){
	return Tone.Frequency.ftom(Tone.Frequency.prototype._beatsToUnits.call(this, beats));
};

/**
 *  Returns the value of a second in the current units
 *  @param {Seconds} seconds
 *  @return  {Number}
 *  @private
 */
Tone.Midi.prototype._secondsToUnits = function(seconds){
	return Tone.Frequency.ftom(Tone.Frequency.prototype._secondsToUnits.call(this, seconds));
};

/**
 *  Return the value of the frequency as a MIDI note
 *  @return  {MIDI}
 *  @example
 * Tone.Midi(60).toMidi(); //60
 */
Tone.Midi.prototype.toMidi = function(){
	return this.valueOf();
};

/**
 *  Return the value of the frequency as a MIDI note
 *  @return  {MIDI}
 *  @example
 * Tone.Midi(60).toFrequency(); //261.6255653005986
 */
Tone.Midi.prototype.toFrequency = function(){
	return Tone.Frequency.mtof(this.toMidi());
};

/**
 *  Transposes the frequency by the given number of semitones.
 *  @param  {Interval}  interval
 *  @return  {Tone.Frequency} A new transposed frequency
 *  @example
 * Tone.Midi("A4").transpose(3); //"C5"
 */
Tone.Midi.prototype.transpose = function(interval){
	return new this.constructor(this.toMidi() + interval);
};

export default Tone.Midi;

