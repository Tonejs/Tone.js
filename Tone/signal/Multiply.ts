import { Gain } from "../core/context/Gain";
import { Param } from "../core/context/Param";
import { optionsFromArguments } from "../core/util/Defaults";
import { Signal, SignalOptions } from "./Signal";

/**
 * Multiply two incoming signals. Or, if a number is given in the constructor,
 * multiplies the incoming signal by that value.
 *
 * @example
 * const mult = new Multiply();
 * const sigA = new Tone.Signal(3);
 * const sigB = new Tone.Signal(4);
 * sigA.connect(mult);
 * sigB.connect(mult.factor);
 * //output of mult is 12.
 * @example
 * const mult = new Multiply(10);
 * const sig = new Tone.Signal(2).connect(mult);
 * //the output of mult is 20.
 */
export class Multiply extends Signal<number> {

		readonly name: string = "Multiply";

	/**
	 * Indicates if the value should be overridden on connection
	 */
	readonly override = false;

	/**
	 * the input gain node
	 */
	private _mult: Gain = new Gain({ context : this.context });

	/**
	 * The multiplcant input.
	 */
	input = this._mult;

	/**
	 * The product of the input and {@link factor}
	 */
	output = this._mult;

	/**
	 * The multiplication factor. Can be set directly or a signal can be connected to it.
	 */
	factor: Param<number>;

	/**
	 * @param value Constant value to multiple
	 */
	constructor(value?: number);
	// tslint:disable-next-line: unified-signatures
	constructor(options?: Partial<SignalOptions<number>>);
	constructor() {
		super(Object.assign(optionsFromArguments(Multiply.getDefaults(), arguments, ["value"])));
		const options = optionsFromArguments(Multiply.getDefaults(), arguments, ["value"]);

		this.factor = this._param = this._mult.gain as unknown as Param<number>;
		this.factor.setValueAtTime(options.value, 0);
	}

	static getDefaults(): SignalOptions<number> {
		return Object.assign(Signal.getDefaults(), {
			value: 0,
		});
	}

	/**
	 *  clean up
	 */
	dispose(): this {
		super.dispose();
		this._mult.dispose();
		return this;
	}
}
