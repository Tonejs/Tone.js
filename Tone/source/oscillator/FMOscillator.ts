import { Gain } from "../../core/context/Gain";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { Multiply } from "../../signal/Multiply";
import { Signal } from "../../signal/Signal";
import { Source } from "../Source";
import { Oscillator } from "./Oscillator";
import { FMConstructorOptions, FMOscillatorOptions,
	NonCustomOscillatorType, ToneOscillatorInterface, ToneOscillatorType } from "./OscillatorInterface";

/**
 * FMOscillator implements a frequency modulation synthesis
 * ```
 *                                              +-------------+
 * +---------------+        +-------------+     | Carrier Osc |
 * | Modulator Osc +>-------> GainNode    |     |             +--->Output
 * +---------------+        |             +>----> frequency   |
 *                       +--> gain        |     +-------------+
 *                       |  +-------------+
 * +-----------------+   |
 * | modulationIndex +>--+
 * +-----------------+
 * ```
 *
 * @param frequency The starting frequency of the oscillator.
 * @param type The type of the carrier oscillator.
 * @param modulationType The type of the modulator oscillator.
 * @example
 * //a sine oscillator frequency-modulated by a square wave
 * var fmOsc = new FMOscillator("Ab3", "sine", "square").toDestination().start();
 */
export class FMOscillator extends Source<FMOscillatorOptions> implements ToneOscillatorInterface {

	name = "FMOscillator";

	/**
	 *  The carrier oscillator
	 */
	private _carrier: Oscillator = new Oscillator({
		context : this.context,
		frequency: 0,
	});

	/**
	 *  The oscillator's frequency
	 */
	readonly frequency: Signal<Frequency> = new Signal({
		context: this.context,
		units: "frequency",
	});

	/**
	 *  The detune control signal.
	 */
	readonly detune: Signal<Cents> = this._carrier.detune;

	/**
	 *  The modulating oscillator
	 */
	private _modulator = new Oscillator({ context : this.context });

	/**
	 *  Harmonicity is the frequency ratio between the carrier and the modulator oscillators.
	 *  A harmonicity of 1 gives both oscillators the same frequency.
	 *  Harmonicity = 2 means a change of an octave.
	 *  @example
	 * //pitch the modulator an octave below carrier
	 * synth.harmonicity.value = 0.5;
	 */
	readonly harmonicity: Signal<Positive> = new Multiply({
		context: this.context,
		units: "positive",
	});

	/**
	 *  The modulation index which is in essence the depth or amount of the modulation. In other terms it is the
	 *  ratio of the frequency of the modulating signal (mf) to the amplitude of the
	 *  modulating signal (ma) -- as in ma/mf.
	 */
	readonly modulationIndex: Signal<Positive> = new Multiply({
		context: this.context,
		units: "positive",
	});

	/**
	 *  the node where the modulation happens
	 */
	private _modulationNode = new Gain({
		context: this.context,
		gain: 0,
	});

	constructor(options?: Partial<FMConstructorOptions>);
	constructor(frequency?: Frequency, type?: ToneOscillatorType, modulationType?: ToneOscillatorType);
	constructor() {

		super(optionsFromArguments(FMOscillator.getDefaults(), arguments, ["frequency", "type", "modulationType"]));
		const options = optionsFromArguments(FMOscillator.getDefaults(), arguments, ["frequency", "type", "modulationType"]);

		this._carrier.type = options.type;
		this._modulator.type = options.modulationType;
		this.frequency.setValueAtTime(options.frequency, 0);
		this.detune.setValueAtTime(options.detune, 0);
		this.harmonicity.setValueAtTime(options.harmonicity, 0);
		this.modulationIndex.setValueAtTime(options.modulationIndex, 0);

		// connections
		this.frequency.connect(this._carrier.frequency);
		this.frequency.chain(this.harmonicity, this._modulator.frequency);
		this.frequency.chain(this.modulationIndex, this._modulationNode);
		this._modulator.connect(this._modulationNode.gain);
		this._modulationNode.connect(this._carrier.frequency);
		this._carrier.connect(this.output);
		this.detune.connect(this._modulator.detune);

		this.phase = options.phase;

		readOnly(this, ["modulationIndex", "frequency", "detune", "harmonicity"]);
	}

	static getDefaults(): FMOscillatorOptions {
		return Object.assign(Oscillator.getDefaults(), {
			harmonicity: 1,
			modulationIndex: 2,
			modulationType: "square" as NonCustomOscillatorType,
		});
	}

	/**
	 *  start the oscillator
	 */
	protected _start(time: Time): void {
		this._modulator.start(time);
		this._carrier.start(time);
	}

	/**
	 *  stop the oscillator
	 */
	protected _stop(time: Time): void {
		this._modulator.stop(time);
		this._carrier.stop(time);
	}

	/**
	 *  stop and restart the oscillator
	 */
	restart(time?: Time): this {
		this._modulator.restart(time);
		this._carrier.restart(time);
		return this;
	}

	/**
	 * The type of the carrier oscillator
	 */
	get type(): ToneOscillatorType {
		return this._carrier.type;
	}
	set type(type: ToneOscillatorType) {
		this._carrier.type = type;
	}

	/**
	 * The oscillator type without the partialsCount appended to the end
	 * @example
	 * osc.type = 'sine2'
	 * osc.baseType //'sine'
	 * osc.partialCount = 2
	 */
	get baseType(): OscillatorType {
		return this._carrier.baseType;
	}
	set baseType(baseType: OscillatorType) {
		this._carrier.baseType = baseType;
	}

	/**
	 * 'partialCount' offers an alternative way to set the number of used partials.
	 * When partialCount is 0, the maximum number of partials are used when representing
	 * the waveform using the periodicWave. When 'partials' is set, this value is
	 * not settable, but equals the length of the partials array.
	 */
	get partialCount(): number {
		return this._carrier.partialCount;
	}
	set partialCount(partialCount: number) {
		this._carrier.partialCount = partialCount;
	}

	/**
	 * The type of the modulator oscillator
	 */
	get modulationType(): ToneOscillatorType {
		return this._modulator.type;
	}
	set modulationType(type: ToneOscillatorType) {
		this._modulator.type = type;
	}

	/**
	 * The phase of the oscillator in degrees.
	 */
	get phase(): Degrees {
		return this._carrier.phase;
	}
	set phase(phase: Degrees) {
		this._carrier.phase = phase;
		this._modulator.phase = phase;
	}

	/**
	 * The partials of the carrier waveform. A partial represents
	 * the amplitude at a harmonic. The first harmonic is the
	 * fundamental frequency, the second is the octave and so on
	 * following the harmonic series.
	 * Setting this value will automatically set the type to "custom".
	 * The value is an empty array when the type is not "custom".
	 * @example
	 * osc.partials = [1, 0.2, 0.01];
	 */
	get partials(): number[] {
		return this._carrier.partials;
	}
	set partials(partials: number[]) {
		this._carrier.partials = partials;
	}

	/**
	 *  Clean up.
	 */
	dispose(): this {
		super.dispose();
		this.frequency.dispose();
		this.harmonicity.dispose();
		this._carrier.dispose();
		this._modulator.dispose();
		this._modulationNode.dispose();
		this.modulationIndex.dispose();
		return this;
	}
}
