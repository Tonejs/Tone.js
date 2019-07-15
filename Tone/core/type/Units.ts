/**
 * A note in Scientific pitch notation.
 * The pitch class + octave number
 * e.g. "C4", "D#3", "G-1"
 */
type Note = string;

/**
 * A number representing a time in seconds
 */
type Seconds = number;

/**
 * A number used to measure the intensity of a sound on a logarithmic scale.
 */
type Decibels = number;

/**
 * A number that is between [0, 1]
 */
type NormalRange = number;

/**
 * A number that is between [-1, 1]
 */
type AudioRange = number;

/**
 *  Half-step note increments, i.e. 12 is an octave above the root. and 1 is a half-step up.
 */
type Interval = number;

/**
 * A number representing the multiplication factor applied to a signal
 */
type GainFactor = number;

/**
 * A number greater than or equal to 0.
 */
type Positive = number;

/**
 * Represents a subdivision of a measure.
 * The number represents the subdivision. "t" represents a triplet.
 * e.g. "4n" is a quarter note, and "4t" is a quarter note triplet.
 */
type Subdivision = "1m" | "1n" | "2n" | "2t" | "4n" | "4t" | "8n" | "8t" | "16n" | "16t" |
					"32n" | "32t" | "64n" | "64t" | "128n" | "128t" | "256n" | "256t" | "0";

/**
 * A time object has a subdivision as the keys and a number as the values.
 * The
 */
type TimeObject = {
	[sub in Subdivision]?: number;
};

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
 *  * Object, ({"4n" : 3, "8t" : -1}). The resulting time is equal to
 * 	the sum of all of the keys multiplied by the values in the object.
 *  * No Argument, for methods which accept time, no argument will be interpreted as
 *  "now" (i.e. the currentTime).
 */
type Time = string | Seconds | TimeObject | Subdivision | undefined;

/**
 *  Frequency can be described similar to time, except ultimately the
 *  values are converted to frequency instead of seconds. A number
 *  is taken literally as the value in hertz. Additionally any of the
 *  Time encodings can be used. Note names in the form
 *  of NOTE OCTAVE (i.e. C4) are also accepted and converted to their
 *  frequency value.
 */
type Frequency = Seconds | TimeObject | Subdivision | Note;

/**
 *
 */
type TimeSignature = number | number[];

/**
 *  TransportTime describes a position along the Transport's timeline. It is
 *  similar to Time in that it uses all the same encodings, but TransportTime specifically
 *  pertains to the Transport's timeline, which is startable, stoppable, loopable, and seekable.
 *  [Read more](https://github.com/Tonejs/Tone.js/wiki/TransportTime)
 */
type TransportTime = Time;

/**
 *  Ticks are the basic subunit of the Transport. They are
 *  the smallest unit of time that the Transport supports.
 */
type Ticks = number;

/**
 *  Beats per minute
 */
type BPM = number;

/**
 *  Angle between 0 and 360.
 */
type Degrees = number;

/**
 *  Angle between 0 and 2 * PI.
 */
type Radians = number;

/**
 *  A number representing a midi note.
 */
type MidiNote = number;

/**
 *  A colon-separated representation of time in the form of
 *  Bars:Beats:Sixteenths.
 */
type BarsBeatsSixteenths  = string;
/**
 *  Sampling is the reduction of a continuous signal to a discrete signal.
 *  Audio is typically sampled 44100 times per second.
 */
type Samples = number | "samples";

/**
 *  Hertz are a frequency representation defined as one cycle per second.
 */
type Hertz = number;

/**
 * A Cent is 1/100th of a semitone.
 * e.g. a value of 50 cents would be halfway between two intervals.
 */
type Cents = number;

/**
 *  One millisecond is a thousandth of a second.
 */
type Milliseconds = number;

/**
 *  A value which is a power of 2
 */
type PowerOfTwo = number;

/**
 * Map the unit name to a unit value
 */
interface UnitMap {
	number: number;
	decibels: Decibels;
	normalRange: NormalRange;
	audioRange: AudioRange;
	gain: GainFactor;
	positive: Positive;
	time: Time;
	frequency: Frequency;
	transportTime: TransportTime;
	ticks: Ticks;
	bpm: BPM;
	degrees: Degrees;
	radians: Radians;
	samples: Samples;
	hertz: Hertz;
	cents: Cents;
}

/**
 * All of the unit types
 */
type Unit = UnitMap[keyof UnitMap];

/**
 * All of the unit names
 */
type UnitName = keyof UnitMap;
