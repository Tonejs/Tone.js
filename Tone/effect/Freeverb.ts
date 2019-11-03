import { StereoEffect, StereoEffectOptions } from "./StereoEffect";
import { Frequency, NormalRange } from "../core/type/Units";
import { optionsFromArguments } from "../core/util/Defaults";
import { readOnly } from "../core/util/Interface";
import { Signal } from "../signal/Signal";
import { LowpassCombFilter } from "../component/filter/LowpassCombFilter";

export interface FreeverbOptions extends StereoEffectOptions {
	dampening: Frequency;
	roomSize: NormalRange;
}

/**
 * An array of comb filter delay values from Freeverb implementation
 */
const combFilterTunings = [1557 / 44100, 1617 / 44100, 1491 / 44100, 1422 / 44100, 1277 / 44100, 1356 / 44100, 1188 / 44100, 1116 / 44100];

/**
 * An array of allpass filter frequency values from Freeverb implementation
 */
const allpassFilterFrequencies = [225, 556, 441, 341];

/**
 * Freeverb is a reverb based on [Freeverb](https://ccrma.stanford.edu/~jos/pasp/Freeverb.html).
 * Read more on reverb on [Sound On Sound](https://web.archive.org/web/20160404083902/http://www.soundonsound.com:80/sos/feb01/articles/synthsecrets.asp).
 * @example
 * import { Freeverb, NoiseSynth } from "tone";
 * const freeverb = new Freeverb().toDestination();
 * freeverb.dampening = 1000;
 * // routing synth through the reverb
 * const synth = new NoiseSynth().connect(freeverb);
 * synth.triggerAttackRelease(0.05);
 */
export class Freeverb extends StereoEffect<FreeverbOptions> {

	readonly name: string = "Freeverb";

	/**
	 * The roomSize value between 0 and 1. A larger roomSize will result in a longer decay.
	 */
	readonly roomSize: Signal<"normalRange">;

	/**
	 * the comb filters
	 */
	private _combFilters: LowpassCombFilter[] = [];

	/**
	 * the allpass filters on the left
	 */
	private _allpassFiltersL: BiquadFilterNode[] = [];

	/**
	 * the allpass filters on the right
	 */
	private _allpassFiltersR: BiquadFilterNode[]= [];

	/**
	 * @param roomSize Correlated to the decay time.
	 * @param dampening The cutoff frequency of a lowpass filter as part of the reverb.
	 */
	constructor(roomSize?: NormalRange, dampening?: Frequency);
	constructor(options?: Partial<FreeverbOptions>);
	constructor() {

		super(optionsFromArguments(Freeverb.getDefaults(), arguments, ["roomSize", "dampening"]));
		const options = optionsFromArguments(Freeverb.getDefaults(), arguments, ["roomSize", "dampening"]);
	
		this.roomSize = new Signal({
			context: this.context,
			value: options.roomSize,
			units: "normalRange",
		});

		// make the allpass filters on the right
		for (let l = 0; l < allpassFilterFrequencies.length; l++) {
			let allpassL = this.context.createBiquadFilter();
			allpassL.type = "allpass";
			allpassL.frequency.value = allpassFilterFrequencies[l];
			this._allpassFiltersL.push(allpassL);
		}

		// make the allpass filters on the left
		for (let r = 0; r < allpassFilterFrequencies.length; r++) {
			let allpassR = this.context.createBiquadFilter();
			allpassR.type = "allpass";
			allpassR.frequency.value = allpassFilterFrequencies[r];
			this._allpassFiltersR.push(allpassR);
		}

		// make the comb filters
		for (let c = 0; c < combFilterTunings.length; c++) {
			const lfpf = new LowpassCombFilter({
				context: this.context,
				delayTime: combFilterTunings[c],
				dampening: options.dampening,
			});
			if (c < combFilterTunings.length / 2) {
				this.connectEffectLeft(lfpf, ...this._allpassFiltersL);
			} else {
				this.connectEffectRight(lfpf, ...this._allpassFiltersR);
			}
			this.roomSize.connect(lfpf.resonance);
			this._combFilters.push(lfpf);
		}

		readOnly(this, ["roomSize"]);
	}

	static getDefaults(): FreeverbOptions {
		return Object.assign(StereoEffect.getDefaults(), {
			roomSize: 0.7,
			dampening: 3000
		});
	}

	/**
	 * The amount of dampening of the reverberant signal.
	 */
	
	get dampening(): Frequency {
		return this._combFilters[0].dampening;
	}
	set dampening(d) {
		this._combFilters.forEach(c => c.dampening = d);
	}

	dispose(): this {
		super.dispose();
		for (let al = 0; al < this._allpassFiltersL.length; al++) {
			this._allpassFiltersL[al].disconnect();
		}
		for (let ar = 0; ar < this._allpassFiltersR.length; ar++) {
			this._allpassFiltersR[ar].disconnect();
		}
		for (let cf = 0; cf < this._combFilters.length; cf++) {
			this._combFilters[cf].dispose();
		}
		this.roomSize.dispose();
		return this;
	}
}
