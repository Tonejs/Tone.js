import { optionsFromArguments } from "../../core/util/Defaults";
import { MeterBase, MeterBaseOptions } from "./MeterBase";

export type DCMeterOptions = MeterBaseOptions;

/**
 * DCMeter gets the raw value of the input signal at the current time.
 *
 * @example
 * var meter = new DCMeter();
 * var signal = new Tone.Signal().open();
 * //connect signal to the meter
 * signal.connect(meter);
 * //the current level of the signal
 * var level = meter.getValue();
 */
export class DCMeter extends MeterBase<DCMeterOptions> {

	readonly name: string = "DCMeter";

	constructor(options?: Partial<DCMeterOptions>);
	constructor() {
		super(optionsFromArguments(DCMeter.getDefaults(), arguments));
		const options = optionsFromArguments(DCMeter.getDefaults(), arguments);

		this._analyser.type = "waveform";
		this._analyser.size = 256;
	}

	/**
	 * Get the signal value of the incoming signal
	 */
	getValue(): number {
		const value = this._analyser.getValue();
		return value[0];
	}
}
