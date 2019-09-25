import { Param } from "../core/context/Param";
import { Frequency, NormalRange, Time } from "../core/type/Units";
import { LowpassCombFilter } from "../component/filter/LowpassCombFilter";
import { deepMerge } from "../core/util/Defaults";
import { optionsFromArguments } from "../core/util/Defaults";
import { RecursivePartial } from "../core/util/Interface";
import { Signal } from "../signal/Signal";
import { Noise } from "../source/Noise";
import { Instrument, InstrumentOptions } from "./Instrument";

export interface PluckSynthOptions extends InstrumentOptions {
	attackNoise: number;
	dampening: Frequency;
	resonance: NormalRange;
}

/**
 * Karplus-String string synthesis. Often out of tune.
 *
 * @example
 * var plucky = new Tone.PluckSynth().toDestination();
 * plucky.triggerAttack("C4");
 * @category Instrument
 */
export class PluckSynth extends Instrument<PluckSynthOptions> {

	readonly name = "PluckSynth";

	/**
	 * Noise burst at the beginning
	 */
	private _noise: Noise;
	private _lfcf: LowpassCombFilter;

	/**
	 * The amount of noise at the attack.
	 * Nominal range of [0.1, 20]
	 * @min 0.1
	 * @max 20
	 */
	attackNoise: number;

	/**
	 * The resonance control.
	 */
	readonly resonance: Param<NormalRange>;

	constructor(options?: RecursivePartial<PluckSynthOptions>)
	constructor() {

		super(optionsFromArguments(PluckSynth.getDefaults(), arguments));
		const options = optionsFromArguments(PluckSynth.getDefaults(), arguments);

		this._noise = new Noise({
			context: this.context,
			type: "pink"
		});

		this.attackNoise = options.attackNoise;

		this._lfcf = new LowpassCombFilter({
			context: this.context,
			dampening: options.dampening,
			resonance: options.resonance,
		});

		this.resonance = this._lfcf.resonance;

		this._noise.connect(this._lfcf);
		this._lfcf.connect(this.output);
	}

	static getDefaults(): PluckSynthOptions {
		return deepMerge(Instrument.getDefaults(), {
			attackNoise: 1,
			dampening: 4000,
			resonance: 0.7,
		});
	}

	/**
	 * The dampening control. i.e. the lowpass filter frequency of the comb filter
	 * @min 0
	 * @max 7000
	 */
	get dampening(): Frequency {
		return this._lfcf.dampening;
	}
	set dampening(fq) {
		this._lfcf.dampening = fq;
	}

	triggerAttack(note: Frequency, time?: Time): this {
		const freq = this.toFrequency(note);
		time = this.toSeconds(time);
		const delayAmount = 1 / freq;
		this._lfcf.delayTime.setValueAtTime(delayAmount, time);
		this._noise.start(time);
		this._noise.stop(time + delayAmount * this.attackNoise);
		return this;
	}

	/**
	 * PluckSynths' trigger release method doesn't do anything.
	 */
	triggerRelease(): this{
		// does nothing
		return this;
	}

	dispose(): this {
		super.dispose();
		this._noise.dispose();
		this._lfcf.dispose();
		return this;
	}
}
