import { FrequencyClass, getContext, Param, Signal, TimeClass } from "tone";

/**
 * How a value is displayed: the unit after it and the factor
 * between the stored value and the displayed one
 */
export interface DisplayUnit {
	units: string;
	suffix: string;
	scale: number;
}

const DISPLAY_UNITS: Record<string, Omit<DisplayUnit, "units">> = {
	frequency: { suffix: "Hz", scale: 1 },
	time: { suffix: "s", scale: 1 },
	decibels: { suffix: "dB", scale: 1 },
	cents: { suffix: "cents", scale: 1 },
	degrees: { suffix: "deg", scale: 1 },
	bpm: { suffix: "bpm", scale: 1 },
	rolloff: { suffix: "dB/octave", scale: 1 },
	normalRange: { suffix: "%", scale: 100 },
};

/**
 * Tone.js's time notations, e.g. "4n", "8t", "1m", "+0.5" or "1:2:3"
 */
class TimeNotation extends TimeClass {
	matches(text: string): boolean {
		return Object.values(this._expressions).some((e) =>
			e.regexp.test(text)
		);
	}
}

/**
 * Tone.js's frequency notations, which add note names like "C4" and "440hz"
 */
class FrequencyNotation extends FrequencyClass {
	matches(text: string): boolean {
		return Object.values(this._expressions).some((e) =>
			e.regexp.test(text)
		);
	}
}

/**
 * If the text is a notation which Tone.js converts for values in these units,
 * e.g. "4n" for a time or "C4" for a frequency
 */
export function isNotation(units: string, text: string): boolean {
	if (units === "time") {
		return new TimeNotation(getContext()).matches(text);
	} else if (units === "frequency") {
		return new FrequencyNotation(getContext()).matches(text);
	}
	return false;
}

/**
 * The units of options which are plain numbers rather than Params,
 * so their units are not known at runtime
 */
const OPTION_UNITS: Record<string, string> = {
	attack: "time",
	decay: "time",
	release: "time",
	portamento: "time",
	fadeIn: "time",
	fadeOut: "time",
	loopStart: "time",
	loopEnd: "time",
	delayTime: "time",
	preDelay: "time",
	pitchDecay: "time",
	grainSize: "time",
	overlap: "time",
	frequency: "frequency",
	baseFrequency: "frequency",
	vibratoRate: "frequency",
	detune: "cents",
	volume: "decibels",
	phase: "degrees",
	rolloff: "rolloff",
	sustain: "normalRange",
	wet: "normalRange",
	depth: "normalRange",
	feedback: "normalRange",
	vibratoAmount: "normalRange",
};

/**
 * The display unit of the value with the given name, preferring the units of the
 * Param or Signal it belongs to. Names which mean different things on different
 * nodes, like "spread", are left without a unit.
 */
export function displayUnit(
	name: string,
	param: unknown
): DisplayUnit | undefined {
	const units =
		param instanceof Param || param instanceof Signal
			? param.units
			: OPTION_UNITS[name];
	return Object.prototype.hasOwnProperty.call(DISPLAY_UNITS, units)
		? { units, ...DISPLAY_UNITS[units] }
		: undefined;
}
