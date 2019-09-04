import { connectSeries } from "../core/Connect";
import { Gain } from "../core/context/Gain";
import { Param } from "../core/context/Param";
import { optionsFromArguments } from "../core/util/Defaults";
import { Signal, SignalOptions } from "./Signal";

/**
 * Add a signal and a number or two signals. When no value is
 * passed into the constructor, Tone.Add will sum input and `addend`
 * If a value is passed into the constructor, the it will be added to the input.
 *
 * @example
 * var signal = new Signal(2);
 * var add = new Add(2);
 * signal.connect(add);
 * //the output of add equals 4
 * @example
 * //if constructed with no arguments
 * //it will add the first and second inputs
 * var add = new Add();
 * var sig0 = new Signal(3).connect(add);
 * var sig1 = new Signal(4).connect(add.addend);
 * //the output of add equals 7.
 */
export class Add extends Signal {

	override = false;

	readonly name: string = "Add";

	/**
	 *  the summing node
	 */
	private _sum: Gain = new Gain({ context: this.context });
	readonly input = this._sum;
	readonly output = this._sum;

	/**
	 * The value which is added to the input signal
	 */
	readonly addend: Param<number> = this._param;

	/**
	 * @param value If no value is provided, Tone.Add will sum the first  and second inputs.
	 */
	constructor(value?: number);
	// tslint:disable-next-line: unified-signatures
	constructor(options?: Partial<SignalOptions<number>>);
	constructor() {
		super(Object.assign(optionsFromArguments(Add.getDefaults(), arguments, ["value"])));

		connectSeries(this._constantSource, this._sum);
	}

	static getDefaults(): SignalOptions<number> {
		return Object.assign(Signal.getDefaults(), {
			value: 0,
		});
	}

	dispose(): this {
		super.dispose();
		this._sum.dispose();
		return this;
	}
}
