import { ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { Positive } from "../../core/type/Units";
import { optionsFromArguments } from "../../core/util/Defaults";

interface MergeOptions extends ToneAudioNodeOptions {
	channels: Positive;
}

/**
 * Merge brings multiple mono input channels into a single multichannel output channel.
 *
 * @param channels The number of channels to merge.
 * @example
 * var merge = new Merge().toDestination();
 * //routing a sine tone in the left channel
 * //and noise in the right channel
 * var osc = new Tone.Oscillator().connect(merge.left);
 * var noise = new Tone.Noise().connect(merge.right);
 * //starting our oscillators
 * noise.start();
 * osc.start();
 */
export class Merge extends ToneAudioNode<MergeOptions> {

	name = "Merge";

	/**
	 *  The merger node for the two channels.
	 */
	private _merger: ChannelMergerNode;

	/**
	 * The output is the input channels combined into a sigle (multichannel) output
	 */
	output: AudioNode;

	/**
	 * Multiple input connections combine into a single output.
	 */
	input: AudioNode;

	protected _internalChannels = [];

	constructor(channels?: Positive);
	// tslint:disable-next-line: unified-signatures
	constructor(options?: Partial<MergeOptions>);
	constructor() {
		super(optionsFromArguments(Merge.getDefaults(), arguments, ["channels"]));
		const options = optionsFromArguments(Merge.getDefaults(), arguments, ["channels"]);

		this._merger = this.output = this.input = this.context.createChannelMerger(options.channels);

		// @ts-ignore
		this.numberOfInputs = options.channels;
		// @ts-ignore
		this.numberOfOutputs = 1;
	}

	static getDefaults(): MergeOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			channels: 2,
			numberOfOutputs : 1,
		});
	}

	dispose(): this {
		super.dispose();
		this._merger.disconnect();
		return this;
	}
}
