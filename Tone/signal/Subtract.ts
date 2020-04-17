import { connectSeries } from "../core/context/ToneAudioNode";
import { Gain } from "../core/context/Gain";
import { Param } from "../core/context/Param";
import { optionsFromArguments } from "../core/util/Defaults";
import { Negate } from "../signal/Negate";
import { Signal, SignalOptions } from "../signal/Signal";

/**
 * Subtract the signal connected to the input is subtracted from the signal connected
 * The subtrahend.
 *
 * @example
 * // subtract a scalar from a signal
 * const sub = new Tone.Subtract(1);
 * const sig = new Tone.Signal(4).connect(sub);
 * // the output of sub is 3.
 * @example
 * // subtract two signals
 * const sub = new Tone.Subtract();
 * const sigA = new Tone.Signal(10);
 * const sigB = new Tone.Signal(2.5);
 * sigA.connect(sub);
 * sigB.connect(sub.subtrahend);
 * // output of sub is 7.5
 * @category Signal
 */
export class Subtract extends Signal {

	override = false;

	readonly name: string = "Subtract";

	/**
	 * the summing node
	 */
	private _sum: Gain = new Gain({ context: this.context });
	readonly input: Gain = this._sum;
	readonly output: Gain = this._sum;

	/**
	 * Negate the input of the second input before connecting it to the summing node.
	 */
	private _neg: Negate = new Negate({ context: this.context });

	/**
	 * The value which is subtracted from the main signal
	 */
	subtrahend: Param<"number"> = this._param;

	/**
	 * @param value The value to subtract from the incoming signal. If the value
	 *             is omitted, it will subtract the second signal from the first.
	 */
	constructor(value?: number);
	constructor(options?: Partial<SignalOptions<"number">>);
	constructor() {
		super(Object.assign(optionsFromArguments(Subtract.getDefaults(), arguments, ["value"])));

		connectSeries(this._constantSource, this._neg, this._sum);
	}

	static getDefaults(): SignalOptions<"number"> {
		return Object.assign(Signal.getDefaults(), {
			value: 0,
		});
	}

	dispose(): this {
		super.dispose();
		this._neg.dispose();
		this._sum.dispose();
		return this;
	}
}
