import { analyze } from "./Spectrum.js";
import { TestAudioBuffer } from "./TestAudioBuffer.js";
import type { ToneAudioBuffer } from "../../../Tone/core/context/ToneAudioBuffer.js";
import plotly from "plotly.js-dist";
import array2d from "array2d";

/**
 * Generate a 2d spectrogram image of the audio buffer
 */
export function spectrogram(
	buffer: TestAudioBuffer | ToneAudioBuffer,
	fftSize = 2048,
	hopSize = 32
): HTMLElement {
	buffer = new TestAudioBuffer(buffer);
	const analysis = analyze(buffer, fftSize, hopSize);
	const element = document.createElement("div");
	const rotated = array2d.rotate(analysis, array2d.DIRECTIONS.LEFT);
	const flipped = array2d.flip(rotated, array2d.AXES.X);
	plotly.newPlot(
		element,
		[
			{
				z: flipped,
				type: "heatmap",
				colorscale: "Viridis",
			},
		],
		{
			yaxis: {
				type: "log",
				autorange: true,
			},
			zaxis: {
				type: "log",
				autorange: true,
			},
		}
	);
	return element;
}

/**
 * Generate a plot of the input signal
 */
export function signal(buffer: TestAudioBuffer | ToneAudioBuffer): HTMLElement {
	buffer = new TestAudioBuffer(buffer);
	const descriptions = buffer.toArray().map((array, i) => {
		return {
			y: array,
			x: array.map((_, t: number) => t / buffer.sampleRate),
			xaxis: "x",
			yaxis: `y${i + 1}`,
			type: "scatter",
			mode: "lines",
			name: `channel ${i}`,
		};
	});
	const element = document.createElement("div");
	plotly.newPlot(element, descriptions, {
		grid: {
			rows: buffer.numberOfChannels,
			columns: 1,
		},
		xaxis: {
			title: "Seconds",
		},
		showlegend: false,
		colorway: ["#a600a6", "#f20076", "#ff5c40", "#ffa600"],
	});
	return element;
}
