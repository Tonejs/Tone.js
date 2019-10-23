import { AmplitudeEnvelope } from "../component/envelope/AmplitudeEnvelope";
import { Envelope, EnvelopeOptions } from "../component/envelope/Envelope";
import { Gain } from "../core/context/Gain";
import { ToneAudioNode, ToneAudioNodeOptions } from "../core/context/ToneAudioNode";
import { Cents, Frequency, Positive, Seconds } from "../core/type/Units";
import { omitFromObject, optionsFromArguments } from "../core/util/Defaults";
import { RecursivePartial } from "../core/util/Interface";
import { Monophonic } from "./Monophonic";
import { Multiply } from "../signal/Multiply";
import { Signal } from "../signal/Signal";
import { OmniOscillator } from "../source/oscillator/OmniOscillator";
import { OmniOscillatorSynthOptions } from "../source/oscillator/OscillatorInterface";
import { Source } from "../source/Source";
import { Synth, SynthOptions } from "./Synth";

export interface FMSynthOptions extends SynthOptions {
	harmonicity: Positive;
	modulationIndex: Positive;
	modulationEnvelope: Omit<EnvelopeOptions, keyof ToneAudioNodeOptions>;
	modulation: OmniOscillatorSynthOptions;
}

/**
 * FMSynth is composed of two Tone.Synths where one Tone.Synth modulates
 * the frequency of a second Tone.Synth. A lot of spectral content
 * can be explored using the modulationIndex parameter. Read more about
 * frequency modulation synthesis on Sound On Sound: [Part 1](https://web.archive.org/web/20160403123704/http://www.soundonsound.com/sos/apr00/articles/synthsecrets.htm), [Part 2](https://web.archive.org/web/20160403115835/http://www.soundonsound.com/sos/may00/articles/synth.htm).
 *
 * @example
 * var fmSynth = new Tone.FMSynth().toMaster();
 * fmSynth.triggerAttackRelease("C5", "4n");
 */

export class FMSynth extends Monophonic<FMSynthOptions> {
	readonly name: string = "FMSynth";

	/**
	 * The carrier voice.
	 */
	private _carrier: Synth;

	/**
	 * The modulator voice.
	 */

	private _modulator: Synth;

	/**
	 * The carrier's oscillator
	 */
	readonly oscillator: OmniOscillator<any>;

	/**
	 * The carrier's envelope
	 */
	readonly envelope: AmplitudeEnvelope;

	/**
	 * The modulator's oscillator which is applied to the amplitude of the oscillator
	 */
	readonly modulation: OmniOscillator<any>;

	/**
	 * The modulator's envelope
	 */
	readonly modulationEnvelope: AmplitudeEnvelope;

	/**
	 * The frequency control
	 */
	readonly frequency: Signal<Frequency>;

	/**
	 * The detune in cents
	 */
	readonly detune: Signal<Cents>;

	/**
	 * Harmonicity is the ratio between the two voices. A harmonicity of
	 * 1 is no change. Harmonicity = 2 means a change of an octave.
	 * @example
	 * // pitch voice1 an octave below voice0
	 * synth.harmonicity.value = 0.5;
	 */
	readonly harmonicity: Multiply;

	/**
	 * The modulation index which essentially the depth or amount of the modulation. It is the
	 * ratio of the frequency of the modulating signal (mf) to the amplitude of the
	 * modulating signal (ma) -- as in ma/mf.
	 */
	readonly modulationIndex: Multiply;

	/**
	 * The node where the modulation happens
	 */
	private _modulationNode: Gain;

	constructor(options?: RecursivePartial<FMSynthOptions>);
	constructor() {
		super(optionsFromArguments(FMSynth.getDefaults(), arguments));
		const options = optionsFromArguments(FMSynth.getDefaults(), arguments);

		this._carrier = new Synth({
			context: this.context,
			oscillator: options.oscillator,
			envelope: options.envelope,
			volume: -10,
		});
		this._modulator = new Synth({
			context: this.context,
			oscillator: options.modulation,
			envelope: options.modulationEnvelope,
			volume: -10,
		});
		
		this.oscillator = this._carrier.oscillator;
		this.envelope = this._carrier.envelope;
		this.modulation = this._modulator.oscillator;
		this.modulationEnvelope = this._modulator.envelope;

		this.frequency = new Signal({
			context: this.context,
			units: "frequency",
		});
		this.detune = new Signal({
			context: this.context,
			value: options.detune,
			units: "cents"
		});
		this.harmonicity = new Multiply({
			context: this.context,
			value: options.harmonicity,
		});
		this.modulationIndex = new Multiply({
			context: this.context,
			value: options.modulationIndex,
		});
		this._modulationNode = new Gain({
			context: this.context,
			gain: 0,
		});

		// control the two voices frequency
		this.frequency.connect(this._carrier.frequency);
		this.frequency.chain(this.harmonicity, this._modulator.frequency);
		this.frequency.chain(this.modulationIndex, this._modulationNode);
		this.detune.fan(this._carrier.detune, this._modulator.detune);
		this._modulator.connect(this._modulationNode.gain);
		this._modulationNode.connect(this._carrier.frequency);
		this._carrier.connect(this.output);
	}

	static getDefaults(): FMSynthOptions {
		return Object.assign(Monophonic.getDefaults(), {
			harmonicity: 3,
			modulationIndex: 10,
			detune: 0,
			oscillator: Object.assign(
				omitFromObject(OmniOscillator.getDefaults(), [
					...Object.keys(Source.getDefaults()),
					"frequency",
					"detune"
				]),
				{
					type: "sine"
				}
			),
			envelope: Object.assign(
				omitFromObject(
					Envelope.getDefaults(),
					Object.keys(ToneAudioNode.getDefaults())
				),
				{
					attack: 0.01,
					decay: 0.01,
					sustain: 1,
					release: 0.5
				}
			),
			modulation: Object.assign(
				omitFromObject(OmniOscillator.getDefaults(), [
					...Object.keys(Source.getDefaults()),
					"frequency",
					"detune"
				]),
				{
					type: "square"
				}
			),
			modulationEnvelope: Object.assign(
				omitFromObject(
					Envelope.getDefaults(),
					Object.keys(ToneAudioNode.getDefaults())
				),
				{
					attack: 0.5,
					decay: 0.0,
					sustain: 1,
					release: 0.5
				}
			)
		});
	}

	/**
	 * Trigger the attack portion of the note
	 */
	protected _triggerEnvelopeAttack(time: Seconds, velocity: number): void {
		// @ts-ignore
		this._carrier._triggerEnvelopeAttack(time, velocity);
		// @ts-ignore
		this._modulator._triggerEnvelopeAttack(time, velocity);
	}
	
	/**
	 * Trigger the release portion of the note
	 */
	protected _triggerEnvelopeRelease(time: Seconds) {
		// @ts-ignore
		this._carrier._triggerEnvelopeRelease(time);
		// @ts-ignore
		this._modulator._triggerEnvelopeRelease(time);
		return this;
	}

	dispose(): this {
		super.dispose();
		this._carrier.dispose();
		this._modulator.dispose();
		this.frequency.dispose();
		this.detune.dispose();
		this.modulationIndex.dispose();
		this.harmonicity.dispose();
		this._modulationNode.dispose();
		return this;
	}
}
