import { InputNode, OutputNode, ToneAudioNode } from "./context/ToneAudioNode";
import { isArray, isDefined, isNumber } from "./util/TypeCheck";

/**
 *  connect together all of the arguments in series
 *  @param nodes
 */
export function connectSeries(...nodes: InputNode[]): void {
	nodes.reduce((prev, current) => {
		if (prev instanceof ToneAudioNode || prev instanceof AudioNode) {
			connect(prev, current);
		}
		return current;
	}, nodes[0]);
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
