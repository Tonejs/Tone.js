import { Loop, LoopOptions } from "./Loop";
import { PatternGenerator, PatternName } from "./PatternGenerator";
import { ToneEventCallback } from "./ToneEvent";
import { optionsFromArguments } from "../core/util/Defaults";
import { Seconds } from "../core/type/Units";
import { noOp } from "../core/util/Interface";

export interface PatternOptions<ValueType> extends LoopOptions {
	pattern: PatternName;
	values: ValueType[];
	callback: (time: Seconds, value?: ValueType) => void;
}

/**
 * Pattern arpeggiates between the given notes
 * in a number of patterns. 
 * @example
 * const pattern = new Tone.Pattern((time, note) => {
 * 	// the order of the notes passed in depends on the pattern
 * }, ["C2", "D4", "E5", "A6"], "upDown");
 * @category Event
 */
export class Pattern<ValueType> extends Loop<PatternOptions<ValueType>> {

	readonly name: string = "Pattern";

	/**
	 * The pattern generator function
	 */
	private _pattern: Iterator<ValueType>;

	/**
	 * The current value
	 */
	private _value?: ValueType;

	/**
	 * Hold the pattern type
	 */
	private _type: PatternName;

	/**
	 * Hold the values
	 */
	private _values: ValueType[];

	/**
	 * The callback to be invoked at a regular interval
	 */
	callback: (time: Seconds, value?: ValueType) => void;

	/**
	 * @param  callback The callback to invoke with the event.
	 * @param  values The values to arpeggiate over.
	 * @param  pattern  The name of the pattern
	 */
	constructor(
		callback?: ToneEventCallback<ValueType>,
		values?: ValueType[],
		pattern?: PatternName,
	);
	constructor(options?: Partial<PatternOptions<ValueType>>);
	constructor() {

		super(optionsFromArguments(Pattern.getDefaults(), arguments, ["callback", "values", "pattern"]));
		const options = optionsFromArguments(Pattern.getDefaults(), arguments, ["callback", "values", "pattern"]);

		this.callback = options.callback;
		this._values = options.values;
		this._pattern = PatternGenerator(options.values, options.pattern);
		this._type = options.pattern;
	}

	static getDefaults(): PatternOptions<any> {
		return Object.assign(Loop.getDefaults(), {
			pattern: "up" as "up",
			values: [],
			callback: noOp,
		});
	}

	/**
	 * Internal function called when the notes should be called
	 */
	protected _tick(time: Seconds): void {
		const value = this._pattern.next() as IteratorResult<ValueType>;
		this._value = value.value;
		this.callback(time, this._value);
	}

	/**
	 * The array of events.
	 */
	get values(): ValueType[] {
		return this._values;
	}
	set values(val) {
		this._values = val;
		// reset the pattern
		this.pattern = this._type;
	}

	/**
	 * The current value of the pattern.
	 */
	get value(): ValueType | undefined {
		return this._value;
	}

	/**
	 * The pattern type. See Tone.CtrlPattern for the full list of patterns.
	 */
	get pattern(): PatternName {
		return this._type;
	}
	set pattern(pattern) {
		this._type = pattern;
		this._pattern = PatternGenerator(this._values, this._type);
	}
}

