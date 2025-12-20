import "../core/worklet/SingleIOProcessor.worklet.js";
import "../core/worklet/DelayLine.worklet.js";

import { registerProcessor } from "../core/worklet/WorkletGlobalScope.js";

export const workletName = "reverse-delay";

export const reverseDelayWorklet = /* javascript */ `
	class ReverseDelayWorklet extends SingleIOProcessor {
		constructor(options) {
			super(options);
			this.delay = this.sampleRate * options.processorOptions.delayTime;
			const channels = options.channelCount || 2;
			this.delayLine = new DelayLine(Math.floor(this.delay) * 2, channels);
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
			const reversedSample = this.delayLine.get(channel, this.delay, true);
			const delayedSample = this.delayLine.get(channel, this.delay);
			this.delayLine.push(channel, input + delayedSample * parameters.feedback);
			return reversedSample;
		}
	}
`;

registerProcessor(workletName, reverseDelayWorklet);
