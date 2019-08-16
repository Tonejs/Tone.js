import { AmplitudeEnvelope } from "../component/envelope/AmplitudeEnvelope";
import { Frequency, NormalRange, Positive, Time } from "../core/type/Units";
import { deepMerge, optionsFromArguments } from "../core/util/Defaults";
import { readOnly, RecursivePartial } from "../core/util/Interface";
import { OmniOscillator } from "../source/oscillator/OmniOscillator";
import { Instrument } from "./Instrument";
import { Synth, SynthOptions } from "./Synth";

interface MembraneSynthOptions extends SynthOptions {
	pitchDecay: Time;
	octaves: Positive;
}

/**
 * MembraneSynth makes kick and tom sounds using a single oscillator
 * with an amplitude envelope and frequency ramp. A Tone.OmniOscillator
 * is routed through a Tone.AmplitudeEnvelope to the output. The drum
 * quality of the sound comes from the frequency envelope applied
 * during MembraneSynth.triggerAttack(note). The frequency envelope
 * starts at <code>note * .octaves</code> and ramps to <code>note</code>
 * over the duration of <code>.pitchDecay</code>.
 * @param options the options available for the synth see defaults below
 * @example
 * var synth = new MembraneSynth().toMaster();
 * synth.triggerAttackRelease("C2", "8n");
 */
export class MembraneSynth extends Instrument<MembraneSynthOptions> {

	readonly name = "MembraneSynth";

	/**
	 *  The oscillator.
	 */
	readonly oscillator: OmniOscillator<any>;

	/**
	 *  The evelope.
	 */
	readonly envelope: AmplitudeEnvelope;

	/**
	 *  The number of octaves the pitch envelope ramps.
	 */
	octaves: Positive;

	/**
	 *  The amount of time the frequency envelope takes.
	 */
	pitchDecay: Time;

	constructor(options?: RecursivePartial<MembraneSynthOptions>)
	constructor() {

		super(optionsFromArguments(MembraneSynth.getDefaults(), arguments));
		const options = optionsFromArguments(MembraneSynth.getDefaults(), arguments);

		this.oscillator = new OmniOscillator(Object.assign({
			context: this.context,
		}, options.oscillator));
		this.envelope = new AmplitudeEnvelope(Object.assign({
			context: this.context,
		}, options.envelope));
		this.octaves = options.octaves;
		this.pitchDecay = options.pitchDecay;
		this.oscillator.chain(this.envelope, this.output);
		readOnly(this, ["oscillator", "envelope"]);
	}

	static getDefaults(): MembraneSynthOptions {
		return deepMerge(Instrument.getDefaults(), Synth.getDefaults(), {
			envelope : {
				attack : 0.001,
				attackCurve : "exponential",
				decay : 0.4,
				release : 1.4,
				sustain : 0.01,
			},
			octaves: 10,
			oscillator: {
				type: "sine",
			},
			pitchDecay: 0.05,
		});
	}

	/**
	 *  Trigger the note at the given time with the given velocity.
	 *
	 *  @param  note     the note
	 *  @param  time the time, if not given is now
	 *  @param  velocity defaults to 1
	 *  @example
	 *  kick.triggerAttack(60);
	 */
	triggerAttack(note: Frequency, time?: Time, velocity?: NormalRange): this {
		const seconds = this.toSeconds(time);
		const hertz = this.toFrequency(note);
		const maxNote = hertz * this.octaves;
		this.oscillator.frequency.setValueAtTime(maxNote, seconds);
		this.oscillator.frequency.exponentialRampToValueAtTime(hertz, seconds + this.toSeconds(this.pitchDecay));
		this.envelope.triggerAttack(seconds, velocity);
		this.oscillator.start(seconds);
		if (this.envelope.sustain === 0) {
			this.oscillator.stop(seconds + this.toSeconds(this.envelope.attack) + this.toSeconds(this.envelope.decay));
		}
		return this;
	}

	/**
	 *  Trigger the release portion of the note.
	 *  @param  time the time the note will release
	 */
	triggerRelease(time?: Time): this {
		const seconds = this.toSeconds(time);
		this.envelope.triggerRelease(seconds);
		this.oscillator.stop(seconds + this.toSeconds(this.envelope.release));
		return this;
	}

	dispose(): this {
		super.dispose();
		this.oscillator.dispose();
		this.envelope.dispose();
		return this;
	}
}
