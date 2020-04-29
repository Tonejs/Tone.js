/**
 * This is just an interface for the AudioWorkletProcessor
 */
export class AudioWorkletProcessor {
	parameterDescriptors: AudioParamDescriptor[] = []
	port: MessagePort = new MessagePort();
	constructor(_options: AudioWorkletNodeOptions) { }
	process(_inputs: Float32Array[][] | undefined[], _outputs: Float32Array[][], _parameters: { [name: string]: Float32Array }): boolean {
		return false;
	}
}
