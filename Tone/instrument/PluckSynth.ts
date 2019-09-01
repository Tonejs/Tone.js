import { Param } from "Tone/core/context/Param";
import { Frequency, NormalRange, Note, Time } from "Tone/core/type/Units";
import { LowpassCombFilter } from "../component/filter/LowpassCombFilter";
import { deepMerge } from "../core/util/Defaults";
import { optionsFromArguments } from "../core/util/Defaults";
import { RecursivePartial } from "../core/util/Interface";
import { Signal } from "../signal/Signal";
import { Noise } from "../source/Noise";
import { Synth, SynthOptions } from "./Synth";

export interface PluckSynthOptions extends SynthOptions {
	attackNoise: number;
	dampening: Frequency;
	resonance: NormalRange;
}

/**
 *  Karplus-String string synthesis. Often out of tune.
 *  Will change when the AudioWorkerNode is available across
 *  browsers.
 *
 * @example
 * var plucky = new Tone.PluckSynth().toMaster();
 * plucky.triggerAttack("C4");
 */

export class PluckSynth extends Synth<PluckSynthOptions> {

	readonly name = "PluckSynth";

	private _noise: Noise;
	private _lfcf: LowpassCombFilter;

	/**
	 *  The amount of noise at the attack.
	 *  Nominal range of [0.1, 20]
	 */
	attackNoise: number;

	readonly resonance: Param<NormalRange>;
	readonly dampening: Signal<Frequency>;

	constructor(options?: RecursivePartial<PluckSynthOptions>)
	constructor() {

		super(optionsFromArguments(PluckSynth.getDefaults(), arguments));
		const options = optionsFromArguments(PluckSynth.getDefaults(), arguments);

		this._noise = new Noise("pink");

		this.attackNoise = options.attackNoise;

		this._lfcf = new LowpassCombFilter({
			dampening: options.dampening,
			resonance: options.resonance,
		});

		this.resonance = this._lfcf.resonance;
		this.dampening = this._lfcf.dampening;

		this._noise.connect(this._lfcf);
		this._lfcf.connect(this.output);
	}

	static getDefaults(): PluckSynthOptions {
		return deepMerge(Synth.getDefaults(), {
			attackNoise : 1,
			dampening : 4000,
			resonance : 0.7,
		});
	}

	triggerAttack(note: Note, time: Time = "now"): this {
		const freq = this.toFrequency(note);
		time = this.toSeconds(time);
		const delayAmount = 1 / freq;
		this._lfcf.delayTime.setValueAtTime(delayAmount, time);
		this._noise.start(time);
		this._noise.stop(time + delayAmount * this.attackNoise);
		return this;
	}

	dispose(): this {
		super.dispose();
		this._noise.dispose();
		this._lfcf.dispose();
		return this;
	}
}