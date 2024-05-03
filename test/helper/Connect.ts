import { Gain } from "../../Tone/core/context/Gain.js";
import { ToneAudioNode } from "../../Tone/core/context/ToneAudioNode.js";

export function connectFrom(): Gain {
	return new Gain();
}

export function connectTo(): Gain {
	return new Gain();
}

export function ConnectTest(constr, ...args: any[]): void {

	it("handles input and output connections", () => {
		const instance = new constr(...args);
		// test each of the input and outputs and connect
		if (instance.numberOfInputs) {
			for (let input = 0; input < instance.numberOfInputs; input++) {
				connectFrom().connect(instance, 0, input);
			}
		}
		if (instance.numberOfOutputs) {
			for (let output = 0; output < instance.numberOfOutputs; output++) {
				instance.connect(connectTo(), output, 0);
			}
		}
		instance.dispose();
	});
}
