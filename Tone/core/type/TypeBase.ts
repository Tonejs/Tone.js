import { Tone } from "Tone/core/Tone";
import { Context } from "../context/Context";
import { ToneWithContext, ToneWithContextOptions } from "../context/ToneWithContext";
import { isDefined, isObject , isString, isUndef } from "../util/TypeCheck";

interface TypeBaseClassOptions extends ToneWithContextOptions {
	value?: TypeBaseClassValue;
	units?: TypeBaseUnits;
}

type TypeBaseClassValue = string | number | TimeObject | TypeBaseClass<any>;

/**
 * TypeBase is a flexible encoding of time which can be evaluated to and from a string.
 * @param  val    The time value as a number, string or object
 * @param  units  Unit values
 * @example
 * new TypeBase(4, "n")
 * new TypeBase(2, "t")
 * new TypeBase("2t")
 * new TypeBase({"2t" : 2})
 * new TypeBase("2t") + new TypeBase("4n");
 */
export abstract class TypeBaseClass<Type extends Seconds | Hertz | Ticks> extends Tone {

	readonly context: Context;

	/**
	 * The value of the units
	 */
	protected _val?: TypeBaseClassValue;

	/**
	 * The units of time
	 */
	protected _units?: TypeBaseUnits;

	/**
	 * All of the conversion expressions
	 */
	protected _expressions: TypeBaseExpression<Type>;

	/**
	 * The default units
	 */
	readonly defaultUnits: TypeBaseUnits = "s";

	constructor(context: Context, value?: TypeBaseClassValue, units?: TypeBaseUnits) {
		super();

		this._val = value;
		this._units = units;
		this.context = context;

		this._expressions = this._getExpressions(this.defaultUnits);

		if (value instanceof TypeBaseClass) {
			this.fromType(value);
		}
	}

	static getDefaults(): TypeBaseClassOptions {
		return ToneWithContext.getDefaults();
	}

	/**
	 * All of the time encoding expressions
	 */
	protected _getExpressions(defaultUnit: TypeBaseUnits): TypeBaseExpression<Type> {
		return {
			hz: {
				method: (value) => {
					return this._frequencyToUnits(parseFloat(value));
				},
				regexp: /^(\d+(?:\.\d+)?)hz$/i,
			},
			i: {
				method: (value) => {
					return this._ticksToUnits(parseInt(value, 10));
				},
				regexp: /^(\d+)i$/i,
			},
			m: {
				method: (value) => {
					return this._beatsToUnits(parseInt(value, 10) * this._getTimeSignature());
				},
				regexp: /^(\d+)m$/i,
			},
			n: {
				method: (value, dot) => {
					const numericValue = parseInt(value, 10);
					const scalar = dot === "." ? 1.5 : 1;
					if (numericValue === 1) {
						return this._beatsToUnits(this._getTimeSignature()) * scalar as Type;
					} else {
						return this._beatsToUnits(4 / numericValue) * scalar as Type;
					}
				},
				regexp: /^(\d+)n(\.?)$/i,
			},
			number: {
				method: (value) => {
					return this._expressions[defaultUnit].method.call(this, value);
				},
				regexp: /^(\d+(?:\.\d+)?)$/,
			},
			s: {
				method: (value): Type => {
					return this._secondsToUnits(parseFloat(value));
				},
				regexp: /^(\d+(?:\.\d+)?)s$/,
			},
			samples: {
				method: (value) => {
					return parseInt(value, 10) / this.context.sampleRate as Type;
				},
				regexp: /^(\d+)samples$/,
			},
			t: {
				method: (value) => {
					const numericValue = parseInt(value, 10);
					return this._beatsToUnits(8 / (Math.floor(numericValue) * 3));
				},
				regexp: /^(\d+)t$/i,
			},
			tr: {
				method: (m, q, s) => {
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
					return total as Type;
				},
				regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?$/,
			},
		};
	}

	///////////////////////////////////////////////////////////////////////////
	// 	VALUE OF
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Evaluate the time value. Returns the time in seconds.
	 */
	valueOf(): Type {
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
					const time = (new this.constructor(this.context, typeName)).valueOf() * quantity;
					total += time;
				}
			}
			return total as Type;
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
			return parseFloat(this._val) as Type;
		} else {
			return this._val as Type;
		}
	}

	///////////////////////////////////////////////////////////////////////////
	// 	UNIT CONVERSIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Returns the value of a frequency in the current units
	 */
	protected _frequencyToUnits(freq: Hertz): Type {
		return 1 / freq as Type;
	}

	/**
	 *  Return the value of the beats in the current units
	 */
	protected _beatsToUnits(beats: number): Type {
		return (60 / this._getBpm()) * beats as Type;
	}

	/**
	 *  Returns the value of a second in the current units
	 */
	protected _secondsToUnits(seconds: Seconds): Type {
		return seconds as Type;
	}

	/**
	 *  Returns the value of a tick in the current time units
	 *  @private
	 */
	protected _ticksToUnits(ticks: Ticks): Type {
		return (ticks * (this._beatsToUnits(1)) / this._getPPQ()) as Type;
	}

	/**
	 *  With no arguments, return 'now'
	 */
	protected _noArg(): Type {
		return this._now();
	}

	///////////////////////////////////////////////////////////////////////////
	// 	TEMPO CONVERSIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 * Return the bpm
	 */
	protected _getBpm(): BPM {
		return this.context.transport.bpm.value;
	}

	/**
	 * Return the timeSignature
	 */
	protected _getTimeSignature(): number {
		return this.context.transport.timeSignature as number;
	}

	/**
	 * Return the PPQ or 192 if Transport is not available
	 */
	protected _getPPQ(): number {
		return this.context.transport.PPQ;
	}

	/**
	 * Return the current time in whichever context is relevant
	 */
	protected abstract _now(): Type;

	///////////////////////////////////////////////////////////////////////////
	// 	CONVERSION INTERFACE
	///////////////////////////////////////////////////////////////////////////

	/**
	 * Coerce a time type into this units type.
	 * @param type Any time type units
	 */
	fromType(type: TypeBaseClass<any>): void {
		this._units = undefined;
		switch (this.defaultUnits) {
			case "s":
				this._val = type.toSeconds();
				break;
			case "i":
				this._val = type.toTicks();
				break;
			case "hz":
				this._val = type.toFrequency();
				break;
		}
	}

	/**
	 *  Return the value in seconds
	 */
	abstract toSeconds(): Seconds;

	/**
	 *  Return the value as a Midi note
	 */
	abstract toMidi(): MidiNote;

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
		return this.toSeconds() * this.context.sampleRate;
	}

	/**
	 *  Return the time in milliseconds.
	 */
	toMilliseconds(): Milliseconds {
		return this.toSeconds() * 1000;
	}

	/**
	 * Convert the value into ticks
	 */
	toTicks(): Ticks {
		return 0;
	}

	/**
	 * clean up
	 */
	dispose(): this {
		return this;
	}
}
/**
 * The units that the TypeBase can accept. extended by other classes
 */
export type TypeBaseUnits = "s" | "n" | "t" | "m" | "i" | "hz" | "tr" | "samples" | "number";

/**
 * The format of the type conversion expressions
 */
export type TypeBaseExpression<T> = {
	[key in TypeBaseUnits]: {
		regexp: RegExp;
		method: (value: string, ...args: string[]) => T;
	};
};
