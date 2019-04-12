import { getContext } from "Tone/core/Global";
import { isDefined, isObject , isString, isUndef } from "../core/Util";

/**
 * TypeBase is a flexible encoding of time which can be evaluated to and from a string.
 * @param  val    The time value as a number, string or object
 * @param  units  Unit values
 * @example
 * TypeBase(4, "n")
 * TypeBase(2, "t")
 * TypeBase("2t")
 * TypeBase({"2t" : 2})
 * TypeBase("2t") + TypeBase("4n");
 */
export abstract class TypeBase<Type extends Unit> {

	/**
	 * The value of the units
	 */
	private _val: string | number | TimeObject;

	/**
	 * The units of time
	 */
	private _units: TypeBaseUnits;

	/**
	 * All of the conversion expressions
	 */
	protected _expressions: TypeBaseExpression = typeBaseExpressions;

	/**
	 * The default AudioContext
	 */
	get defaultContext(): BaseAudioContext {
		return getContext();
	}

	/**
	 * The default units if none are given is seconds
	 */
	private _defaultUnits = "s" as TypeBaseUnits;

	constructor(val: string | number | TimeObject, units?: TypeBaseUnits) {

		this._val = val;
		this._units = units || this._defaultUnits;

		// test if the value is a string representation of a number
		if (isUndef(this._units) && isString(this._val) && this._val.charAt(0) !== "+") {
			this._val = parseFloat(this._val);
			this._units = this._defaultUnits;
		}
	}

	///////////////////////////////////////////////////////////////////////////
	// 	VALUE OF
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Evaluate the time value. Returns the time in seconds.
	 */
	valueOf(): number {
		if (isUndef(this._val)) {
			return this._noArg();
		} else if (isString(this._val) && isUndef(this._units)) {
			for (const units in this._expressions) {
				if (this._expressions[units].regexp.test(this._val.trim())) {
					this._units = units as TypeBaseUnits;
					break;
				}
			}
		} else if (isObject(this._val)) {
			let total = 0;
			for (const typeName in this._val) {
				if (isDefined(this._val[typeName])) {
					const quantity = this._val[typeName];
					// @ts-ignore
					const time = (new this.constructor(typeName)).valueOf() * quantity;
					total += time;
				}
			}
			return total;
		}
		if (isDefined(this._units)) {
			const expr = this._expressions[this._units];
			const matching = this._val.toString().trim().match(expr.regexp);
			if (matching) {
				return expr.method.apply(this, matching.slice(1));
			} else {
				return expr.method.call(this, this._val);
			}
		} else if (isString(this._val)) {
			return parseFloat(this._val);
		} else {
			return this._val;
		}
	}

	///////////////////////////////////////////////////////////////////////////
	// 	UNIT CONVERSIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Returns the value of a frequency in the current units
	 */
	protected _frequencyToUnits(freq: Hertz): UnitMap[Type] {
		return 1 / freq;
	}

	/**
	 *  Return the value of the beats in the current units
	 */
	protected _beatsToUnits(beats): number {
		return (60 / this._getBpm()) * beats;
	}

	/**
	 *  Returns the value of a second in the current units
	 */
	protected _secondsToUnits(seconds: Seconds): UnitMap[Type] {
		return seconds;
	}

	/**
	 *  Returns the value of a tick in the current time units
	 *  @private
	 */
	protected _ticksToUnits(ticks: Ticks): UnitMap[Type] {
		return (ticks * (this._beatsToUnits(1)) / this._getPPQ());
	}

	/**
	 *  With no arguments, return 'now'
	 */
	protected _noArg(): Seconds {
		return this._now();
	}

	///////////////////////////////////////////////////////////////////////////
	// 	TEMPO CONVERSIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 * Return the bpm, or 120 if Transport is not available
	 */
	protected _getBpm(): BPM {
		return 120;
	}

	/**
	 * Return the timeSignature or 4 if Transport is not available
	 */
	protected _getTimeSignature(): number {
		return 4;
	}

	/**
	 * Return the PPQ or 192 if Transport is not available
	 */
	protected _getPPQ(): number {
		return 192;
	}

	/**
	 * Return the current time in whichever context is relevant
	 */
	protected _now(): Seconds {
		return this.defaultContext.currentTime;
	}

	///////////////////////////////////////////////////////////////////////////
	// 	CONVERSION INTERFACE
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Return the value in seconds
	 */
	toSeconds(): Seconds {
		return this.valueOf();
	}

	/**
	 *  Return the value in hertz
	 */
	toFrequency(): Hertz {
		return 1 / this.toSeconds();
	}

	/**
	 *  Return the time in samples
	 */
	toSamples(): Samples {
		return this.toSeconds() * this.defaultContext.sampleRate;
	}

	/**
	 *  Return the time in milliseconds.
	 */
	toMilliseconds(): Milliseconds {
		return this.toSeconds() * 1000;
	}
}

///////////////////////////////////////////////////////////////////////////
// 	EXPRESSIONS
///////////////////////////////////////////////////////////////////////////

/**
 * The units that the TypeBase can accept. extended by other classes
 */
type TypeBaseUnits = "s" | "n" | "t" | "m" | "i" | "hz" | "tr" | "samples" | "number";

/**
 * The format of the type conversion expressions
 */
type TypeBaseExpression = {
	[key in TypeBaseUnits]: {
		regexp: RegExp;
		method: (value: string, ...args: any[]) => number;
	};
};

/**
 * All of the conversion expressions
 */
export const typeBaseExpressions: TypeBaseExpression = {
	n: {
		regexp: /^(\d+)n(\.?)$/i,
		method(value, dot) {
			const numericValue = parseInt(value);
			const scalar = dot === "." ? 1.5 : 1;
			if (numericValue === 1) {
				return this._beatsToUnits(this._getTimeSignature()) * scalar;
			} else {
				return this._beatsToUnits(4 / numericValue) * scalar;
			}
		},
	},
	t: {
		regexp: /^(\d+)t$/i,
		method(value) {
			const numericValue = parseInt(value);
			return this._beatsToUnits(8 / (Math.floor(numericValue) * 3));
		},
	},
	m: {
		regexp: /^(\d+)m$/i,
		method(value) {
			return this._beatsToUnits(parseInt(value) * this._getTimeSignature());
		},
	},
	i: {
		regexp: /^(\d+)i$/i,
		method(value) {
			return this._ticksToUnits(parseInt(value));
		},
	},
	hz: {
		regexp: /^(\d+(?:\.\d+)?)hz$/i,
		method(value) {
			return this._frequencyToUnits(parseFloat(value));
		},
	},
	tr: {
		regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?$/,
		method(m, q, s) {
			let total = 0;
			if (m && m !== "0") {
				total += this._beatsToUnits(this._getTimeSignature() * parseFloat(m));
			}
			if (q && q !== "0") {
				total += this._beatsToUnits(parseFloat(q));
			}
			if (s && s !== "0") {
				total += this._beatsToUnits(parseFloat(s) / 4);
			}
			return total;
		},
	},
	s: {
		regexp: /^(\d+(?:\.\d+)?)s$/,
		method(value) {
			return this._secondsToUnits(parseFloat(value));
		},
	},
	samples: {
		regexp: /^(\d+)samples$/,
		method(value) {
			return parseInt(value) / this.context.sampleRate;
		},
	},
	number: {
		regexp: /^(\d+(?:\.\d+)?)$/,
		method(value) {
			return this._expressions[this._defaultUnits].method.call(this, value);
		},
	},
};
