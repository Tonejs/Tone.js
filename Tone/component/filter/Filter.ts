import {ToneAudioNode, ToneAudioNodeOptions, InputNode, OutputNode} from '../../core/context/ToneAudioNode';
import { optionsFromArguments } from "Tone/core/util/Defaults";
import { Signal } from 'Tone/signal/Signal';
import { readOnly, writable } from 'Tone/core/util/Interface';

type FilterType = "lowpass" | "highpass" | "bandpass" | "lowshelf" | "highshelf" | "peaking" | "notch" | "allpass";
type RolloffType = "-12" | "-24" | "-48" | "-96";

interface FilterOptions extends ToneAudioNodeOptions {
	type: FilterType;
	frequency: number;
	rolloff: RolloffType;
	Q: number;
	gain: number
}

/**
 *  @class  Tone.Filter is a filter which allows for all of the same native methods
 *          as the [BiquadFilterNode](http://webaudio.github.io/web-audio-api/#the-biquadfilternode-interface).
 *          Tone.Filter has the added ability to set the filter rolloff at -12
 *          (default), -24 and -48.
 *
 *  @constructor
 *  @extends {Tone.AudioNode}
 *  @param {Frequency|Object} [frequency] The cutoff frequency of the filter.
 *  @param {string=} type The type of filter.
 *  @param {number=} rolloff The drop in decibels per octave after the cutoff frequency.
 *                            3 choices: -12, -24, and -48
 *  @example
 *  var filter = new Tone.Filter(200, "highpass");
 */
export class Filter extends ToneAudioNode<FilterOptions> {

	readonly name = "Filter";

	readonly input = this.context.createBiquadFilter();
	readonly output = this.context.createBiquadFilter();
	private _filters: BiquadFilterNode[];


	/**
	 * The internal channels for channel routing changes
	 */
	protected _internalChannels = [this.output];

	/**
	 *  the rolloff value of the filter
	 *  @type {number}
	 *  @private
	 */
	private _rolloff: number;
	private _type: FilterType;

	readonly Q: Signal;

	/**
	 *  The cutoff frequency of the filter.
	 *  @type {Frequency}
	 *  @signal
	 */
	readonly frequency: Signal;

	/**
	 *  The detune parameter
	 *  @type {Cents}
	 *  @signal
	 */
	readonly detune = new Signal(0, "cents");

	/**
	 *  The gain of the filter, only used in certain filter types
	 *  @type {Number}
	 *  @signal
	 */
	readonly gain: Signal;

	constructor(frequency?: number, type?: FilterType, rolloff?: RolloffType);
	constructor(Q?: number, gain?: number, frequency?: number, type?: FilterType, rolloff?: RolloffType);
	constructor(options?: Partial<FilterOptions>);
	constructor() {
		super(optionsFromArguments(Filter.getDefaults(), arguments, ["frequency", "type", "rolloff", "Q", "gain"]));
		const options = optionsFromArguments(Filter.getDefaults(), arguments, ["frequency", "type", "rolloff", "Q", "gain"]);

		this._filters = [];

		this._rolloff = parseInt(options.rolloff);
		this.rolloff = options.rolloff;
		this.Q = new Signal(options.Q);
		this.frequency = new Signal(options.frequency, "frequency");
		this.gain = new Signal(options.gain, "decibels");
		this._type = options.type;

		readOnly(this, ["detune", "frequency", "gain", "Q"]);
	}

	static getDefaults(): FilterOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			type: "lowpass" as FilterType,
			frequency: 200,
			rolloff: "-12" as RolloffType,
			Q: 1,
			gain: 0
		});
	}

	get type(): FilterType {
		return this.type;
	}
	set type(type: FilterType) {
		var types: FilterType[] = ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"];
		if (types.indexOf(type)=== -1){
			throw new TypeError("Tone.Filter: invalid type "+type);
		}
		this._filters.forEach(filter => filter.type = type);
	}

	get rolloff(): RolloffType {
		return this.rolloff;
	}

	set rolloff(rolloff: RolloffType) {
		const rolloffNum = parseInt(rolloff, 10);
		const possibilities = [-12, -24, -48, -96];

		const cascadingCount = possibilities.indexOf(rolloffNum);
		//check the rolloff is valid
		if (cascadingCount === -1){
			throw new RangeError("Tone.Filter: rolloff can only be -12, -24, -48 or -96");
		}

		this._rolloff = rolloffNum;

		this.input.disconnect();

		this._filters.forEach(filter => {
			filter.disconnect();
		});

		this._filters = new Array(cascadingCount);
		for (let count = 0; count < cascadingCount; count++){
			let filter = this.context.createBiquadFilter();
			filter.type = this._type;
			this.frequency.connect(filter.frequency);
			this.detune.connect(filter.detune);
			this.Q.connect(filter.Q);
			this.gain.connect(filter.gain);
			this._filters[count] = filter;
		}
	}

	/**
	 * Get the frequency response curve. This curve represets how the filter
	 * responses to frequencies between 20hz-20khz. 
	 * @param  {Number} [len=128] The number of values to return
	 * @return {Float32Array}     The frequency response curve between 20-20k
	 */
	getFrequencyResponse(len: number): Float32Array {
		// len = Tone.defaultArg(len, 128); Is this still needed?	

		//start with all 1s
		const totalResponse = new Float32Array(len).map(() => 1);
		const freqValues = new Float32Array(len);
		for (let i = 0; i < len; i++){
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
			filterClone.frequency.value = this.frequency.value;
			filterClone.gain.value = this.gain.value;
			filterClone.getFrequencyResponse(freqValues, magValues, phaseValues);
			magValues.forEach((val, i) =>{
				totalResponse[i] *= val;
			});
		});
		return totalResponse;
	}

	/**
	 *  Clean up.
	 *  @return {Tone.Filter} this
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