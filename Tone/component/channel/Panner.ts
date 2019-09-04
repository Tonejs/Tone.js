import { Param } from "../../core/context/Param";
import { ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { AudioRange, NormalRange } from "../../core/type/Units";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";

interface TonePannerOptions extends ToneAudioNodeOptions {
	pan: AudioRange;
}

/**
 * Panner is an equal power Left/Right Panner. It is a wrapper around the StereoPannerNode.
 * @example
 * //pan the input signal hard right.
 * var panner = new Panner(1);
 */
export class Panner extends ToneAudioNode<TonePannerOptions> {

	readonly name: string = "Panner";

	/**
	 *  the panner node
	 */
	private _panner: StereoPannerNode = this.context.createStereoPanner();
	readonly input: StereoPannerNode = this._panner;
	readonly output: StereoPannerNode = this._panner;

	/**
	 *  The pan control. -1 = hard left, 1 = hard right.
	 */
	readonly pan: Param<AudioRange>;

	constructor(options?: Partial<TonePannerOptions>);
	/**
	 * @param pan The initial panner value (Defaults to 0 = "center").
	 */
	// tslint:disable-next-line: unified-signatures
	constructor(pan?: AudioRange);
	constructor() {
		super(Object.assign(optionsFromArguments(Panner.getDefaults(), arguments, ["pan"])));
		const options = optionsFromArguments(Panner.getDefaults(), arguments, ["pan"]);

		this.pan = new Param({
			context: this.context,
			param: this._panner.pan,
			value: options.pan,
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
