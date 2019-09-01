
import { AmplitudeEnvelope } from "../component/envelope/AmplitudeEnvelope";
import { NormalRange, Time } from "../core/type/Units";
import { deepMerge, optionsFromArguments } from "../core/util/Defaults";
import { RecursivePartial } from "../core/util/Interface";
import { Noise, NoiseType } from "../source/Noise";
import { Instrument } from "./Instrument";
import { Synth, SynthOptions } from "./Synth";

interface NoiseSynthOptions extends SynthOptions {
	noise: {
		type: NoiseType,
	};
}

/**
 * Tone.NoiseSynth is composed of a noise generator (Tone.Noise), one filter (Tone.Filter),
 * and two envelopes (Tone.Envelop). One envelope controls the amplitude
 * of the noise and the other is controls the cutoff frequency of the filter.
 * <img src="https://docs.google.com/drawings/d/1rqzuX9rBlhT50MRvD2TKml9bnZhcZmzXF1rf_o7vdnE/pub?w=918&h=242">
 *
 * @example
 * var noiseSynth = new Tone.NoiseSynth().toMaster();
 * noiseSynth.triggerAttackRelease("8n");
 */
export class NoiseSynth extends Instrument<NoiseSynthOptions> {

	readonly name = "NoiseSynth";

	/**
	 * The noise source.
	 */
	readonly noise: Noise;

	/**
	 * The amplitude envelope.
	 */
	readonly envelope: AmplitudeEnvelope;

	constructor(options?: RecursivePartial<NoiseSynthOptions>)
	constructor() {
		super(optionsFromArguments(NoiseSynth.getDefaults(), arguments));
		const options = optionsFromArguments(NoiseSynth.getDefaults(), arguments);
		this.noise = new Noise(options.noise);
		this.envelope = new AmplitudeEnvelope(options.envelope);

		// connect the noise to the output
		this.noise.chain(this.envelope, this.output);
	}

	static getDefaults(): NoiseSynthOptions {
		return {
			...deepMerge(Synth.getDefaults(), {
				envelope: {
					attack : 0.005,
					decay : 0.1,
					sustain : 0.0,
				},
			}),
			noise : {
				type : "white",
			},
		};
	}

	/**
	 * Start the attack portion of the envelopes. Unlike other
	 * instruments, Tone.NoiseSynth doesn't have a note.
	 * @example
	 * noiseSynth.triggerAttack();
	 */
	triggerAttack(time: Time, velocity: NormalRange = 1): this {
		time = this.toSeconds(time);
		// the envelopes
		this.envelope.triggerAttack(time, velocity);
		// start the noise
		this.noise.start(time);
		if (this.envelope.sustain === 0) {
			this.noise.stop(time + this.toSeconds(this.envelope.attack) + this.toSeconds(this.envelope.decay))
		}
		return this;
	}

	/**
	 * Start the release portion of the envelopes.
	 */
	triggerRelease(time: Time): this {
		time = this.toSeconds(time);
		this.envelope.triggerRelease(time);
		this.noise.stop(time + this.toSeconds(this.envelope.release));
		return this;
	}

	/**
	 * Sync the instrument to the Transport. All subsequent calls of
	 * [triggerAttack](#triggerattack) and [triggerRelease](#triggerrelease)
	 * will be scheduled along the transport.
	 * @example
	 * synth.sync()
	 * //schedule 3 notes when the transport first starts
	 * synth.triggerAttackRelease('8n', 0)
	 * synth.triggerAttackRelease('8n', '8n')
	 * synth.triggerAttackRelease('8n', '4n')
	 * //start the transport to hear the notes
	 * Transport.start()
	 */
	sync(): this {
		this._syncMethod("triggerAttack", 0);
		this._syncMethod("triggerRelease", 0);
		return this;
	}

	triggerAttackRelease(duration: Time, time: Time, velocity: NormalRange = 1): this {
		time = this.toSeconds(time);
		duration = this.toSeconds(duration);
		this.triggerAttack(time, velocity);
		this.triggerRelease(time + duration);
		return this;
	}

	dispose(): this {
		super.dispose();
		this.noise.dispose();
		this.envelope.dispose();
		return this;
	}
}
