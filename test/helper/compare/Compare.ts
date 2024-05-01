import { OfflineRender } from "./OfflineRender";
import { analyze } from "./Spectrum";
import { TestAudioBuffer } from "./TestAudioBuffer";

export function compareSpectra(bufferA: TestAudioBuffer, bufferB: TestAudioBuffer): number {

	if (bufferA.length !== bufferB.length) {
		throw new Error("buffers must be the same length to compare");
	}
	const analysisA = analyze(bufferA, 1024, 64);
	const analysisB = analyze(bufferB, 1024, 64);

	let diff = 0;
	analysisA.forEach((columnA, columnNum) => {
		const columnB = analysisB[columnNum];
		columnA.forEach((valA, index) => {
			const valB = columnB[index];
			diff += Math.pow(valA - valB, 2);
		});
	});
	return Math.sqrt(diff / analysisA.length);
}

export function compareSignals(bufferA: TestAudioBuffer, bufferB: TestAudioBuffer): number {
	const arrayA = bufferA.toArray();
	const arrayB = bufferB.toArray();
	const diffs = arrayA.map((channelA, channelNum) => {
		let diff = 0;
		const channelB = arrayB[channelNum];
		channelA.forEach((valA, index) => {
			const valB = channelB[index];
			diff += Math.pow(valA - valB, 2);
		});
		return Math.sqrt(diff / channelA.length);
	});
	// average across the channels
	return diffs.reduce((t, v) => t + v, 0) / diffs.length;
}

interface BufferResponse {
	bufferA: TestAudioBuffer;
	bufferB: TestAudioBuffer;
}

type BufferResponseType = BufferResponse | void;

async function getBuffersToCompare(
	callback: (context: OfflineAudioContext) => Promise<void> | void,
	filename: string,
	duration = 0.5,
	channels = 1,
	sampleRate = 11025,
	forceRender = false
): Promise<BufferResponseType> {
	if (forceRender) {
		const buffer = await OfflineRender(callback, duration, channels, sampleRate);
		buffer.downloadWav(filename);
		return Promise.resolve();
	} else {
		const bufferB = await fetch(filename).then(response => response.arrayBuffer()).then(buffer => {
			const context = new OfflineAudioContext(channels, 1, sampleRate);
			return context.decodeAudioData(buffer);
		}).then(audioBuffer => new TestAudioBuffer(audioBuffer));
		const bufferA = await OfflineRender(callback, bufferB.duration, bufferB.numberOfChannels, bufferB.sampleRate);

		// const [bufferA, bufferB] = await Promise.all([bufferAPromise, bufferBPromise]);
		return {
			bufferA, bufferB,
		};
	}
}

export async function toFile(
	callback: (context: OfflineAudioContext) => Promise<void> | void,
	filename: string,
	threshold = 0.1,
	forceRender = false,
	duration = 0.1,
	channels = 1,
	sampleRate = 11025,
) {
	const response = await getBuffersToCompare(callback, filename, duration, channels, sampleRate, forceRender);
	if (response) {
		const { bufferA, bufferB } = response;
		const error = compareSpectra(bufferA, bufferB);
		if (error > threshold) {
			throw new Error(`Error ${error} greater than threshold ${threshold}`);
		}
	}
}

export async function toFileSignal(
	callback: (context: OfflineAudioContext) => Promise<void> | void,
	filename: string,
	threshold = 0.1,
	forceRender = false,
	duration = 0.1,
	channels = 1,
	sampleRate = 11025,
) {
	const response = await getBuffersToCompare(callback, filename, duration, channels, sampleRate, forceRender);
	if (response) {
		const { bufferA, bufferB } = response;
		if (compareSignals(bufferA, bufferB) > threshold) {
			throw new Error(`generated buffer does not match file ${filename}`);
		}
	}
}
