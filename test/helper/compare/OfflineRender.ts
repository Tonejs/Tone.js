import { TestAudioBuffer } from "./TestAudioBuffer.js";

export async function OfflineRender(
	callback: (context: OfflineAudioContext) => Promise<void> | void,
	duration = 0.001,
	channels = 1,
	sampleRate = 11025
): Promise<TestAudioBuffer> {
	// the offline context
	const offlineContext = new OfflineAudioContext(
		channels,
		Math.floor(duration * sampleRate),
		sampleRate
	) as unknown as OfflineAudioContext;

	// wait for the callback
	await callback(offlineContext);

	// render the buffer
	const buffer = await offlineContext.startRendering();

	// wrap the buffer
	return new TestAudioBuffer(buffer);
}

/**
 * Returns true if the input passes audio to the output
 */
export async function PassesAudio(
	callback: (
		context: OfflineAudioContext,
		input: ConstantSourceNode,
		output: AudioDestinationNode
	) => Promise<void> | void
): Promise<boolean> {
	const buffer = await OfflineRender(
		async (context) => {
			const source =
				context.createConstantSource() as unknown as ConstantSourceNode;
			source.start(0);
			source.offset.setValueAtTime(0, 0);
			source.offset.setValueAtTime(1, 0.25);
			const destination =
				context.destination as unknown as AudioDestinationNode;
			await callback(context, source, destination);
		},
		0.5,
		1,
		11025
	);
	const sample0 = buffer.getValueAtTime(0) === 0;
	const sample1 = buffer.getValueAtTime(0.2) === 0;
	const sample2 = (buffer.getValueAtTime(0.26) as number) > 0;
	const sample3 = (buffer.getValueAtTime(0.49) as number) > 0;
	return sample0 && sample1 && sample2 && sample3;
}

/**
 * Returns true if the callback makes a sound
 */
export async function MakesSound(
	callback: (context: OfflineAudioContext) => Promise<void> | void,
	duration = 0.001,
	channels = 1,
	sampleRate = 11025
): Promise<boolean> {
	const buffer = await OfflineRender(
		callback,
		duration,
		channels,
		sampleRate
	);
	return !buffer.isSilent();
}
