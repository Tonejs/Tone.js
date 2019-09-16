import { Signal, SignalOptions } from "./Signal";
import { WaveShaper, WaveShaperMappingFn } from "./WaveShaper";
import { optionsFromArguments } from "Tone";

/**
 *  @class Pow applies an exponent to the incoming signal. The incoming signal
 *         must be AudioRange.
 *
 *  @constructor
 *  @param exp The exponent to apply to the incoming signal, must be at least 2. 
 *  @example
 * var pow = new Pow(2);
 * var sig = new Signal(0.5).connect(pow);
 * //output of pow is 0.25. 
 */
export class Pow extends Signal<number> {
	
	readonly name: string = "Pow";

	/**
	 * Indicates if the value should be overridden on connection
	 */
	readonly override = false;
	
	/**
	 * The exponent
	 */
	private _exponent!: number;
	
	private _exponentScaler = new WaveShaper({
		context: this.context,
		mapping: this._expFunc(this._exponent),
		length: 8192,
	});

	input = this._exponentScaler;

	output = this._exponentScaler;


	/**
	 * @param value Constant exponent value to use
	 */
	constructor(value?: number);
	constructor(options?: Partial<SignalOptions<number>>);
	constructor() {
		super(Object.assign(optionsFromArguments(Pow.getDefaults(), arguments, ["value"])));

		this.exponent = this.value;
	}

	static getDefaults(): SignalOptions<number> {
		return Object.assign(Signal.getDefaults(), {
			value: 1,
		});
	}

	/**
	 * the function which maps the waveshaper
	 * @param exp exponent value
	 */
	private _expFunc(exp: number): WaveShaperMappingFn {
		return (val: number) => {
			return Math.pow(Math.abs(val), exp);
		};
	}

	get exponent(): number {
		return this._exponent;
	}

	set exponent(exp: number) {
		this._exponent = exp;
		this._exponentScaler.setMap(this._expFunc(this._exponent));
	}

	/**
	 * Clean up.
	 */
	dispose(): this {
		super.dispose();
		this._exponentScaler.dispose();
		return this;
	}
}