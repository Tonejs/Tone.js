import windowing from "fft-windowing";
import ft from "fourier-transform";

import { TestAudioBuffer } from "./TestAudioBuffer.js";

/**
 * Return a spectrogram of the buffer
 */
export function analyze(buffer: TestAudioBuffer, fftSize = 256, hopSize = 128) {
	const spectrogram: number[][] = [];
	buffer
		.toMono()
		.toArray()
		.forEach((channel) => {
			for (
				let index = 0;
				index < channel.length - fftSize;
				index += hopSize
			) {
				const segment = windowing.blackman_harris(
					channel.slice(index, index + fftSize)
				);
				spectrogram.push(ft(segment));
			}
		});
	return spectrogram;
}
