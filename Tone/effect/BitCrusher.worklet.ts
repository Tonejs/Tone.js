import { SingleIOProcessor } from "../core/worklet/SingleIOProcessor.worklet";
import { registerProcessor } from "../core/worklet/WorkletGlobalScope";

export const workletName = "bit-crusher";

export default class BitCrusherWorklet extends SingleIOProcessor {

	static get parameterDescriptors() {
		return [{
			name: "bits",
			defaultValue: 12,
			minValue: 1,
			maxValue: 16
		}];
	}

	generate(input: number, _channel: number, parameters: { [name: string]: number }) {
		const step = Math.pow(0.5, parameters.bits - 1);
		const val = step * Math.floor(input / step + 0.5);
		return val;
	}
}

registerProcessor(workletName, BitCrusherWorklet);
