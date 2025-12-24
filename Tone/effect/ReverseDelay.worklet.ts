import "../core/worklet/SingleIOProcessor.worklet.js";
import "../core/worklet/DelayLine.worklet.js";

import { registerProcessor } from "../core/worklet/WorkletGlobalScope.js";

export const workletName = "reverse-delay";

export const reverseDelayWorklet = /* javascript */ `
	class ReverseDelayWorklet extends SingleIOProcessor {

		constructor(options) {
			super(options);
			this.delayTime = Math.floor(this.sampleRate * options.processorOptions.delayTime);
			const channels = options.channelCount || 2;
			this.delayLine = new DelayLine(this.delayTime * 2, channels);
		}

		static get parameterDescriptors() {
			return [{
				name: "feedback",
				defaultValue: 0.5,
				minValue: 0,
				maxValue: 0.9999,
				automationRate: "k-rate"
			}];
		}

		generate(input, channel, parameters) {
			const reversedSample = this.delayLine.getReverse(channel, this.delayTime);
			const delayedSample = this.delayLine.get(channel, this.delayTime);

			// Push the forward sample back on the line
			this.delayLine.push(channel, input + delayedSample * parameters.feedback);

			// Play the reversed sample
			return reversedSample;
		}
	}
`;

registerProcessor(workletName, reverseDelayWorklet);
