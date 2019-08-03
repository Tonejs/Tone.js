import { Gain } from "../../core/context/Gain";
import { connectSeries, ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { Cents, Decibels, Frequency, GainFactor, Positive } from "../../core/type/Units";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly, writable } from "../../core/util/Interface";
import { isNumber } from "../../core/util/TypeCheck";
import { Signal } from "../../signal/Signal";

interface FilterOptions extends ToneAudioNodeOptions {
	type: BiquadFilterType;
	frequency: Frequency;
	rolloff: number;
	Q: Positive;
	detune: Cents;
	gain: GainFactor;
}

/**
 *  @class  Tone.Filter is a filter which allows for all of the same native methods
 *          as the [BiquadFilterNode](http://webaudio.github.io/web-audio-api/#the-biquadfilternode-interface).
 *          Tone.Filter has the added ability to set the filter rolloff at -12
 *          (default), -24 and -48.
 *
 *  @constructor
 *  @extends {Tone.AudioNode}
 *  @param frequency The cutoff frequency of the filter.
 *  @param type The type of filter.
 *  @param rolloff The drop in decibels per octave after the cutoff frequency
 *  @example
 *  var filter = new Filter(200, "highpass");
 */
export class Filter extends ToneAudioNode<FilterOptions> {

	readonly name = "Filter";

	readonly input = new Gain({ context: this.context });
	readonly output = new Gain({ context: this.context });
	private _filters: BiquadFilterNode[] = [];

	/**
	 *  the rolloff value of the filter
	 */
	private _rolloff!: number;
	private _type: BiquadFilterType;

	/**
	 *  The Q or Quality of the filter
	 */
	readonly Q: Signal<Positive>;

	/**
	 *  The cutoff frequency of the filter.
	 */
	readonly frequency: Signal<Frequency>;

	/**
	 *  The detune parameter
	 */
	readonly detune: Signal<Cents>;

	/**
	 *  The gain of the filter, only used in certain filter types
	 */
	readonly gain: Signal<Decibels>;

	constructor(frequency?: Frequency, type?: BiquadFilterType, rolloff?: number);
	constructor(options?: Partial<FilterOptions>);
	constructor() {
		super(optionsFromArguments(Filter.getDefaults(), arguments, ["frequency", "type", "rolloff"]));
		const options = optionsFromArguments(Filter.getDefaults(), arguments, ["frequency", "type", "rolloff"]);

		this._filters = [];

		this.Q = new Signal({
			context: this.context,
			units: "positive",
			value: options.Q,
		});
		this.frequency = new Signal({
			context: this.context,
			units: "frequency",
			value: options.frequency,
		});
		this.detune = new Signal({
			context: this.context,
			units: "cents",
			value: options.detune,
		});
		this.gain = new Signal({
			context: this.context,
			units: "decibels",
			value: options.gain,
		});
		this._type = options.type;
		this.rolloff = options.rolloff;
		readOnly(this, ["detune", "frequency", "gain", "Q"]);
	}

	static getDefaults(): FilterOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			Q: 1,
			detune: 0,
			frequency: 350,
			gain: 0,
			rolloff: -12,
			type: "lowpass" as BiquadFilterType,
		});
	}

	/**
	 * The type of the filter. Types: "lowpass", "highpass",
	 * "bandpass", "lowshelf", "highshelf", "notch", "allpass", or "peaking".
	 */
	get type(): BiquadFilterType {
		return this._type;
	}
	set type(type: BiquadFilterType) {
		const types: BiquadFilterType[] = ["lowpass", "highpass", "bandpass",
			"lowshelf", "highshelf", "notch", "allpass", "peaking"];
		this.assert(types.indexOf(type) !== -1, `Invalid filter type: ${type}`);
		this._type = type;
		this._filters.forEach(filter => filter.type = type);
	}

	/**
	 * The rolloff of the filter which is the drop in db
	 * per octave. Implemented internally by cascading filters.
	 * Only accepts the values -12, -24, -48 and -96.
	 */
	get rolloff(): number | string {
		return this._rolloff;
	}
	set rolloff(rolloff: number | string) {
		const rolloffNum = isNumber(rolloff) ? rolloff : parseInt(rolloff, 10);
		const possibilities = [-12, -24, -48, -96];
		let cascadingCount = possibilities.indexOf(rolloffNum);
		// check the rolloff is valid
		this.assert(cascadingCount !== -1, `rolloff can only be ${possibilities.join(", ")}`);
		cascadingCount += 1;

		this._rolloff = rolloffNum;
		this.input.disconnect();
		this._filters.forEach(filter => filter.disconnect());

		this._filters = new Array(cascadingCount);
		for (let count = 0; count < cascadingCount; count++) {
			const filter = this.context.createBiquadFilter();
			filter.type = this._type;
			this.frequency.connect(filter.frequency);
			this.detune.connect(filter.detune);
			this.Q.connect(filter.Q);
			this.gain.connect(filter.gain);
			this._filters[count] = filter;
		}
		this._internalChannels = this._filters;
		connectSeries(this.input, ...this._internalChannels, this.output);
	}

	/**
	 * Get the frequency response curve. This curve represents how the filter
	 * responses to frequencies between 20hz-20khz.
	 * @param  len The number of values to return
	 * @return The frequency response curve between 20-20kHz
	 */
	getFrequencyResponse(len: number = 128): Float32Array {
		// start with all 1s
		const totalResponse = new Float32Array(len).map(() => 1);
		const freqValues = new Float32Array(len);
		for (let i = 0; i < len; i++) {
			const norm = Math.pow(i / len, 2);
			const freq = norm * (20000 - 20) + 20;
			freqValues[i] = freq;
		}
		const magValues = new Float32Array(len);
		const phaseValues = new Float32Array(len);
		this._filters.forEach(() => {
			const filterClone = this.context.createBiquadFilter();
			filterClone.type = this._type;
			filterClone.Q.value = this.Q.value;
			filterClone.frequency.value = this.frequency.value as number;
			filterClone.gain.value = this.gain.value as number;
			filterClone.getFrequencyResponse(freqValues, magValues, phaseValues);
			magValues.forEach((val, i) => {
				totalResponse[i] *= val;
			});
		});
		return totalResponse;
	}

	/**
	 *  Clean up.
	 */
	dispose(): this {
		super.dispose();
		this._filters.forEach(filter => {
			filter.disconnect();
		});
		writable(this, ["detune", "frequency", "gain", "Q"]);
		this.frequency.dispose();
		this.Q.dispose();
		this.detune.dispose();
		this.gain.dispose();
		return this;
	}
}
