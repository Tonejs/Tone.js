import Tone from "../core/Tone";
import "../type/Time";
import "../type/Frequency";
import "../type/TransportTime";
import "../core/Context";

///////////////////////////////////////////////////////////////////////////
//	TYPES
///////////////////////////////////////////////////////////////////////////

/**
 * Units which a value can take on.
 * @enum {String}
 */
Tone.Type = {
	/**
	 *  Default units
	 *  @typedef {Default}
	 */
	Default : "number",
	/**
	 *  Time can be described in a number of ways. Read more [Time](https://github.com/Tonejs/Tone.js/wiki/Time).
	 *
	 *  * Numbers, which will be taken literally as the time (in seconds).
	 *  * Notation, ("4n", "8t") describes time in BPM and time signature relative values.
	 *  * TransportTime, ("4:3:2") will also provide tempo and time signature relative times
	 *  in the form BARS:QUARTERS:SIXTEENTHS.
	 *  * Frequency, ("8hz") is converted to the length of the cycle in seconds.
	 *  * Now-Relative, ("+1") prefix any of the above with "+" and it will be interpreted as
	 *  "the current time plus whatever expression follows".
	 *  * Object, ({"4n" : 3, "8t" : -1}). The resulting time is equal to the sum of all of the keys multiplied by the values in the object. 
	 *  * No Argument, for methods which accept time, no argument will be interpreted as
	 *  "now" (i.e. the currentTime).
	 *
	 *  @typedef {Time}
	 */
	Time : "time",
	/**
	 *  Frequency can be described similar to time, except ultimately the
	 *  values are converted to frequency instead of seconds. A number
	 *  is taken literally as the value in hertz. Additionally any of the
	 *  Time encodings can be used. Note names in the form
	 *  of NOTE OCTAVE (i.e. C4) are also accepted and converted to their
	 *  frequency value.
	 *  @typedef {Frequency}
	 */
	Frequency : "frequency",
	/**
	 *  TransportTime describes a position along the Transport's timeline. It is
	 *  similar to Time in that it uses all the same encodings, but TransportTime specifically
	 *  pertains to the Transport's timeline, which is startable, stoppable, loopable, and seekable.
	 *  [Read more](https://github.com/Tonejs/Tone.js/wiki/TransportTime)
	 *  @typedef {TransportTime}
	 */
	TransportTime : "transportTime",
	/**
	 *  Ticks are the basic subunit of the Transport. They are
	 *  the smallest unit of time that the Transport supports.
	 *  @typedef {Ticks}
	 */
	Ticks : "ticks",
	/**
	 *  Normal values are within the range [0, 1].
	 *  @typedef {NormalRange}
	 */
	NormalRange : "normalRange",
	/**
	 *  AudioRange values are between [-1, 1].
	 *  @typedef {AudioRange}
	 */
	AudioRange : "audioRange",
	/**
	 *  Decibels are a logarithmic unit of measurement which is useful for volume
	 *  because of the logarithmic way that we perceive loudness. 0 decibels
	 *  means no change in volume. -10db is approximately half as loud and 10db
	 *  is twice is loud.
	 *  @typedef {Decibels}
	 */
	Decibels : "db",
	/**
	 *  Half-step note increments, i.e. 12 is an octave above the root. and 1 is a half-step up.
	 *  @typedef {Interval}
	 */
	Interval : "interval",
	/**
	 *  Beats per minute.
	 *  @typedef {BPM}
	 */
	BPM : "bpm",
	/**
	 *  The value must be greater than or equal to 0.
	 *  @typedef {Positive}
	 */
	Positive : "positive",
	/**
	 *  Gain is the ratio between input and output of a signal.
	 *  A gain of 0 is the same as silencing the signal. A gain of
	 *  1, causes no change to the incoming signal.
	 *  @typedef {Gain}
	 */
	Gain : "gain",
	/**
	 *  A cent is a hundredth of a semitone.
	 *  @typedef {Cents}
	 */
	Cents : "cents",
	/**
	 *  Angle between 0 and 360.
	 *  @typedef {Degrees}
	 */
	Degrees : "degrees",
	/**
	 *  A number representing a midi note.
	 *  @typedef {MIDI}
	 */
	MIDI : "midi",
	/**
	 *  A colon-separated representation of time in the form of
	 *  Bars:Beats:Sixteenths.
	 *  @typedef {BarsBeatsSixteenths}
	 */
	BarsBeatsSixteenths : "barsBeatsSixteenths",
	/**
	 *  Sampling is the reduction of a continuous signal to a discrete signal.
	 *  Audio is typically sampled 44100 times per second.
	 *  @typedef {Samples}
	 */
	Samples : "samples",
	/**
	 *  Hertz are a frequency representation defined as one cycle per second.
	 *  @typedef {Hertz}
	 */
	Hertz : "hertz",
	/**
	 *  A frequency represented by a letter name,
	 *  accidental and octave. This system is known as
	 *  [Scientific Pitch Notation](https://en.wikipedia.org/wiki/Scientific_pitch_notation).
	 *  @typedef {Note}
	 */
	Note : "note",
	/**
	 *  One millisecond is a thousandth of a second.
	 *  @typedef {Milliseconds}
	 */
	Milliseconds : "milliseconds",
	/**
	 *  Seconds are the time unit of the AudioContext. In the end,
	 *  all values need to be evaluated to seconds.
	 *  @typedef {Seconds}
	 */
	Seconds : "seconds",
	/**
	 *  A string representing a duration relative to a measure.
	 *  * "4n" = quarter note
	 *  * "2m" = two measures
	 *  * "8t" = eighth-note triplet
	 *  @typedef {Notation}
	 */
	Notation : "notation",
};

///////////////////////////////////////////////////////////////////////////
// AUGMENT TONE's PROTOTYPE
///////////////////////////////////////////////////////////////////////////

/**
 *  Convert Time into seconds.
 *
 *  Unlike the method which it overrides, this takes into account
 *  transporttime and musical notation.
 *
 *  Time : 1.40
 *  Notation: 4n or 1m or 2t
 *  Now Relative: +3n
 *
 *  @param  {Time} time
 *  @return {Seconds}
 */
Tone.prototype.toSeconds = function(time){
	if (Tone.isNumber(time)){
		return time;
	} else if (Tone.isUndef(time)){
		return this.now();
	} else if (Tone.isString(time) || Tone.isObject(time)){
		return (new Tone.Time(time)).toSeconds();
	} else if (time instanceof Tone.TimeBase){
		return time.toSeconds();
	}
};

/**
 *  Convert a frequency representation into a number.
 *  @param  {Frequency} freq
 *  @return {Hertz}      the frequency in hertz
 */
Tone.prototype.toFrequency = function(freq){
	if (Tone.isNumber(freq)){
		return freq;
	} else if (Tone.isString(freq) || Tone.isUndef(freq) || Tone.isObject(freq)){
		return (new Tone.Frequency(freq)).valueOf();
	} else if (freq instanceof Tone.TimeBase){
		return freq.toFrequency();
	}
};

/**
 *  Convert a time representation into ticks.
 *  @param  {Time} time
 *  @return {Ticks}  the time in ticks
 */
Tone.prototype.toTicks = function(time){
	if (Tone.isNumber(time) || Tone.isString(time) || Tone.isObject(time)){
		return (new Tone.TransportTime(time)).toTicks();
	} else if (Tone.isUndef(time)){
		return Tone.Transport.ticks;
	} else if (time instanceof Tone.TimeBase){
		return time.toTicks();
	}
};

export default Tone;

