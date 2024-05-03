import toWav from "audiobuffer-to-wav";
import type { ToneAudioBuffer } from "../../../Tone/core/context/ToneAudioBuffer.js";

export class TestAudioBuffer {
	static async fromUrl(
		url: string,
		channels = 1,
		sampleRate = 11025
	): Promise<TestAudioBuffer> {
		const response = await fetch(url);
		if (response.ok) {
			const buffer = await response.arrayBuffer();
			const context = new OfflineAudioContext(channels, 1, sampleRate);
			const audioBuffer = await context.decodeAudioData(buffer);
			return new TestAudioBuffer(audioBuffer);
		} else {
			throw new Error(`could not load url ${url}`);
		}
	}

	static fromTone(buffer: ToneAudioBuffer) {
		return new TestAudioBuffer(buffer);
	}

	private _buffer: AudioBuffer;
	private _rms?: Float32Array[];
	private _array?: Float32Array[];

	constructor(buffer: AudioBuffer | TestAudioBuffer | ToneAudioBuffer) {
		if (buffer instanceof AudioBuffer) {
			this._buffer = buffer;
		} else if (buffer instanceof TestAudioBuffer) {
			this._buffer = buffer._buffer;
		} else {
			this._buffer = buffer.get() as AudioBuffer;
		}
	}

	/**
	 * The number of channels of the audio file.
	 */
	get numberOfChannels(): number {
		return this._buffer.numberOfChannels;
	}

	/**
	 * The duration in seconds
	 */
	get duration(): number {
		return this._buffer.duration;
	}

	/**
	 * The length in samples
	 */
	get length(): number {
		return this._buffer.length;
	}

	/**
	 * The sample rate of the audio file
	 */
	get sampleRate(): number {
		return this._buffer.sampleRate;
	}

	/**
	 * Return the buffer as a nested array where the first axis is the number of channels
	 */
	toArray(): Float32Array[] {
		if (!this._array) {
			const output: Float32Array[] = [];
			for (
				let channel = 0;
				channel < this._buffer.numberOfChannels;
				channel++
			) {
				output[channel] = this._buffer.getChannelData(channel);
			}
			this._array = output;
		}
		return this._array;
	}

	/**
	 * Return a new TestAudioBuffer which has all of the channels summed to a single channel
	 */
	toMono(): TestAudioBuffer {
		const context = new OfflineAudioContext(1, 1, this._buffer.sampleRate);
		const buffer = context.createBuffer(
			1,
			this._buffer.length,
			this._buffer.sampleRate
		);
		// sum all the channels into a single channel
		const bufferArray = buffer.getChannelData(0);
		this.toArray().forEach((channel) => {
			channel.forEach((value, index) => {
				bufferArray[index] += value;
			});
		});
		return new TestAudioBuffer(buffer);
	}

	/**
	 * Return the Root Mean Square of the channels at that slice of time.
	 * If buffer is mono, it will return a single value, otherwise it returns an array of numbers
	 * @param time Seconds
	 */
	getRmsAtTime(time: number): number[] | number {
		if (!this._rms) {
			const blockSize = 512;
			this._rms = [];
			this.toArray().forEach((channel) => {
				const channelRMS = new Float32Array(channel.length);
				this._rms?.push(channelRMS);
				for (let i = 0; i < channel.length; i++) {
					const sqrSum = channel
						.slice(i, i + blockSize)
						.reduce((total, value) => {
							return total + value * value;
						}, 0);
					channelRMS[i] = Math.sqrt(sqrSum / blockSize);
				}
			});
		}
		const sampleTime = Math.floor(time * this._buffer.sampleRate);
		if (sampleTime < this._rms[0].length) {
			const values = this._rms.map((rms) => rms[sampleTime]);
			if (values.length === 1) {
				return values[0];
			} else {
				return values;
			}
		} else {
			return 0;
		}
	}

	/**
	 * Get the value of a sample at the given time. if the buffer has multiple
	 * channels, will return an array.
	 * @param time seconds
	 */
	getValueAtTime(time: number): number[] | number {
		const sampleTime = Math.floor(time * this._buffer.sampleRate);
		const array = this.toArray();
		if (sampleTime < array[0].length) {
			const values = array.map((channel) => channel[sampleTime]);
			if (values.length === 1) {
				return values[0];
			} else {
				return values;
			}
		} else {
			return 0;
		}
	}

