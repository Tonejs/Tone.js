import { addToWorklet } from "./WorkletGlobalScope";

/**
 * A multichannel buffer for use within an AudioWorkletProcessor as a delay line
 */
export class DelayLine {

	private buffer: Float32Array[] = [];
	private size: number;
	private writeHead: number[] = [];

	constructor(size: number, channels: number) {
		this.size = size;

		// create the empty channels
		for (let i = 0; i < channels; i++) {
			this.buffer[i] = new Float32Array(this.size);
			this.writeHead[i] = 0;
		}
	}

	/**
	 * Push a value onto the end
	 */
	push(channel: number, value: number) {
		this.writeHead[channel] += 1;
		if (this.writeHead[channel] > this.size) {
			this.writeHead[channel] = 0;
		}
		this.buffer[channel][this.writeHead[channel]] = value;
	}

	/**
	 * Get the recorded value of the channel given the delay
	 */
	get(channel: number, delay: number): number {
		let readHead = this.writeHead[channel] - Math.floor(delay);
		if (readHead < 0) {
			readHead += this.size;
		}
		return this.buffer[channel][readHead];
	}
}

addToWorklet(DelayLine);
