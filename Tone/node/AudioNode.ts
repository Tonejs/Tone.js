import { connect, connectSeries, disconnect } from "../core/Connect";
import { isArray, isDefined, optionsFromArguments } from "../core/Util";
import { AudioProcessor, AudioProcessorOptions } from "./AudioProcessor";
import { Param } from "./Param";

export type InputNode = ToneAudioNode | AudioNode | AudioParam | Param<Unit>;
export type OutputNode = ToneAudioNode | AudioNode;

export interface ChannelProperties {
	channelCount: number;
	channelCountMode: ChannelCountMode;
	channelInterpretation: ChannelInterpretation;
}

/**
 * The possible options for this node
 */
export interface ToneAudioNodeOptions extends AudioProcessorOptions {
	numberOfInputs: number;
	numberOfOutputs: number;
	channelCount: number;
	channelCountMode: ChannelCountMode;
	channelInterpretation: ChannelInterpretation;
}

/**
 *  ToneAudioNode is the base class for classes which process audio.
 */
export abstract class ToneAudioNode<Options extends ToneAudioNodeOptions = ToneAudioNodeOptions>
extends AudioProcessor<Options> {

	abstract name = "ToneAudioNode";

	/**
	 * The input node or nodes. If the object is a source,
	 * it does not have any input and this.input is undefined.
	 */
	abstract input: InputNode | InputNode[] | undefined;

	/**
	 * The output nodes. If the object is a sink,
	 * it does not have any output and this.output is undefined.
	 */
	abstract output: OutputNode | OutputNode[] | undefined;

	/**
	 *  The number of inputs feeding into the AudioNode.
	 *  For source nodes, this will be 0.
	 */
	readonly numberOfInputs: number;

	/**
	 *  The number of outputs of the AudioNode.
	 */
	readonly numberOfOutputs: number;

	/**
	 * List all of the node that must be set to match the ChannelProperties
	 */
	protected abstract _internalChannels: OutputNode[];

	static getDefaults(): ToneAudioNodeOptions {
		return Object.assign(AudioProcessor.getDefaults(), {
			channelCount: 2,
			channelCountMode: "max" as ChannelCountMode,
			channelInterpretation: "speakers" as ChannelInterpretation,
			numberOfInputs: 0,
			numberOfOutputs: 0,
		});
	}

	constructor(options: Partial<ToneAudioNodeOptions>);
	constructor() {
		super(optionsFromArguments(ToneAudioNode.getDefaults(), arguments, ["context"]));

		const options = optionsFromArguments(ToneAudioNode.getDefaults(), arguments, ["context"]);

		this.numberOfInputs = options.numberOfInputs;
		this.numberOfOutputs = options.numberOfInputs;
	}

	protected createInsOuts(numberOfInputs: number = 0, numberOfOutputs: number = 0): void {
		if (numberOfInputs === 1) {
			this.input = this.context.createGain();
		} else if (numberOfInputs > 1) {
			this.input = [];
			for (let i = 0; i < numberOfInputs; i++) {
				this.input[i] = this.context.createGain();
			}
		}

		if (numberOfOutputs === 1) {
			this.output = this.context.createGain();
		} else if (numberOfOutputs > 1) {
			this.output = [];
			for (let o = 0; o < numberOfOutputs; o++) {
				this.output[o] = this.context.createGain();
			}
		}
	}

	///////////////////////////////////////////////////////////////////////////
	// AUDIO PROPERTIES
	///////////////////////////////////////////////////////////////////////////

	/**
	 * Set the audio options for this node such as channelInterpretation
	 * channelCount, etc.
	 * @param options
	 */
	private _setChannelProperties(options: ChannelProperties): void {
		if (this._internalChannels.length) {
			this._internalChannels.forEach(node => {
				node.channelCount = options.channelCount;
				node.channelCountMode = options.channelCountMode;
				node.channelInterpretation = options.channelInterpretation;
			});
		}
	}

	/**
	 * Get the current audio options for this node such as channelInterpretation
	 * channelCount, etc.
	 */
	private _getChannelProperties(): ChannelProperties {
		if (this._internalChannels.length) {
			const node = this._internalChannels[0];
			return {
				channelCount: node.channelCount,
				channelCountMode: node.channelCountMode,
				channelInterpretation: node.channelInterpretation,
			};
		} else {
			// return the defaults
			return {
				channelCount: 2,
				channelCountMode: "max",
				channelInterpretation: "speakers",
			};
		}
	}

	/**
	 *  channelCount is the number of channels used when up-mixing and down-mixing
	 *  connections to any inputs to the node. The default value is 2 except for
	 *  specific nodes where its value is specially determined.
	 */
	get channelCount(): number {
		return this._getChannelProperties().channelCount;
	}
	set channelCount(channelCount: number) {
		const props = this._getChannelProperties();
		// merge it with the other properties
		this._setChannelProperties(Object.assign(props, { channelCount }));
	}

	/**
	 *  channelCountMode determines how channels will be counted when up-mixing and
	 *  down-mixing connections to any inputs to the node.
	 *  The default value is "max". This attribute has no effect for nodes with no inputs.
	 */
	get channelCountMode(): ChannelCountMode {
		return this._getChannelProperties().channelCountMode;
	}
	set channelCountMode(channelCountMode: ChannelCountMode) {
		const props = this._getChannelProperties();
		// merge it with the other properties
		this._setChannelProperties(Object.assign(props, { channelCountMode }));
	}

	/**
	 *  channelInterpretation determines how individual channels will be treated
	 *  when up-mixing and down-mixing connections to any inputs to the node.
	 *  The default value is "speakers".
	 */
	get channelInterpretation(): ChannelInterpretation {
		return this._getChannelProperties().channelInterpretation;
	}
	set channelInterpretation(channelInterpretation: ChannelInterpretation) {
		const props = this._getChannelProperties();
		// merge it with the other properties
		this._setChannelProperties(Object.assign(props, { channelInterpretation }));
	}

	///////////////////////////////////////////////////////////////////////////
	// CONNECTIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 * connect the output of a ToneAudioNode to an AudioParam, AudioNode, or ToneAudioNode
	 * @param unit The output to connect to
	 * @param outputNum The output to connect from
	 * @param inputNum The input to connect to
	 */
	connect(destination: InputNode, outputNum = 0, inputNum = 0): this {
		connect(this, destination, outputNum, inputNum);
		return this;
	}

	/**
	 * Connect the output to the context's destination node.
	 * alias for {@link toDestination}
	 */
	toMaster(): this {
		this.connect(this.context.destination);
		return this;
	}

	/**
	 *  disconnect the output
	 *  @param output Either the output index to disconnect if the output is an array, or the node to disconnect from.
	 */
	disconnect(destination?: InputNode, outputNum = 0, inputNum = 0): this {
		disconnect(this, destination, outputNum, inputNum);
		return this;
	}

	/**
	 *  Connect the output of this node to the rest of the nodes in series.
	 *  @param nodes
	 *  @example
	 *  //connect a node to an effect, panVol and then to the master output
	 *  node.chain(effect, panVol, Tone.Destination);
	 */
	chain(...nodes: InputNode[]): this {
		connectSeries(...nodes);
		return this;
	}

	/**
	 *  connect the output of this node to the rest of the nodes in parallel.
	 *  @param nodes
	 *  @returns this
	 */
	fan(...nodes: InputNode[]): this {
		nodes.forEach(node => this.connect(node));
		return this;
	}

	/**
	 * Dispose and disconnect
	 */
	dispose(): this {
		if (isDefined(this.input)) {
			if (isArray(this.input)) {
				this.input.forEach(input => {
					if (input instanceof ToneAudioNode) {
						input.dispose();
					} else if (input instanceof AudioNode) {
						input.disconnect();
					}
				});
			} else {
				if (this.input instanceof AudioNode) {
					this.input.disconnect();
				}
			}
		}
		if (isDefined(this.output)) {
			if (isArray(this.output)) {
				this.output.forEach(output => {
					if (output instanceof ToneAudioNode) {
						output.dispose();
					} else {
						output.disconnect();
					}
				});
			} else {
				this.output.disconnect();
			}
		}
		this._internalChannels = [];
		return this;
	}
}
