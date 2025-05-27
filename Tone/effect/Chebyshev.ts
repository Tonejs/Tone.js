import { Positive } from "../core/type/Units.js";
import { assert } from "../core/util/Debug.js";
import { optionsFromArguments } from "../core/util/Defaults.js";
import { WaveShaper } from "../signal/WaveShaper.js";
import { Effect, EffectOptions } from "./Effect.js";

export interface ChebyshevOptions extends EffectOptions {
	order: Positive;
	oversample: OverSampleType;
}

/**
 * Chebyshev is a waveshaper which is good
 * for making different types of distortion sounds.
 * Note that odd orders sound very different from even ones,
 * and order = 1 is no change.
 * Read more at [music.columbia.edu](http://music.columbia.edu/cmc/musicandcomputers/chapter4/04_06.php).
 * @example
 * // create a new cheby
 * const cheby = new Tone.Chebyshev(50).toDestination();
 * // create a monosynth connected to our cheby
 * const synth = new Tone.MonoSynth().connect(cheby);
 * synth.triggerAttackRelease("C2", 0.4);
 * @category Effect
 */
export class Chebyshev extends Effect<ChebyshevOptions> {
	readonly name: string = "Chebyshev";

	/**
	 * The private waveshaper node
	 */
	private _shaper: WaveShaper;

	/**
	 * holds onto the order of the filter
	 */
	private _order: number;

	/**
	 * @param order The order of the chebyshev polynomial. Normal range between 1-100.
	 */
	constructor(order?: Positive);
	constructor(options?: Partial<ChebyshevOptions>);
	constructor() {
		const options = optionsFromArguments(
			Chebyshev.getDefaults(),
			arguments,
			["order"]
		);
		super(options);

		this._shaper = new WaveShaper({
			context: this.context,
			length: 4096,
		});
		this._order = options.order;

		this.connectEffect(this._shaper);
		this.order = options.order;
		this.oversample = options.oversample;
	}

	static getDefaults(): ChebyshevOptions {
		return Object.assign(Effect.getDefaults(), {
			order: 1,
			oversample: "none" as const,
		});
	}

	/**
	 * get the coefficient for that degree
	 * @param  x the x value
	 * @param  degree
	 * @param  memo memoize the computed value. this speeds up computation greatly.
	 */
	private _getCoefficient(
		x: number,
		degree: number,
		memo: Map<number, number>
	): number {
		if (memo.has(degree)) {
			return memo.get(degree) as number;
		} else if (degree === 0) {
			memo.set(degree, 0);
		} else if (degree === 1) {
			memo.set(degree, x);
		} else {
			memo.set(
				degree,
				2 * x * this._getCoefficient(x, degree - 1, memo) -
					this._getCoefficient(x, degree - 2, memo)
			);
		}
		return memo.get(degree) as number;
	}

	/**
	 * The order of the Chebyshev polynomial which creates the equation which is applied to the incoming
	 * signal through a Tone.WaveShaper. Must be an integer. The equations are in the form:
	 * ```
	 * order 2: 2x^2 + 1
	 * order 3: 4x^3 + 3x
	 * ```
	 * @min 1
	 * @max 100
	 */
	get order(): Positive {
		return this._order;
	}
	set order(order) {
		assert(Number.isInteger(order), "'order' must be an integer");
		this._order = order;
		this._shaper.setMap((x) => {
			return this._getCoefficient(x, order, new Map());
		});
	}

	/**
	 * The oversampling of the effect. Can either be "none", "2x" or "4x".
	 */
	get oversample(): OverSampleType {
		return this._shaper.oversample;
	}
	set oversample(oversampling) {
		this._shaper.oversample = oversampling;
	}

	dispose(): this {
		super.dispose();
		this._shaper.dispose();
		return this;
	}
}
