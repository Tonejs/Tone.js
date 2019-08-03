import { Gain } from "Tone/core";
import { connectSeries } from "Tone/core/Connect";
import { optionsFromArguments } from "Tone/core/util/Defaults";
import { Signal, SignalOptions } from "./Signal";

/**
 *  @class Add a signal and a number or two signals. When no value is
 *         passed into the constructor, Tone.Add will sum <code>input[0]</code>
 *         and <code>input[1]</code>. If a value is passed into the constructor,
 *         the it will be added to the input.
 *
 *  @constructor
 *  @extends {Signal}
 *  @param value If no value is provided, Tone.Add will sum the first
 *                         and second inputs.
 *  @example
 * var signal = new Signal(2);
 * var add = new Add(2);
 * signal.connect(add);
 * //the output of add equals 4
 *  @example
 * //if constructed with no arguments
 * //it will add the first and second inputs
 * var add = new Add();
 * var sig0 = new Signal(3).connect(add, 0, 0);
 * var sig1 = new Signal(4).connect(add, 0, 1);
 * //the output of add equals 7.
 */
export class Add extends Signal {

	override = false;

	name = "Add";

	/**
	 *  the summing node
	 */
	private _sum: Gain = new Gain({ context: this.context });
	input = this._sum;
	output = this._sum;

	constructor(options?: Partial<SignalOptions<number>>);
	// tslint:disable-next-line: unified-signatures
	constructor(value?: number);
	constructor() {
		super(Object.assign(optionsFromArguments(Add.getDefaults(), arguments, ["value"])));
		const options = optionsFromArguments(Add.getDefaults(), arguments, ["value"]);

		connectSeries(this._constantSource, this._sum);
	}

	static getDefaults(): SignalOptions<number> {
		return Object.assign(Signal.getDefaults(), {
			value: 0,
		});
	}

	/**
	 *  Clean up.
	 */
	dispose(): this {
		super.dispose();
		this._sum.disconnect();
		return this;
	}
}
