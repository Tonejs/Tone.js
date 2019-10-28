import { AmplitudeEnvelope } from "../component/envelope/AmplitudeEnvelope";
import { Envelope } from "../component/envelope/Envelope";
import { Filter } from "../component/filter/Filter";
import { omitFromObject, optionsFromArguments } from "../core/util/Defaults";
import { readOnly, RecursivePartial } from "../core/util/Interface";
import { Monophonic } from "../instrument/Monophonic";
import { OmniOscillator } from "../source/oscillator/OmniOscillator";
import { Source } from "../source/Source";
import { Synth, SynthOptions } from "./Synth";
import { FrequencyEnvelope } from "Tone/component/envelope/FrequencyEnvelope";
import { Time } from "Tone/core/type/Units";
import { Signal } from "Tone";
import { OutputNode } from "Tone/core";

/**
 * MonoSynth is composed of one `oscillator`, one `filter`, and two `envelopes`.
 * The amplitude of the Oscillator and the cutoff frequency of the
 * Filter are controlled by Envelopes.
 * <img src="https://docs.google.com/drawings/d/1gaY1DF9_Hzkodqf8JI1Cg2VZfwSElpFQfI94IQwad38/pub?w=924&h=240">
 * @example
 * import { MonoSynth } from "tone";
 * const synth = new MonoSynth({
 * 		oscillator: {
 *			type: "square"
 *		},
 *		envelope: {
 *			attack: 0.1
 *		}
 * }).toDestination();
 * synth.triggerAttackRelease("C4", "8n");
 */
export class MonoSynth extends Monophonic<SynthOptions> {

	readonly name = "MonoSynth";

	/**
	 * The oscillator.
	 */
	readonly oscillator: OmniOscillator<any>;

	/**
	 * The frequency control.
	 */
	readonly frequency: Signal<"frequency">;

	/**
	 * The detune control.
	 */
	readonly detune: Signal<"cents">;

	/**
	 * The filter.
	 */
	readonly filter: Filter;

	/**
	 * The filter envelope.
	 */
	readonly filterEnvelope: FrequencyEnvelope;

	/**
	 * The amplitude envelope.
	 */
	readonly envelope: AmplitudeEnvelope;

	protected _internalChannels: OutputNode[];

	constructor(options?: RecursivePartial<SynthOptions>);
	constructor() {
		super(optionsFromArguments(MonoSynth.getDefaults(), arguments));
		const options = optionsFromArguments(MonoSynth.getDefaults(), arguments);

		this.oscillator = new OmniOscillator({ context: this.context });
		this.frequency = this.oscillator.frequency;
		this.detune = this.oscillator.detune;
		this.filter = new Filter({ context: this.context });
		this.filterEnvelope = new FrequencyEnvelope({ context: this.context });
		this.envelope = new AmplitudeEnvelope({ context: this.context });
		this._internalChannels = [this.oscillator, this.envelope, this.output];
		this.set(options);

		this.filter.frequency.value = 5000;
		// connect the oscillators to the output
		this.oscillator.chain(this.filter, this.envelope, this.output);
		// connect the filter envelope
		this.filterEnvelope.connect(this.filter.frequency);
		
		readOnly(this, ["oscillator", "frequency", "detune", "filter", "filterEnvelope", "envelope"]);
	}

	static getDefaults(): SynthOptions {
		return Object.assign(Synth.getDefaults(), {
			detune: 0,
			envelope: Object.assign(
				omitFromObject(Envelope.getDefaults(), Object.keys(Source.getDefaults())),
				{
					attack: 0.005,
					decay: 0.1,
					release: 1,
					sustain: 0.9,
				},
			),
			filter: {
				Q: 6,
				rolloff: -24,
				type: "lowpass",
			},
			filterEnvelope: {
				attack: 0.06,
				baseFrequency: 200,
				decay: 0.2,
				exponent: 2,
				octaves: 7,
				release: 2,
				sustain: 0.5,
			},
			frequency: "C4",
			oscillator: Object.assign(
				omitFromObject(OmniOscillator.getDefaults(), Object.keys(Source.getDefaults())),
				{
					type: "square",
				},
			),
		});
	}

	/**
	 * start the attack portion of the envelope
	 * @param time the time the attack should start
	 * @param velocity the velocity of the note (0-1)
	 */
	protected _triggerEnvelopeAttack(time?: Time, velocity: number = 1): void {
		const computedTime = this.toSeconds(time);
		this.envelope.triggerAttack(computedTime, velocity);
		this.filterEnvelope.triggerAttack(computedTime);
		this.oscillator.start(computedTime);
		if (this.envelope.sustain === 0) {
			const computedAttack = this.toSeconds(this.envelope.attack);
			const computedDecay = this.toSeconds(this.envelope.decay);
			this.oscillator.stop(computedTime + computedAttack + computedDecay);
		}
	}

	/**
	 * start the release portion of the envelope
	 * @param time the time the release should start
	 */
	protected _triggerEnvelopeRelease(time: Time): void {
		time = this.toSeconds(time);
		this.envelope.triggerRelease(time);
		this.oscillator.stop(time + this.toSeconds(this.envelope.release));
	}

	/**
	 * clean up
	 */
	dispose(): this {
		super.dispose();
		this.oscillator.dispose();
		this.envelope.dispose();
		this.filterEnvelope.dispose();
		this.filter.dispose();
		return this;
	}
}
