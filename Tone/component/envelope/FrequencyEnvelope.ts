import { optionsFromArguments } from "../../core/util/Defaults";
import { Frequency, NormalRange, Positive, Time } from "../../core/type/Units";
import { ScaledEnvelope, ScaledEnvelopeOptions } from "./ScaledEnvelope";

export interface FrequencyEnvelopeOptions extends ScaledEnvelopeOptions {
	baseFrequency: Frequency;
	octaves: number;
	exponent: number;
}
/**
 * FrequencyEnvelope is a ScaledEnvelope, but instead of `min` and `max`
 * it's got a `baseFrequency` and `octaves` parameter. See [[ScaledEnvelope]]
 * @example
 * import { FrequencyEnvelope, Oscillator } from "tone";
 * const oscillator = new Oscillator().toDestination().start();
 * const freqEnv = new FrequencyEnvelope({
 * 	attack: 0.2,
 * 	baseFrequency: "C2",
 * 	octaves: 4
 * });
 * freqEnv.connect(oscillator.frequency);
 */
export class FrequencyEnvelope extends ScaledEnvelope {

	readonly name: string = "FrequencyEnvelope";

	private _baseFrequency!: Frequency;

	private _octaves!: Positive;

	/**
	 * @param attack	the attack time in seconds
	 * @param decay		the decay time in seconds
	 * @param sustain 	a percentage (0-1) of the full amplitude
	 * @param release	the release time in seconds
	 */
	constructor(attack?: Time, decay?: Time, sustain?: NormalRange, release?: Time);
	constructor(options?: Partial<FrequencyEnvelopeOptions>)
	constructor() {
		super(optionsFromArguments(FrequencyEnvelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release", "baseFrequency", "octaves", "exponent"]));
		const options =
			optionsFromArguments(FrequencyEnvelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release", "baseFrequency", "octaves", "exponent"]);

		this._octaves = options.octaves;
		this._baseFrequency = options.baseFrequency;
	}

	static getDefaults(): FrequencyEnvelopeOptions {
		return Object.assign(ScaledEnvelope.getDefaults(), {
			baseFrequency: 200,
			exponent: 1,
			octaves: 4,
		});
	}

	/**
	 * The envelope's mininum output value. This is the value which it
	 * starts at.
	 */
	get baseFrequency(): Frequency {
		return this._getFrequency();
	}
	set baseFrequency(min) {
		this._setFrequency(min);
		this.min = this.toFrequency(min);
	}

	/**
	 * The number of octaves above the baseFrequency that the
	 * envelope will scale to.
	 */
	get octaves(): Positive {
		return this._octaves;
	}
	set octaves(octaves: Positive) {
		this._octaves = octaves;
		this.max = this.baseFrequency as number * Math.pow(2, octaves);
	}

	private _getFrequency(): Frequency {
		return this._baseFrequency;
	}

	private _setFrequency(frequency: Frequency): void {
		this._baseFrequency = frequency;
	}

	/**
	 * Clean up
	 */
	dispose(): this {
		super.dispose();
		return this;
	}
}
