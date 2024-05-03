import { Compare, TestAudioBuffer } from "./compare/index.js";
import { ToneAudioBuffer } from "../../Tone/core/context/ToneAudioBuffer.js";
import { Offline } from "../../Tone/core/context/Offline.js";
import { Context } from "../../Tone/core/context/Context.js";

/**
 * Load a file for comparison
 */
async function getBuffersToCompare(
	callback: (context: Context) => Promise<void> | void,
	filename: string,
	duration = 0.5,
	channels = 1,
	sampleRate = 11025,
	forceRender = false
): Promise<{ bufferA: TestAudioBuffer; bufferB: TestAudioBuffer } | void> {
	if (forceRender) {
		const buffer = await Offline(callback, duration, channels, sampleRate);
		new TestAudioBuffer(buffer).downloadWav(filename);
	} else {
		const loadedBuffer = await ToneAudioBuffer.fromUrl(filename);
		const bufferB = new TestAudioBuffer(loadedBuffer);
		const renderedBuffer = await Offline(
			callback,
			bufferB.duration,
			bufferB.numberOfChannels,
			bufferB.sampleRate
		);
		const bufferA = new TestAudioBuffer(renderedBuffer);
		return {
			bufferA,
			bufferB,
		};
	}
}

/**
 * Compare the output of the callback to a pre-rendered file
 */
export async function CompareToFile(
	callback,
	url: string,
	threshold = 0.001,
	RENDER_NEW = false,
	duration = 0.1,
	channels = 1
): Promise<void> {
	url = "test/audio/compare/" + url;
	const response = await getBuffersToCompare(
		callback,
		url,
		duration,
		channels,
		44100,
		RENDER_NEW
	);
	if (response) {
		const { bufferA, bufferB } = response;
		const error = Compare.compareSpectra(bufferA, bufferB);
		if (error > threshold) {
			throw new Error(
				`Error ${error} greater than threshold ${threshold}`
			);
		}
	}
}
