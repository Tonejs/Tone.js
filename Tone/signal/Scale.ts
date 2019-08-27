import { ToneAudioNodeOptions } from "../core/context/ToneAudioNode";
import { optionsFromArguments } from "../core/util/Defaults";
import { Add } from "./Add";
import { Multiply } from "./Multiply";
import { Signal } from "./Signal";
import { SignalOperator } from "./SignalOperator";

export interface ScaleOptions extends ToneAudioNodeOptions {
	min: number;
	max: number;
}

/**
 * Performs a linear scaling on an input signal.
 * Scales a NormalRange input to between
 * outputMin and outputMax.
 *
 * @example
 * var scale = new Scale(50, 100);
 * var signal = new Signal(0.5).connect(scale);
 * //the output of scale equals 75
 */
export class Scale extends SignalOperator<ScaleOptions> {

	readonly name: string = "Scale";

	readonly input = new Multiply({
		context: this.context,
		value: 1,
	});

	readonly output = new Add({
		context: this.context,
		value: 0,
	});

	private _outputMin: number;
	private _outputMax: number;

	/**
	 * @param min The output value when the input is 0.
	 * @param max The output value when the input is 1.
	 */
	constructor(min?: number, max?: number);
	constructor(options?: Partial<ScaleOptions>);
	constructor() {
		super(Object.assign(optionsFromArguments(Scale.getDefaults(), arguments, ["min", "max"])));

		const options = optionsFromArguments(Scale.getDefaults(), arguments, ["min", "max"]);
		this._outputMin = options.min;
		this._outputMax = options.max;

		this.input.connect(this.output);
		this._setRange();
	}

	static getDefaults(): ScaleOptions {
		return Object.assign(SignalOperator.getDefaults(), {
			max: 1,
			min: 0,
		});
	}

	/**
	 * The minimum output value. This number is output when the value input value is 0.
	 */
	get min(): number {
		return this._outputMin;
	}
	set min(min) {
		this._outputMin = min;
		this._setRange();
	}

	/**
	 * The maximum output value. This number is output when  the value input value is 1.
	 */
	get max(): number {
		return this._outputMax;
	}
	set max(max) {
		this._outputMax = max;
		this._setRange();
	}

	/**
	 *  set the values
	 */
	private _setRange(): void {
		this.output.value = this._outputMin;
		this.input.value = this._outputMax - this._outputMin;
	}

	dispose(): this {
		super.dispose();
		this.input.dispose();
		this.output.dispose();
		return this;
	}
}
