import { AudioWorkletProcessor } from "./AudioWorkletProcessor.worklet";
import { addToWorklet } from "./WorkletGlobalScope";

/**
 * The base AudioWorkletProcessor for use in Tone.js. Works with the [[ToneAudioWorklet]]. 
 */
export class ToneAudioWorkletProcessor extends AudioWorkletProcessor {
	/**
	 * If the processor was disposed or not. Keep alive until it's disposed.
	 */
	protected disposed = false

	/** 
	 * The number of samples in the processing block
	 */
	protected blockSize = 128;

	/**
	 * the sample rate
	 */
	// @ts-ignore
	protected sampleRate = sampleRate;

	constructor(options: AudioWorkletNodeOptions) {
		super(options);
		this.port.onmessage = (event: MessageEvent) => {
			// when it receives a dispose 
			if (event.data === "dispose") {
				this.disposed = true;
			}
		};
	}
}

addToWorklet(ToneAudioWorkletProcessor);
