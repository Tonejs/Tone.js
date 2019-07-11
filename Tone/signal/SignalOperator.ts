import { optionsFromArguments } from "..//core/util/Defaults";
import { Param } from "../core/context/Param";
import { InputNode, ToneAudioNode, ToneAudioNodeOptions } from "../core/context/ToneAudioNode";
import { Signal } from "./Signal";
/**
 * A signal operator has an input and output and modifies the signal.
 */
export abstract class SignalOperator<Options extends ToneAudioNodeOptions> extends ToneAudioNode<Options> {

	constructor(options?: Partial<Options>);
	constructor() {
		super(Object.assign(optionsFromArguments(SignalOperator.getDefaults(), arguments, ["context"])));
	}

	connect(destination: InputNode, outputNum = 0, inputNum = 0): this {
		if (destination instanceof Param || destination instanceof AudioParam ||
			(destination instanceof Signal && destination.override)) {
			// cancel changes
			destination.cancelScheduledValues(0);
			// reset the value
			destination.setValueAtTime(0, 0);
			// mark the value as overridden
			if (destination instanceof Signal) {
				destination.overridden = true;
			}
		}
		super.connect(destination, outputNum, inputNum);
		return this;
	}
}
