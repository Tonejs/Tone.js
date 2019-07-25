import { Volume } from "../../component/channel/Volume";
import { connectSeries } from "../Connect";
import { optionsFromArguments } from "../util/Defaults";
import { onContextClose, onContextInit } from "./ContextInitialization";
import { Gain } from "./Gain";
import { Param } from "./Param";
import { ToneAudioNode, ToneAudioNodeOptions } from "./ToneAudioNode";

interface DestinationOptions extends ToneAudioNodeOptions {
	volume: Decibels;
	mute: boolean;
}

/**
 *  A single master output which is connected to the
 *  AudioDestinationNode (aka your speakers).
 *  It provides useful conveniences such as the ability
 *  to set the volume and mute the entire application.
 *  It also gives you the ability to apply master effects to your application.
 *
 *  @example
 * //the audio will go from the oscillator to the speakers
 * oscillator.connect(Destination);
 * //a convenience for connecting to the master output is also provided:
 * oscillator.toDestination();
 * //the above two examples are equivalent.
 */
export class Destination extends ToneAudioNode<DestinationOptions> {

	name = "Destination";

	input: Volume = new Volume({ context: this.context });
	output: Gain = new Gain({ context : this.context });

	/**
	 * The volume of the master output.
	 */
	volume: Param<Decibels> = this.input.volume;
	_internalChannels = [this.input, this.output];

	constructor(options: Partial<DestinationOptions>);
	constructor() {

		super(optionsFromArguments(Destination.getDefaults(), arguments));
		const options = optionsFromArguments(Destination.getDefaults(), arguments);

		connectSeries(this.input, this.output, this.context.rawContext.destination);

		this.volume.value = options.volume;
		this.mute = options.mute;
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
	 * //mute the output
	 * Destination.mute = true;
	 */
	get mute(): boolean {
		return this.input.mute;
	}

	set mute(mute: boolean) {
		this.input.mute = mute;
	}

	/**
	 *  Add a master effects chain. NOTE: this will disconnect any nodes which were previously
	 *  chained in the master effects chain.
	 *  @param nodes All arguments will be connected in a row and the Master will be routed through it.
	 *  @return  {Destination}  this
	 *  @example
	 * //some overall compression to keep the levels in check
	 * var masterCompressor = new Tone.Compressor({
	 * 	"threshold" : -6,
	 * 	"ratio" : 3,
	 * 	"attack" : 0.5,
	 * 	"release" : 0.1
	 * });
	 * //give a little boost to the lows
	 * var lowBump = new Tone.Filter(200, "lowshelf");
	 * //route everything through the filter
	 * //and compressor before going to the speakers
	 * Destination.chain(lowBump, masterCompressor);
	 */
	chain(...args: Array<AudioNode | ToneAudioNode>): this {
		this.input.disconnect();
		args.unshift(this.input);
		args.push(this.output);
		connectSeries(...args);
		return this;
	}

	/**
	 *  Clean up
	 */
	dispose(): this {
		super.dispose();
		this.volume.dispose();
		return this;
	}
}

///////////////////////////////////////////////////////////////////////////
// 	INITIALIZATION
///////////////////////////////////////////////////////////////////////////

onContextInit(context => {
	context.destination = new Destination({ context });
});

onContextClose(context => {
	context.destination.dispose();
});
