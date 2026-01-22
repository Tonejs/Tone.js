import { Panner } from "../component/channel/Panner.js";
import { Frequency, NormalRange } from "../core/type/Units.js";
import { optionsFromArguments } from "../core/util/Defaults.js";
import { LFOEffect, LFOEffectOptions } from "./LFOEffect.js";

export interface AutoPannerOptions extends LFOEffectOptions {
	channelCount: number;
	width: NormalRange;
}

/**
 * AutoPanner is a {@link Panner} with an {@link LFO} connected to the pan amount.
 * [Related Reading](https://www.ableton.com/en/blog/autopan-chopper-effect-and-more-liveschool/).
 *
 * @example
 * // create an autopanner and start it
 * const autoPanner = new Tone.AutoPanner("4n").toDestination().start();
 * // route an oscillator through the panner and start it
 * const oscillator = new Tone.Oscillator().connect(autoPanner).start();
 * @category Effect
 */
export class AutoPanner extends LFOEffect<AutoPannerOptions> {
	readonly name: string = "AutoPanner";

	/**
	 * The filter node
	 */
	private readonly _panner: Panner;

	private _width: NormalRange;

	/**
	 * @param frequency Rate of left-right oscillation.
	 */
	constructor(frequency?: Frequency);
	constructor(options?: Partial<AutoPannerOptions>);
	constructor() {
		const options = optionsFromArguments(
			AutoPanner.getDefaults(),
			arguments,
			["frequency"]
		);
		super(options);

		this._panner = new Panner({
			context: this.context,
			channelCount: options.channelCount,
		});

		this._width = options.width;

		// connections
		this.connectEffect(this._panner);
		this._lfo.connect(this._panner.pan);
		this._updateLFORange();
	}

	static getDefaults(): AutoPannerOptions {
		return Object.assign(LFOEffect.getDefaults(), {
			channelCount: 1,
			width: 1,
		});
	}

	/**
	 * Updates the LFO min/max based on width
	 */
	private _updateLFORange(): void {
		this._lfo.min = -this._width;
		this._lfo.max = this._width;
	}

	/**
	 * The width of the panning effect. 0 = no panning, 1 = full left-right panning.
	 */
	get width(): NormalRange {
		return this._width;
	}

	set width(width: NormalRange) {
		this._width = width;
		this._updateLFORange();
	}

	dispose(): this {
		super.dispose();
		this._panner.dispose();
		return this;
	}
}
