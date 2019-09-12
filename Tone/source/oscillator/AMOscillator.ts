import { Gain } from "../../core/context/Gain";
import { Cents, Degrees, Frequency, Positive, Seconds, Time } from "../../core/type/Units";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { AudioToGain } from "../../signal/AudioToGain";
import { Multiply } from "../../signal/Multiply";
import { Signal } from "../../signal/Signal";
import { Source } from "../Source";
import { Oscillator } from "./Oscillator";
import { AMConstructorOptions, AMOscillatorOptions,
	NonCustomOscillatorType, ToneOscillatorInterface,
	ToneOscillatorType } from "./OscillatorInterface";

export { AMOscillatorOptions } from "./OscillatorInterface";

/**
 * An amplitude modulated oscillator node. It is implemented with
 * two oscillators, one which modulators the other's amplitude
 * through a gain node.
 * ```
 *    +-------------+       +----------+
 *    | Carrier Osc +>------> GainNode |
 *    +-------------+       |          +--->Output
 *                      +---> gain     |
 * +---------------+    |   +----------+
 * | Modulator Osc +>---+
 * +---------------+
 * ```
 *
 * @example
 * //a sine oscillator amplitude-modulated by a square wave
 * var amOsc = new AMOscillator("Ab3", "sine", "square").toDestination().start();
 */
export class AMOscillator extends Source<AMOscillatorOptions> implements ToneOscillatorInterface {

	readonly name: string = "AMOscillator";

	/**
	 *  The carrier oscillator
	 */
	private _carrier: Oscillator;

	/**
	 *  The oscillator's frequency
	 */
	readonly frequency: Signal<Frequency>;

	/**
	 *  The detune control signal.
	 */
	readonly detune: Signal<Cents>;

	/**
	 *  The modulating oscillator
	 */
	private _modulator: Oscillator;

	/**
	 *  convert the -1,1 output to 0,1
	 */
	private _modulationScale = new AudioToGain({ context: this.context });

	/**
	 *  Harmonicity is the frequency ratio between the carrier and the modulator oscillators.
	 *  A harmonicity of 1 gives both oscillators the same frequency.
	 *  Harmonicity = 2 means a change of an octave.
	 * @example
	 * //pitch the modulator an octave below carrier
	 * synth.harmonicity.value = 0.5;
	 */
	readonly harmonicity: Signal<Positive>;

	/**
	 *  the node where the modulation happens
	 */
	private _modulationNode = new Gain({
		context: this.context,
	});

	/**
	 * @param frequency The starting frequency of the oscillator.
	 * @param type The type of the carrier oscillator.
	 * @param modulationType The type of the modulator oscillator.
	 */
	constructor(frequency?: Frequency, type?: ToneOscillatorType, modulationType?: ToneOscillatorType);
	constructor(options?: Partial<AMConstructorOptions>);
	constructor() {

		super(optionsFromArguments(AMOscillator.getDefaults(), arguments, ["frequency", "type", "modulationType"]));
		const options = optionsFromArguments(AMOscillator.getDefaults(), arguments, ["frequency", "type", "modulationType"]);

		this._carrier  = new Oscillator({
			context : this.context,
			detune: options.detune,
			frequency: options.frequency,
			onstop: () => this.onstop(this),
			phase: options.phase,
			type: options.type,
		} as OscillatorOptions);
		this.frequency = this._carrier.frequency,
		this.detune = this._carrier.detune;

		this._modulator = new Oscillator({
			context : this.context,
			phase: options.phase,
			type: options.modulationType,
		} as OscillatorOptions);

		this.harmonicity = new Multiply({
			context: this.context,
			units: "positive",
			value: options.harmonicity,
		});

		// connections
		this.frequency.chain(this.harmonicity, this._modulator.frequency);
		this._modulator.chain(this._modulationScale, this._modulationNode.gain);
		this._carrier.chain(this._modulationNode, this.output);

		readOnly(this, ["frequency", "detune", "harmonicity"]);
	}

	static getDefaults(): AMOscillatorOptions {
		return Object.assign(Oscillator.getDefaults(), {
			harmonicity: 1,
			modulationType: "square" as NonCustomOscillatorType,
		});
	}

	/**
	 *  start the oscillator
	 */
	protected _start(time: Seconds): void {
		this._modulator.start(time);
		this._carrier.start(time);
	}

	/**
	 *  stop the oscillator
	 */
	protected _stop(time: Seconds): void {
		this._modulator.stop(time);
		this._carrier.stop(time);
	}

	/**
	 *  restart the oscillator
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
		this.detune.dispose();
		this.harmonicity.dispose();
		this._carrier.dispose();
		this._modulator.dispose();
		this._modulationNode.dispose();
		this._modulationScale.dispose();
		return this;
	}
}
