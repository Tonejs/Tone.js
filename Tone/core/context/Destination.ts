import { Volume } from "../../component/channel/Volume";
import { Decibels } from "../type/Units";
import { optionsFromArguments } from "../util/Defaults";
import { onContextClose, onContextInit } from "./ContextInitialization";
import { Gain } from "./Gain";
import { Param } from "./Param";
import { connectSeries, ToneAudioNode, ToneAudioNodeOptions } from "./ToneAudioNode";

interface DestinationOptions extends ToneAudioNodeOptions {
	volume: Decibels;
	mute: boolean;
}

/**
 * A single master output which is connected to the
 * AudioDestinationNode (aka your speakers).
 * It provides useful conveniences such as the ability
 * to set the volume and mute the entire application.
 * It also gives you the ability to apply master effects to your application.
 *
 * @example
 * const oscillator = new Tone.Oscillator().start();
 * // the audio will go from the oscillator to the speakers
 * oscillator.connect(Tone.Destination);
 * // a convenience for connecting to the master output is also provided:
 * oscillator.toDestination();
 * // these two are equivalent.
 * @category Core
 */
export class Destination extends ToneAudioNode<DestinationOptions> {

	readonly name: string = "Destination";

	input: Volume = new Volume({ context: this.context });
	output: Gain = new Gain({ context: this.context });

	/**
	 * The volume of the master output.
	 */
	volume: Param<"decibels"> = this.input.volume;

	constructor(options: Partial<DestinationOptions>);
	constructor() {

		super(optionsFromArguments(Destination.getDefaults(), arguments));
		const options = optionsFromArguments(Destination.getDefaults(), arguments);

		connectSeries(this.input, this.output, this.context.rawContext.destination);

		this.mute = options.mute;
		this._internalChannels = [this.input, this.context.rawContext.destination, this.output];
	}

	static getDefaults(): DestinationOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			mute: false,
			volume: 0,
		});
	}

	/**
	 * Mute the output.
	 * @example
	 * const oscillator = new Tone.Oscillator().start().toDestination();
	 * // mute the output
	 * Tone.Destination.mute = true;
	 */
	get mute(): boolean {
		return this.input.mute;
	}

	set mute(mute: boolean) {
		this.input.mute = mute;
	}

	/**
	 * Add a master effects chain. NOTE: this will disconnect any nodes which were previously
	 * chained in the master effects chain.
	 * @param args All arguments will be connected in a row and the Master will be routed through it.
	 * @return  {Destination}  this
	 * @example
	 * // some overall compression to keep the levels in check
	 * const masterCompressor = new Tone.Compressor({
	 * 	threshold: -6,
	 * 	ratio: 3,
	 * 	attack: 0.5,
	 * 	release: 0.1
	 * });
	 * // give a little boost to the lows
	 * const lowBump = new Tone.Filter(200, "lowshelf");
	 * // route everything through the filter and compressor before going to the speakers
	 * Tone.Destination.chain(lowBump, masterCompressor);
	 */
	chain(...args: Array<AudioNode | ToneAudioNode>): this {
		this.input.disconnect();
		args.unshift(this.input);
		args.push(this.output);
		connectSeries(...args);
		return this;
	}

	/**
	 * The maximum number of channels the system can output
	 */
	get maxChannelCount(): number {
		return this.context.rawContext.destination.maxChannelCount;
	}

	/**
	 * Clean up
	 */
	dispose(): this {
		super.dispose();
		this.volume.dispose();
		return this;
	}
}

//-------------------------------------
// 	INITIALIZATION
//-------------------------------------

onContextInit(context => {
	context.destination = new Destination({ context });
});

onContextClose(context => {
	context.destination.dispose();
});
