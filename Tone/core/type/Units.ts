export * from "./NoteUnits";

import { Note } from "./NoteUnits";

/**
 * A number representing a time in seconds
 */
export type Seconds = number;

/**
 * A number used to measure the intensity of a sound on a logarithmic scale.
 */
export type Decibels = number;

/**
 * A number that is between [0, 1]
 */
export type NormalRange = number;

/**
 * A number that is between [-1, 1]
 */
export type AudioRange = number;

/**
 *  Half-step note increments, i.e. 12 is an octave above the root. and 1 is a half-step up.
 */
export type Interval = number;

/**
 * A number representing the multiplication factor applied to a signal
 */
export type GainFactor = number;

/**
 * A number greater than or equal to 0.
 */
export type Positive = number;

/**
 * Represents a subdivision of a measure.
 * The number represents the subdivision. "t" represents a triplet.
 * e.g. "4n" is a quarter note, and "4t" is a quarter note triplet.
 */
export type Subdivision = "1m" | "1n" | "2n" | "2t" | "4n" | "4t" | "8n" | "8t" | "16n" | "16t" |
					"32n" | "32t" | "64n" | "64t" | "128n" | "128t" | "256n" | "256t" | "0";

/**
 * A time object has a subdivision as the keys and a number as the values.
 * @example
 * const time = {
 * 	"2n" : 1,
 * 	"8n" : 3
 * } // = 2n + 8n * 3
 * @example
 * const time = {
 * 	"1m" : 1,
 * 	"8n" : -1
 * } // = 1m - 8n
 */
export type TimeObject = {
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
export type Time = string | Seconds | TimeObject | Subdivision;

/**
 *  Frequency can be described similar to time, except ultimately the
 *  values are converted to frequency instead of seconds. A number
 *  is taken literally as the value in hertz. Additionally any of the
 *  Time encodings can be used. Note names in the form
 *  of NOTE OCTAVE (i.e. C4) are also accepted and converted to their
 *  frequency value.
 */
export type Frequency = Subdivision | Note | string | Hertz;

/**
 *
 */
export type TimeSignature = number | number[];

/**
 *  TransportTime describes a position along the Transport's timeline. It is
 *  similar to Time in that it uses all the same encodings, but TransportTime specifically
 *  pertains to the Transport's timeline, which is startable, stoppable, loopable, and seekable.
 *  [Read more](https://github.com/Tonejs/Tone.js/wiki/TransportTime)
 */
export type TransportTime = Time;

/**
 *  Ticks are the basic subunit of the Transport. They are
 *  the smallest unit of time that the Transport supports.
 */
export type Ticks = number;

/**
 *  Beats per minute
 */
export type BPM = number;

/**
 *  Angle between 0 and 360.
 */
export type Degrees = number;

/**
 *  Angle between 0 and 2 * PI.
 */
export type Radians = number;

/**
 *  A colon-separated representation of time in the form of
 *  Bars:Beats:Sixteenths.
 */
export type BarsBeatsSixteenths  = string;
/**
 *  Sampling is the reduction of a continuous signal to a discrete signal.
 *  Audio is typically sampled 44100 times per second.
 */
export type Samples = number | "samples";

/**
 *  Hertz are a frequency representation defined as one cycle per second.
 */
export type Hertz = number;

/**
 * A Cent is 1/100th of a semitone.
 * e.g. a value of 50 cents would be halfway between two intervals.
 */
export type Cents = number;

/**
 *  One millisecond is a thousandth of a second.
 */
export type Milliseconds = number;

/**
 *  A value which is a power of 2
 */
export type PowerOfTwo = number;

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
export type Unit = UnitMap[keyof UnitMap];

/**
 * All of the unit names
 */
export type UnitName = keyof UnitMap;
