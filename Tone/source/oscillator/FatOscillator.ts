import { AudioRange, Cents, Degrees, Frequency, Positive, Time } from "../../core/type/Units";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { AudioToGain } from "../../signal/AudioToGain";
import { Multiply } from "../../signal/Multiply";
import { Signal } from "../../signal/Signal";
import { Source } from "../Source";
import { Oscillator } from "./Oscillator";
import { FatConstructorOptions, FatOscillatorOptions,
	ToneOscillatorInterface, ToneOscillatorType } from "./OscillatorInterface";

/**
 *  FatOscillator is an array of oscillators with detune spread between the oscillators
 *  @param frequency The oscillator's frequency.
 *  @param type The type of the oscillator.
 *  @param spread The detune spread between the oscillators.
 *  @example
 * var fatOsc = new FatOscillator("Ab3", "sine", 40).toDestination().start();
 */
export class FatOscillator extends Source<FatOscillatorOptions> implements ToneOscillatorInterface {

	name = "FatOscillator";

	/**
	 *  The oscillator's frequency
	 */
	readonly frequency: Signal<Frequency>;

	/**
	 *  The detune control signal.
	 */
	readonly detune: Signal<Cents>;

	/**
	 *  The array of oscillators
	 */
	private _oscillators: Oscillator[] = [];

	/**
	 *  The total spread of the oscillators
	 */
	private _spread: Cents;

	/**
	 *  The type of the oscillator
	 */
	private _type: ToneOscillatorType;

	/**
	 *  The phase of the oscillators
	 */
	private _phase: Degrees;

	/**
	 *  The partials array
	 */
	private _partials: number[];

	/**
	 *  The number of partials to use
	 */
	private _partialCount: number;

	constructor(options?: Partial<FatConstructorOptions>);
	constructor(frequency?: Frequency, type?: ToneOscillatorType, modulationType?: ToneOscillatorType);
	constructor() {

		super(optionsFromArguments(FatOscillator.getDefaults(), arguments, ["frequency", "type", "spread"]));
		const options = optionsFromArguments(FatOscillator.getDefaults(), arguments, ["frequency", "type", "spread"]);

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

		this._spread = options.spread;
		this._type = options.type;
		this._phase = options.phase;
		this._partials = options.partials;
		this._partialCount = options.partialCount;

		// set the count initially
		this.count = options.count;

		readOnly(this, ["frequency", "detune"]);
	}

	static getDefaults(): FatOscillatorOptions {
		return Object.assign(Oscillator.getDefaults(), {
			count : 3,
			spread : 20,
			type : "sawtooth",
		});
	}

	/**
	 *  start the oscillator
	 */
	protected _start(time: Time): void {
		time = this.toSeconds(time);
		this._forEach(osc => osc.start(time));
	}

	/**
	 *  stop the oscillator
	 */
	protected _stop(time: Time): void {
		time = this.toSeconds(time);
		this._forEach(osc => osc.stop(time));
	}

	/**
	 *  restart the oscillator
	 */
	restart(time): this {
		time = this.toSeconds(time);
		this._forEach(osc => osc.restart(time));
		return this;
	}

	/**
	 *  Iterate over all of the oscillators
	 */
	private _forEach(iterator: (osc: Oscillator, index: number) => void): void {
		for (let i = 0; i < this._oscillators.length; i++) {
			iterator(this._oscillators[i], i);
		}
	}

	/**
	 * The type of the oscillator
	 */
	get type(): ToneOscillatorType {
		return this._type;
	}

	set type(type: ToneOscillatorType) {
		this._type = type;
		this._forEach(osc => osc.type = type);
	}

	/**
	 * The detune spread between the oscillators. If "count" is
	 * set to 3 oscillators and the "spread" is set to 40,
	 * the three oscillators would be detuned like this: [-20, 0, 20]
	 * for a total detune spread of 40 cents.
	 */
	get spread(): Cents {
		return this._spread;
	}

	set spread(spread: Cents) {
		this._spread = spread;
		if (this._oscillators.length > 1) {
			const start = -spread / 2;
			const step = spread / (this._oscillators.length - 1);
			this._forEach((osc, i) => osc.detune.value = start + step * i);
		}
	}

	/**
	 * The number of detuned oscillators. Should be an integer greater than 1.
	 */
	get count(): number {
		return this._oscillators.length;
	}
	set count(count: number) {
		count = Math.max(count, 1);
		if (this._oscillators.length !== count) {
			// dispose the previous oscillators
			this._forEach(osc => osc.dispose());
			this._oscillators = [];
			for (let i = 0; i < count; i++) {
				const osc = new Oscillator({
					context : this.context,
				});
				if (this.type === "custom") {
					osc.partials = this._partials;
				} else {
					osc.type = this._type;
				}
				osc.partialCount = this._partialCount;
				osc.phase = this._phase + (i / count) * 360;
				osc.volume.value = -6 - count * 1.1;
				this.frequency.connect(osc.frequency);
				this.detune.connect(osc.detune);
				osc.connect(this.output);
				this._oscillators[i] = osc;
			}
			// set the spread
			this.spread = this._spread;
			if (this.state === "started") {
				this._forEach(osc => osc.start());
			}
		}
	}

	/**
	 * The phase of the oscillator in degrees.
	 */
	get phase(): Degrees {
		return this._phase;
	}
	set phase(phase: Degrees) {
		this._phase = phase;
		this._forEach(osc => osc.phase = phase);
	}

	/**
	 * The oscillator type without the partialsCount appended to the end
	 * @example
	 * osc.type = 'sine2'
	 * osc.baseType //'sine'
	 * osc.partialCount = 2
	 */
	get baseType(): OscillatorType {
		return this._oscillators[0].baseType;
	}
	set baseType(baseType: OscillatorType) {
		this._forEach(osc => osc.baseType = baseType);
		this._type = this._oscillators[0].type;
	}

	/**
	 * The partials of the carrier waveform. A partial represents
	 * the amplitude at a harmonic. The first harmonic is the
	 * fundamental frequency, the second is the octave and so on
	 * following the harmonic series.
	 * Setting this value will automatically set the type to "custom".
	 * The value is an empty array when the type is not "custom".
	 * @memberOf FatOscillator#
	 * @type {Array}
	 * @name partials
	 * @example
	 * osc.partials = [1, 0.2, 0.01];
	 */
	get partials(): number[] {
		return this._oscillators[0].partials;
	}
	set partials(partials: number[]) {
		this._partials = partials;
		if (partials.length) {
			this._type = "custom";
			this._forEach(osc => osc.partials = partials);
		}
	}

	/**
	 * 'partialCount' offers an alternative way to set the number of used partials.
	 * When partialCount is 0, the maximum number of partials are used when representing
	 * the waveform using the periodicWave. When 'partials' is set, this value is
	 * not settable, but equals the length of the partials array.
	 * @memberOf FatOscillator#
	 * @type {Number}
	 * @name partialCount
	 */
	get partialCount(): number {
		return this._oscillators[0].partialCount;
	}
	set partialCount(partialCount: number) {
		this._partialCount = partialCount;
		this._forEach(osc => osc.partialCount = partialCount);
		this._type = this._oscillators[0].type;
	}

	/**
	 *  Clean up.
	 */
	dispose(): this {
		super.dispose();
		this.frequency.dispose();
		this.detune.dispose();
		this._forEach(osc => osc.dispose());
		return this;
	}
}
