import { addToWorklet } from "./WorkletGlobalScope.js";

const delayLine = /* javascript */ `
	/**
	 * A multichannel buffer for use within an AudioWorkletProcessor as a delay line
	 */
	class DelayLine {

		constructor(size, channels) {
			this.buffer = [];
			this.writeHead = []
			this.size = size;

			// create the empty channels
			for (let i = 0; i < channels; i++) {
				this.buffer[i] = new Float32Array(this.size);
				this.writeHead[i] = 0;
			}
		}

		/**
		 * Push a value onto the end
		 * @param channel number
		 * @param value number
		 */
		push(channel, value) {
			this.writeHead[channel] += 1;
			if (this.writeHead[channel] >= this.size) {
				this.writeHead[channel] = 0;
			}
			this.buffer[channel][this.writeHead[channel]] = value;
		}

		/**
		 * Get the recorded value of the channel given the delay
		 * @param channel number
		 * @param delay number delay samples
		 */
		get(channel, delay) {
			let readHead = this.writeHead[channel] - Math.floor(delay);
			if (readHead < 0) {
				readHead += this.size;
			}
			return this.buffer[channel][readHead];
		}

		/**
		 * Get the reverse recorded value of the channel given the delay
		 * @param channel number
		 * @param delay number delay samples
		 */
		getReverse(channel, delay) {
			if (!this.size || !delay) {
				return 0;
			}

			const readHead = delay * 2 - this.writeHead[channel] - 1;

			// Gain function to reduce clicking when read is too close to write
			let readWriteDifference = this.writeHead[channel] - readHead;
			if (readWriteDifference < 0) {
				readWriteDifference += this.size
			}
			const delayPct = readWriteDifference / this.size;
			const gainFunction = 4 * delayPct * (1 - delayPct);

			return this.buffer[channel][readHead] * gainFunction;
		}
	}
`;

addToWorklet(delayLine);
