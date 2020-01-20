import { Param } from "../../core/context/Param";
import { ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { AudioRange } from "../../core/type/Units";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";

interface TonePannerOptions extends ToneAudioNodeOptions {
	pan: AudioRange;
}

/**
 * Panner is an equal power Left/Right Panner. It is a wrapper around the StereoPannerNode.
 * @example
 * import { Oscillator, Panner } from "tone";
 * // pan the input signal hard right.
 * const panner = new Panner(1).toDestination();
 * const osc = new Oscillator().connect(panner).start();
 * @category Component
 */
export class Panner extends ToneAudioNode<TonePannerOptions> {

	readonly name: string = "Panner";

	/**
	 * the panner node
	 */
	private _panner: StereoPannerNode = this.context.createStereoPanner();
	readonly input: StereoPannerNode = this._panner;
	readonly output: StereoPannerNode = this._panner;

	/**
	 * The pan control. -1 = hard left, 1 = hard right.
	 * @min -1
	 * @max 1
	 */
	readonly pan: Param<"audioRange">;

	constructor(options?: Partial<TonePannerOptions>);
	/**
	 * @param pan The initial panner value (Defaults to 0 = "center").
	 */
	constructor(pan?: AudioRange);
	constructor() {
		super(Object.assign(optionsFromArguments(Panner.getDefaults(), arguments, ["pan"])));
		const options = optionsFromArguments(Panner.getDefaults(), arguments, ["pan"]);

		this.pan = new Param({
			context: this.context,
			param: this._panner.pan,
			value: options.pan,
			minValue: -1,
			maxValue: 1,
		});

		// this is necessary for standardized-audio-context
		// doesn't make any difference for the native AudioContext
		// https://github.com/chrisguttandin/standardized-audio-context/issues/647
		this._panner.channelCount = 1;
		this._panner.channelCountMode = "explicit";

		// initial value
		readOnly(this, "pan");
	}

	static getDefaults(): TonePannerOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			pan: 0,
		});
	}

	dispose(): this {
		super.dispose();
		this._panner.disconnect();
		this.pan.dispose();
		return this;
	}
}
