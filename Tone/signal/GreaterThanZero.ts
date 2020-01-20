import { SignalOperator, SignalOperatorOptions } from "./SignalOperator";
import { Multiply } from "./Multiply";
import { ToneAudioNode } from "../core/context/ToneAudioNode";
import { WaveShaper } from "./WaveShaper";
import { optionsFromArguments } from "../core/util/Defaults";

export type GreaterThanZeroOptions = SignalOperatorOptions

/**
 * GreaterThanZero outputs 1 when the input is strictly greater than zero
 * @example
 * import { GreaterThanZero, Signal } from "tone";
 * const gt0 = new GreaterThanZero();
 * const sig = new Signal(0.01).connect(gt0);
 * // the output of gt0 is 1.
 * sig.value = 0;
 * // the output of gt0 is 0.
 */
export class GreaterThanZero extends SignalOperator<GreaterThanZeroOptions> {

	readonly name: string = "GreaterThanZero";

	/**
	 * The waveshaper
	 */
	private _thresh: WaveShaper;
	
	/**
	 * Scale the first thresholded signal by a large value.
	 * this will help with values which are very close to 0
	 */
	private _scale: Multiply;

	readonly output: ToneAudioNode;
	readonly input: ToneAudioNode;

	constructor(options?: Partial<GreaterThanZeroOptions>);
	constructor() {
		super(Object.assign(optionsFromArguments(GreaterThanZero.getDefaults(), arguments)));

		this._thresh = this.output = new WaveShaper({
			context: this.context,
			length: 127,
			mapping: (val) => {
				if (val <= 0) {
					return 0;
				} else {
					return 1;
				}
			},
		});
		this._scale = this.input = new Multiply({
			context: this.context,
			value: 10000
		});

		// connections
		this._scale.connect(this._thresh);
	}

	dispose(): this {
		super.dispose();
		this._scale.dispose();
		this._thresh.dispose();
		return this;
	}
}
