import { Effect, EffectOptions } from "../effect/Effect";
import { Frequency, NormalRange, Positive, Time } from "../core/type/Units";
import { LFO } from "../source/oscillator/LFO";
import { ToneOscillatorType } from "../source/oscillator/OscillatorInterface";
import { Filter, FilterOptions } from "../component/filter/Filter";
import { SourceOptions } from "../source/Source";
import { optionsFromArguments } from "../core/util/Defaults";
import { Signal } from "../signal/Signal";
import { readOnly } from "../core/util/Interface";
import { Param } from "../core/context/Param";

export interface AutoFilterOptions extends EffectOptions {
	frequency: Frequency;
	baseFrequency: Frequency;
	octaves: Positive;
	type: ToneOscillatorType;
	depth: NormalRange;
	filter: Omit<FilterOptions, keyof SourceOptions | "frequency" | "detune" | "gain">;
}

/**
 * AutoFilter is a Tone.Filter with a Tone.LFO connected to the filter cutoff frequency.
 * Setting the LFO rate and depth allows for control over the filter modulation rate 
 * and depth.
 *
 * @example
 * import { AutoFilter, Oscillator } from "tone";
 * // create an autofilter and start it's LFO
 * const autoFilter = new AutoFilter("4n").toDestination().start();
 * // route an oscillator through the filter and start it
 * const oscillator = new Oscillator().connect(autoFilter).start();
 */
export class AutoFilter extends Effect<AutoFilterOptions> {

	readonly name: string = "AutoFilter";

	/**
	 * the lfo which drives the filter cutoff
	 */
	private _lfo: LFO;
	
	/**
	 * The range of the filter modulating between the min and max frequency. 
	 * 0 = no modulation. 1 = full modulation.
	 */
	readonly depth: Param<"normalRange">;
	
	/**
	 * How fast the filter modulates between min and max. 
	 */
	readonly frequency: Signal<"frequency">;
	
	/**
	 * The filter node
	 */
	readonly filter: Filter;
	
	/**
	 * The octaves placeholder
	 */
	private _octaves: Positive;

	/**
	 * @param frequency The rate of the LFO.
	 * @param baseFrequency The lower value of the LFOs oscillation
	 * @param octaves The number of octaves above the baseFrequency
	 */
	constructor(frequency?: Frequency, baseFrequency?: Frequency, octaves?: Positive);
	constructor(options?: Partial<AutoFilterOptions>);
	constructor() {

		super(optionsFromArguments(AutoFilter.getDefaults(), arguments, ["frequency", "baseFrequency", "octaves"]));
		const options = optionsFromArguments(AutoFilter.getDefaults(), arguments, ["frequency", "baseFrequency", "octaves"]);

		this._lfo = new LFO({
			context: this.context,
			frequency: options.frequency,
			amplitude: options.depth,
		});
		this.depth = this._lfo.amplitude;
		this.frequency = this._lfo.frequency;
		this.filter = new Filter(Object.assign(options.filter, {
			context: this.context,
		}));
		this._octaves = 0;

		// connections
		this.connectEffect(this.filter);
		this._lfo.connect(this.filter.frequency);
		this.type = options.type;
		readOnly(this, ["frequency", "depth"]);
		this.octaves = options.octaves;
		this.baseFrequency = options.baseFrequency;
	}

	static getDefaults(): AutoFilterOptions {
		return Object.assign(Effect.getDefaults(), {
			frequency: 1,
			type: "sine" as ToneOscillatorType,
			depth: 1,
			baseFrequency: 200,
			octaves: 2.6,
			filter: {
				type: "lowpass" as "lowpass",
				rolloff: -12 as -12,
				Q: 1,
			}
		});
	}

	/**
	 * Start the effect.
	 */
	start(time?: Time): this {
		this._lfo.start(time);
		return this;
	}

	/**
	 * Stop the lfo
	 */
	stop(time?: Time): this {
		this._lfo.stop(time);
		return this;
	}

	/**
	 * Sync the filter to the transport. See [[LFO.sync]]
	 */
	sync(): this {
		this._lfo.sync();
		return this;
	}

	/**
	 * Unsync the filter from the transport.
	 */
	unsync(): this {
		this._lfo.unsync();
		return this;
	}

	/**
	 * The type of the LFO's oscillator: See [[Oscillator.type]]
	 * @example
	 * import { AutoFilter, Noise } from "tone";
	 * const autoFilter = new AutoFilter().start().toDestination();
	 * const noise = new Noise().start().connect(autoFilter);
	 * autoFilter.type = "square";
	 */
	get type() {
		return this._lfo.type;
	}
	set type(type) {
		this._lfo.type = type;
	}

	/**
	 * The minimum value of the filter's cutoff frequency.
	 */
	get baseFrequency(): Frequency {
		return this._lfo.min;
	}
	set baseFrequency(freq) {
		this._lfo.min = this.toFrequency(freq);
		// and set the max
		this.octaves = this._octaves;
	}

	/**
	 * The maximum value of the filter's cutoff frequency. 
	 */
	get octaves(): Positive {
		return this._octaves;
	}
	set octaves(oct) {
		this._octaves = oct;
		this._lfo.max = this._lfo.min * Math.pow(2, oct);
	}

	dispose(): this {
		super.dispose();
		this._lfo.dispose();
		this.filter.dispose();
		this.frequency.dispose();
		this.depth.dispose();
		return this;
	}
}