	/**
	 * return the time in seconds of the first time
	 * the AudioBuffer rose above the silence threshold
	 */
	getTimeOfFirstSound(threshold = 1e-6): number {
		const firstSampleTimes = this.toArray().map((channel) => {
			for (let i = 0; i < channel.length; i++) {
				const sample = channel[i];
				if (sample > threshold) {
					return i / this._buffer.sampleRate;
				}
			}
			return -1;
		});
		return Math.min(...firstSampleTimes);
	}

	/**
	 * Return the last time a sample rose above the threshold
	 * @param threshold
	 */
	getTimeOfLastSound(threshold = 1e-6): number {
		const lastSampleTimes = this.toArray().map((channel) => {
			for (let i = channel.length - 1; i >= 0; i--) {
				const sample = channel[i];
				if (sample > threshold) {
					return i / this._buffer.sampleRate;
				}
			}
			return -1;
		});
		return Math.max(...lastSampleTimes);
	}

	/**
	 * The maximum sample value across all the channels
	 */
	max(): number {
		let max = -Infinity;
		this.toArray().forEach((channel) => {
			max = Math.max(max, ...Array.from(channel));
		});
		return max;
	}

	/**
	 * The minimum sample value across all the channels
	 */
	min(): number {
		let min = Infinity;
		this.toArray().forEach((channel) => {
			min = Math.min(min, ...Array.from(channel));
		});
		return min;
	}

	/**
	 * The value (only if it is consistent throughout the entire buffer).
	 * Throws an error if there are multiple values found.
	 */
	value(): number {
		const max = this.max();
		const min = this.min();
		if (max - min > 1e-6) {
			throw new Error("multiple values found in this buffer");
		}
		return max;
	}

	/**
	 * Test if the buffer has no audio data. if it is at or near 0 the entire buffer.
	 */
	isSilent(threshold = 1e-6): boolean {
		try {
			return Math.abs(this.value()) < threshold;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Return a copy of the TestAudioBuffer
	 */
	clone(): TestAudioBuffer {
		// should probably also clone the buffer
		return new TestAudioBuffer(this._buffer);
	}

	/**
	 * Return a new TestAudioBuffer at the given sample rate.
	 * @param sampleRate a new sample rate to compute the buffer ar
	 */
	async resample(sampleRate: number): Promise<TestAudioBuffer> {
		const offlineCtx = new OfflineAudioContext(
			this._buffer.numberOfChannels,
			this._buffer.duration * sampleRate,
			sampleRate
		);
		const resampledBuffer = offlineCtx.createBuffer(
			this._buffer.numberOfChannels,
			this._buffer.length,
			this._buffer.sampleRate
		);

		// Copy the source data into the offline AudioBuffer
		for (
			let channel = 0;
			channel < resampledBuffer.numberOfChannels;
			channel++
		) {
			resampledBuffer.copyToChannel(
				this._buffer.getChannelData(channel),
				channel
			);
		}

		// Play it from the beginning.
		const source = offlineCtx.createBufferSource();
		source.buffer = resampledBuffer;
		source.connect(offlineCtx.destination);
		source.start(0);

		// compute the results
		const computedBuffer = await offlineCtx.startRendering();
		return new TestAudioBuffer(computedBuffer);
	}

	toWav(): ArrayBuffer {
		// check that the min and max are between -1 and 1
		return toWav(this._buffer, {
			float32: false,
		});
	}

	downloadWav(filename = "test_audio"): void {
		const wave = this.toWav();
		const blob = new Blob([wave], { type: "audio/wav" });
		const blobUrl = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = blobUrl;
		a.download = filename;
		a.click();
		window.URL.revokeObjectURL(blobUrl);
	}

	forEach(callback: (sample: number, time: number) => void): void {
		const channels = this.toMono().toArray();
		channels[0].forEach((sample, index) => {
			callback(sample, index / this.sampleRate);
		});
	}

	forEachBetween(
		callback: (sample: number, time: number) => void,
		startTime = 0,
		endTime: number = this.duration
	): void {
		const channels = this.toMono().toArray();
		const startSamples = Math.floor(startTime * this.sampleRate);
		const endSamples = Math.floor(
			Math.min(endTime * this.sampleRate, this.length)
		);
		for (let s = startSamples; s < endSamples; s++) {
			const sample = channels[0][s];
			callback(sample, s / this.sampleRate);
		}
	}
}
