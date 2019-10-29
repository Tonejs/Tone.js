import { AudioRange, Decibels } from "../../core/type/Units";
import { InputNode, OutputNode, ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { Solo } from "./Solo";
import { PanVol } from "./PanVol";
import { Param } from "../../core/context/Param";
import { readOnly } from "../../core/util/Interface";

export interface ChannelOptions extends ToneAudioNodeOptions {
	pan: AudioRange;
	volume: Decibels;
	solo: boolean;
	mute: boolean;
}

/**
 * Channel provides a channel strip interface with volume, pan, solo and mute controls. 
 * See [[PanVol]] and [[Solo]]
 * @example
 * import { Channel } from "tone";
 * // pan the incoming signal left and drop the volume 12db
 * const channel = new Channel(-0.25, -12);
 */
export class Channel extends ToneAudioNode<ChannelOptions> {

	readonly name: string = "Channel";

	readonly input: InputNode;
	readonly output: OutputNode;

	/**
	 * The soloing interface
	 */
	private _solo: Solo;

	/**
	 * The panning and volume node
	 */
	private _panVol: PanVol;

	/**
	 * The L/R panning control.
	 */
	readonly pan: Param<"audioRange">;

	/**
	 * The volume control in decibels.
	 */
	readonly volume: Param<"decibels">;
	
	/**
	 * @param volume The output volume.
	 * @param pan the initial pan
	 */
	constructor(volume?: Decibels, pan?: AudioRange);
	constructor(options?: Partial<ChannelOptions>);
	constructor() {
		super(optionsFromArguments(Channel.getDefaults(), arguments, ["volume", "pan"]));
		const options = optionsFromArguments(Channel.getDefaults(), arguments, ["volume", "pan"]);

		this._solo = this.input = new Solo({
			solo: options.solo,
			context: this.context,
		});
		this._panVol = this.output = new PanVol({
			context: this.context,
			pan: options.pan,
			volume: options.volume,
			mute: options.mute,
		});
		this.pan = this._panVol.pan;
		this.volume = this._panVol.volume;

		this._solo.connect(this._panVol);
		readOnly(this, ["pan", "volume"]);
	}

	static getDefaults(): ChannelOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			pan: 0,
			volume: 0,
			mute: false,
			solo: false
		});
	}

	/**
	 * Solo/unsolo the channel. Soloing is only relative to other [[Channels]] and [[Solo]] instances
	 */
	get solo(): boolean {
		return this._solo.solo;
	}
	set solo(solo) {
		this._solo.solo = solo;
	}

	/**
	 * If the current instance is muted, i.e. another instance is soloed,
	 * or the channel is muted
	 */
	get muted(): boolean {
		return this._solo.muted || this.mute;
	}

	/**
	 * Mute/unmute the volume
	 */
	get mute(): boolean {
		return this._panVol.mute;
	}
	set mute(mute) {
		this._panVol.mute = mute;
	}

	dispose(): this {
		super.dispose();
		this._panVol.dispose();
		this.pan.dispose();
		this.volume.dispose();
		this._solo.dispose();
		return this;
	}
}
