import { optionsFromArguments } from "../util/Defaults";
import { isArray, isDefined, isNumber } from "../util/TypeCheck";
import { Param } from "./Param";
import { ToneWithContext, ToneWithContextOptions } from "./ToneWithContext";

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
export interface ToneAudioNodeOptions extends ToneWithContextOptions {
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
extends ToneWithContext<Options> {

	abstract name = "AudioNode";

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
		return Object.assign(ToneWithContext.getDefaults(), {
			channelCount: 2,
			channelCountMode: "max" as ChannelCountMode,
			channelInterpretation: "speakers" as ChannelInterpretation,
			numberOfInputs: 0,
			numberOfOutputs: 0,
		});
	}

	constructor(options: ToneAudioNodeOptions) {
		super(options);
		this.numberOfInputs = options.numberOfInputs;
		this.numberOfOutputs = options.numberOfOutputs;
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
	 */
	toDestination(): this {
		this.connect(this.context.destination);
		return this;
	}

	/**
	 * Connect the output to the context's destination node.
	 * alias for {@link toDestination}
	 */
	toMaster(): this {
		return this.toDestination();
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
		connectSeries(this, ...nodes);
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
		super.dispose();
		if (isDefined(this.input)) {
			if (isArray(this.input)) {
				this.input.forEach(input => {
					if (input instanceof ToneAudioNode) {
						input.dispose();
					} else if (input instanceof AudioNode) {
						input.disconnect();
					}
				});
			} else if (this.input instanceof ToneAudioNode) {
				this.input.dispose();
			} else if (this.input instanceof AudioNode) {
				this.input.disconnect();
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
			} else if (this.output instanceof ToneAudioNode) {
				this.output.dispose();
			} else if (this.output instanceof AudioNode) {
				this.output.disconnect();
			}
		}
		this._internalChannels = [];
		return this;
	}
}

///////////////////////////////////////////////////////////////////////////////
// CONNECTIONS
///////////////////////////////////////////////////////////////////////////////

/**
 *  connect together all of the arguments in series
 *  @param nodes
 */
export function connectSeries(...nodes: InputNode[]): void {
	const first = nodes.shift();
	nodes.reduce((prev, current) => {
		if (prev instanceof ToneAudioNode) {
			prev.connect(current);
		} else if (prev instanceof AudioNode) {
			connect(prev, current);
		}
		return current;
	}, first);
}

/**
 * Connect two nodes together so that signal flows from the
 * first node to the second. Optionally specify the input and output channels.
 * @param srcNode The source node
 * @param dstNode The destination node
 * @param outputNumber The output channel of the srcNode
 * @param inputNumber The input channel of the dstNode
 */
export function connect(srcNode: OutputNode, dstNode: InputNode, outputNumber = 0, inputNumber = 0): void {

	// resolve the input of the dstNode
	while (!(dstNode instanceof AudioNode || dstNode instanceof AudioParam)) {
		if (isArray(dstNode.input)) {
			this.assert(dstNode.input.length < inputNumber, "the output number is greater than the number of outputs");
			dstNode = dstNode.input[inputNumber];
		} else if (isDefined(dstNode.input)) {
			dstNode = dstNode.input;
		}
		inputNumber = 0;
	}

	if (srcNode instanceof ToneAudioNode) {
		if (isArray(srcNode.output)) {
			this.assert(srcNode.output.length < outputNumber, "the output number is greater than the number of outputs");
			srcNode = srcNode.output[outputNumber];
		} else if (isDefined(srcNode.output)) {
			srcNode = srcNode.output;
		}
		outputNumber = 0;
	}

	// make the connection
	if (dstNode instanceof AudioParam) {
		srcNode.connect(dstNode, outputNumber);
	} else {
		srcNode.connect(dstNode, outputNumber, inputNumber);
	}
}

/**
 * Disconnect a node from all nodes or optionally include a destination node and input/output channels.
 * @param srcNode The source node
 * @param dstNode The destination node
 * @param outputNumber The output channel of the srcNode
 * @param inputNumber The input channel of the dstNode
 */
export function disconnect(
	srcNode: OutputNode,
	dstNode?: InputNode,
	outputNumber = 0,
	inputNumber = 0,
): void {

	// resolve the destination node
	if (isDefined(dstNode)) {
		while (dstNode instanceof ToneAudioNode) {
			if (isArray(dstNode.input)) {
				if (isNumber(inputNumber)) {
					this.assert(dstNode.input.length < inputNumber, "the input number is greater than the number of inputs");
					dstNode = dstNode.input[inputNumber];
				} else {
					// disconnect from all of the nodes
					// since we don't know which one was connected
					dstNode.input.forEach(dst => {
						try {
							// catch errors from disconnecting from nodes that are not connected
							disconnect(srcNode, dst, outputNumber);
							// tslint:disable-next-line: no-empty
						} catch (e) { }
					});
				}
				inputNumber = 0;
			} else if (dstNode.input) {
				dstNode = dstNode.input;
			}
		}
	}

	// resolve the src node
	while (!(srcNode instanceof AudioNode)) {
		if (isArray(srcNode.output)) {
			this.assert(srcNode.output.length < outputNumber, "the output number is greater than the number of outputs");
			srcNode = srcNode.output[outputNumber];
		} else if (isDefined(srcNode.output)) {
			srcNode = srcNode.output;
		}
		outputNumber = 0;
	}

	if (dstNode instanceof AudioParam) {
		srcNode.disconnect(dstNode, outputNumber);
	} else if (dstNode instanceof AudioNode) {
		srcNode.disconnect(dstNode, outputNumber, inputNumber);
	} else {
		srcNode.disconnect();
	}
}
