// tslint:disable: max-line-length
import { Filter } from "../component/filter/Filter";
import { Gain } from "../core/context/Gain";
import { Frequency, NormalRange, Positive, Time } from "../core/type/Units";
import { deepMerge, optionsFromArguments } from "../core/util/Defaults";
import { RecursivePartial } from "../core/util/Interface";
import { Multiply } from "../signal/Multiply";
import { Scale } from "../signal/Scale";
import { Signal } from "../signal/Signal";
import { FMOscillator } from "../source/oscillator/FMOscillator";
import { Synth, SynthOptions } from "./Synth";

interface MetalSynthOptions extends SynthOptions {
	frequency: Frequency;
	harmonicity: Positive;
	modulationIndex: Positive;
	octaves: number;
	resonance: Frequency;
}

/**
 *  Inharmonic ratio of frequencies based on the Roland TR-808
 *  Taken from https://ccrma.stanford.edu/papers/tr-808-cymbal-physically-informed-circuit-bendable-digital-model
 */
const inharmRatios: number[] = [1.0, 1.483, 1.932, 2.546, 2.630, 3.897];

/**
 * A highly inharmonic and spectrally complex source with a highpass filter
 * and amplitude envelope which is good for making metalophone sounds.
 * Based on CymbalSynth by [@polyrhythmatic](https://github.com/polyrhythmatic).
 * Inspiration from [Sound on Sound](https://web.archive.org/web/20160610143924/https://www.soundonsound.com/sos/jul02/articles/synthsecrets0702.asp).
 */

export class MetalSynth extends Synth<MetalSynthOptions> {

	readonly name = "MetalSynth";

	private _amplitue: Gain;
	private _freqMultipliers: Multiply[] = [];
	private _filterFreqScaler: Scale;
	private _highpass: Filter;
	private _octaves: number;
	private _oscillators: FMOscillator[] = [];
	frequency: Signal<Frequency>;

	constructor(options?: RecursivePartial<MetalSynthOptions>)
	constructor() {
		super(optionsFromArguments(MetalSynth.getDefaults(), arguments));
		const options = optionsFromArguments(MetalSynth.getDefaults(), arguments);

		this.octaves = options.octaves;
		this.frequency = new Signal(options.frequency);

		this._octaves = options.octaves;

		this._amplitue = new Gain(0).connect(this.output);

		this._highpass = new Filter({
			Q: -3.0102999566398125,
			type: "highpass",
		}).connect(this._amplitue);

		for (let i = 0; i < inharmRatios.length; i++) {
			const osc = new FMOscillator({
				harmonicity: options.harmonicity,
				modulationIndex: options.modulationIndex,
				modulationType: "square",
				type: "square",
			});
			osc.connect(this._highpass);
			this._oscillators[i] = osc;

			const mult = new Multiply(inharmRatios[i]);
			this._freqMultipliers[i] = mult;
			this.frequency.chain(mult, osc.frequency);
		}

		this._filterFreqScaler = new Scale(this.toFrequency(options.resonance), 7000);
		this.envelope.chain(this._filterFreqScaler, this._highpass.frequency);
		this.envelope.connect(this._amplitue.gain);
	}

	static getDefaults(): MetalSynthOptions {
		return deepMerge(Synth.getDefaults(), {
			envelope: {
				attack: 0.001,
				decay: 1.4,
				release: 0.2,
			},
			frequency: 200,
			harmonicity: 5.1,
			modulationIndex: 32,
			octaves: 1.5,
			resonance: 4000,
		});
	}

	/**
	 *  Trigger the attack.
	 *  @param time When the attack should be triggered.
	 *  @param velocity The velocity that the envelope should be triggered at.
	 */
	public triggerAttack(time: Time, velocity: NormalRange = 1): this {
		this.envelope.triggerAttack(time, velocity);
		this._oscillators.forEach(osc => osc.start(time));
		if (this.envelope.sustain === 0) {
			this._oscillators.forEach(osc => {
				osc.stop(this.toSeconds(time) + this.toSeconds(this.envelope.attack) + this.toSeconds(this.envelope.decay));
			});
		}
		return this;
	}

	/**
	 *  Trigger the release of the envelope.
	 *  @param time When the release should be triggered.
	 */
	public triggerRelease(time: Time): this {
		this.envelope.triggerRelease(time);
		this._oscillators.forEach(osc => osc.stop(this.toSeconds(time) + this.toSeconds(this.envelope.release)));
		return this;
	}

	/**
	 *  Trigger the attack and release of the envelope after the given
	 *  duration.
	 *  @param duration  The duration before triggering the release
	 *  @param time      When the attack should be triggered.
	 *  @param velocity  The velocity that the envelope should be triggered at.
	 */
	public triggerAttackRelease(duration: Time, time: Time, velocity: NormalRange = 1): this {
		this.triggerAttack(time, velocity);
		this.triggerRelease(this.toSeconds(time) + this.toSeconds(duration));
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
	public sync(): this {
		this._syncMethod("triggerRelease", 0);
		this._syncMethod("triggerAttack", 0);
		return this;
	}

	/**
	 *  The modulationIndex of the oscillators which make up the source.
	 *  see Tone.FMOscillator.modulationIndex
	 */
	public get modulationIndex(): number {
		return this._oscillators[0].modulationIndex.value;
	}

	public set modulationIndex(val: number) {
		this._oscillators.forEach(osc => (osc.modulationIndex.value = val));
	}

	/**
	 *  The harmonicity of the oscillators which make up the source.
	 *  see Tone.FMOscillator.harmonicity
	 */
	public get harmonicity(): number {
		return this._oscillators[0].harmonicity.value;
	}

	public set harmonicity(val: number) {
		this._oscillators.forEach(osc => (osc.harmonicity.value = val));
	}

	/**
	 *  The frequency of the highpass filter attached to the envelope
	 */
	public get resonance(): number {
		return this._filterFreqScaler.min;
	}

	public set resonance(val: number) {
		this._filterFreqScaler.min = val;
		this.octaves = this._octaves;
	}

	/**
	 *  The number of octaves above the "resonance" frequency
	 *  that the filter ramps during the attack/decay envelope
	 */
	public get octaves(): number {
		return this._octaves;
	}

	public set octaves(val: number) {
		this._octaves = val;
		this._filterFreqScaler.max = this._filterFreqScaler.min * Math.pow(2, val);
	}

	dispose(): this {
		super.dispose();
		this._oscillators.forEach(osc => osc.dispose());
		this._freqMultipliers.forEach(freqMult => freqMult.dispose());
		this.frequency.dispose();
		this._filterFreqScaler.dispose();
		this._amplitue.dispose();
		this.envelope.dispose();
		this._highpass.dispose();
		return this;
	}
}
