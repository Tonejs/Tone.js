import { Gain } from "../../core/context/Gain";
import { Param } from "../../core/context/Param";
import { ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { Decibels } from "../../core/type/Units";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";

interface VolumeOptions extends ToneAudioNodeOptions {
	volume: Decibels;
	mute: boolean;
}

/**
 *  @class Volume is a simple volume node, useful for creating a volume fader.
 *
 *  @extends {Tone.AudioNode}
 *  @constructor
 *  @param {Decibels} [volume=0] the initial volume
 *  @example
 * var vol = new Volume(-12);
 * instrument.chain(vol, Tone.Master);
 */
export class Volume extends ToneAudioNode<VolumeOptions> {

	readonly name = "Volume";

	/**
	 * the output node
	 */
	output: Gain<Decibels> = new Gain({
		context: this.context,
		units: "decibels",
	});

	/**
	 * Input and output are the same
	 */
	input = this.output;

	/**
	 * The unmuted volume
	 */
	private _unmutedVolume: Decibels;

	/**
	 *  The volume control in decibels.
	 */
	volume: Param<Decibels> = this.output.gain;

	constructor(options?: Decibels | Partial<VolumeOptions>);
	constructor() {

		super(optionsFromArguments(Volume.getDefaults(), arguments, ["volume"]));
		const options = optionsFromArguments(Volume.getDefaults(), arguments, ["volume"]);

		this.volume.value = options.volume;
		readOnly(this, "volume");
		this._unmutedVolume = options.volume;

		// set the mute initially
		this.mute = options.mute;
	}

	static getDefaults(): VolumeOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			mute: false,
			volume: 0,
		});
	}

	/**
	 * Mute the output.
	 * @example
	 * //mute the output
	 * volume.mute = true;
	 */
	get mute(): boolean {
		return this.volume.value === -Infinity;
	}
	set mute(mute: boolean) {
		if (!this.mute && mute) {
			this._unmutedVolume = this.volume.value;
			// maybe it should ramp here?
			this.volume.value = -Infinity;
		} else if (this.mute && !mute) {
			this.volume.value = this._unmutedVolume;
		}
	}

	/**
	 *  clean up
	 */
	dispose(): this {
		super.dispose();
		this.input.dispose();
		this.volume.dispose();
		return this;
	}
}
