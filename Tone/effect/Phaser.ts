import { Frequency, Hertz, Positive } from "../core/type/Units.js";
import { optionsFromArguments } from "../core/util/Defaults.js";
import { readOnly } from "../core/util/Interface.js";
import { Signal } from "../signal/Signal.js";
import { LFO } from "../source/oscillator/LFO.js";
import { StereoEffect, StereoEffectOptions } from "./StereoEffect.js";

export interface PhaserOptions extends StereoEffectOptions {
	frequency: Frequency;
	octaves: Positive;
	stages: Positive;
	Q: Positive;
	baseFrequency: Frequency;
}

/**
 * Phaser is a phaser effect. Phasers work by changing the phase
 * of different frequency components of an incoming signal. Read more on
 * [Wikipedia](https://en.wikipedia.org/wiki/Phaser_(effect)).
 * Inspiration for this phaser comes from [Tuna.js](https://github.com/Dinahmoe/tuna/).
 * @example
 * const phaser = new Tone.Phaser({
 * 	frequency: 15,
 * 	octaves: 5,
 * 	baseFrequency: 1000
 * }).toDestination();
 * const synth = new Tone.FMSynth().connect(phaser);
 * synth.triggerAttackRelease("E3", "2n");
 * @category Effect
 */
export class Phaser extends StereoEffect<PhaserOptions> {
	readonly name: string = "Phaser";

	/**
	 * the lfo which controls the frequency on the left side
	 */
	private _lfoL: LFO;

	/**
	 * the lfo which controls the frequency on the right side
	 */
	private _lfoR: LFO;

	/**
	 * the base modulation frequency
	 */
	private _baseFrequency: Hertz;

	/**
	 * the octaves of the phasing
	 */
	private _octaves: Positive;

	/**
	 * The quality factor of the filters
	 */
	readonly Q: Signal<"positive">;

	/**
	 * the array of filters for the left side
	 */
	private _filtersL: BiquadFilterNode[];

	/**
	 * the array of filters for the left side
	 */
	private _filtersR: BiquadFilterNode[];

	/**
	 * the frequency of the effect
	 */
	readonly frequency: Signal<"frequency">;

	/**
	 * @param frequency The speed of the phasing.
	 * @param octaves The octaves of the effect.
	 * @param baseFrequency The base frequency of the filters.
	 */
	constructor(
		frequency?: Frequency,
		octaves?: Positive,
		baseFrequency?: Frequency
	);
	constructor(options?: Partial<PhaserOptions>);
	constructor() {
		const options = optionsFromArguments(Phaser.getDefaults(), arguments, [
			"frequency",
			"octaves",
			"baseFrequency",
		]);
		super(options);

		this._lfoL = new LFO({
			context: this.context,
			frequency: options.frequency,
			min: 0,
			max: 1,
		});
		this._lfoR = new LFO({
			context: this.context,
			frequency: options.frequency,
			min: 0,
			max: 1,
			phase: 180,
		});
		this._baseFrequency = this.toFrequency(options.baseFrequency);
		this._octaves = options.octaves;
		this.Q = new Signal({
			context: this.context,
			value: options.Q,
			units: "positive",
		});
		this._filtersL = this._makeFilters(options.stages, this._lfoL);
		this._filtersR = this._makeFilters(options.stages, this._lfoR);

		this.frequency = this._lfoL.frequency;
		this.frequency.value = options.frequency;

		// connect them up
		this.connectEffectLeft(...this._filtersL);
		this.connectEffectRight(...this._filtersR);
		// control the frequency with one LFO
		this._lfoL.frequency.connect(this._lfoR.frequency);
		// set the options
		this.baseFrequency = options.baseFrequency;
		this.octaves = options.octaves;
		// start the lfo
		this._lfoL.start();
		this._lfoR.start();
		readOnly(this, ["frequency", "Q"]);
	}

	static getDefaults(): PhaserOptions {
		return Object.assign(StereoEffect.getDefaults(), {
			frequency: 0.5,
			octaves: 3,
			stages: 10,
			Q: 10,
			baseFrequency: 350,
		});
	}

	private _makeFilters(
		stages: number,
		connectToFreq: LFO
	): BiquadFilterNode[] {
		const filters: BiquadFilterNode[] = [];
		// make all the filters
		for (let i = 0; i < stages; i++) {
			const filter = this.context.createBiquadFilter();
			filter.type = "allpass";
			this.Q.connect(filter.Q);
			connectToFreq.connect(filter.frequency);
			filters.push(filter);
		}
		return filters;
	}

	/**
	 * The number of octaves the phase goes above the baseFrequency
	 */
	get octaves() {
		return this._octaves;
	}
	set octaves(octaves) {
		this._octaves = octaves;
		const max = this._baseFrequency * Math.pow(2, octaves);
		this._lfoL.max = max;
		this._lfoR.max = max;
	}

	/**
	 * The the base frequency of the filters.
	 */
	get baseFrequency(): Frequency {
		return this._baseFrequency;
	}
	set baseFrequency(freq) {
		this._baseFrequency = this.toFrequency(freq);
		this._lfoL.min = this._baseFrequency;
		this._lfoR.min = this._baseFrequency;
		this.octaves = this._octaves;
	}

	dispose(): this {
		super.dispose();
		this.Q.dispose();
		this._lfoL.dispose();
		this._lfoR.dispose();
		this._filtersL.forEach((f) => f.disconnect());
		this._filtersR.forEach((f) => f.disconnect());
		this.frequency.dispose();
		return this;
	}
}
