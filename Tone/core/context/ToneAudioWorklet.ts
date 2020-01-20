import { ToneAudioNode, ToneAudioNodeOptions } from "./ToneAudioNode";
import { noOp } from "../util/Interface";

export type ToneAudioWorkletOptions = ToneAudioNodeOptions;

export abstract class ToneAudioWorklet<Options extends ToneAudioWorkletOptions> extends ToneAudioNode<Options> {

	readonly name: string = "ToneAudioWorklet";

	/**
	 * The processing node
	 */
	protected _worklet!: AudioWorkletNode;

	/**
	 * The constructor options for the node
	 */
	protected workletOptions: Partial<AudioWorkletNodeOptions> = {};

	/**
	 * The code which is run in the worklet
	 */
	protected abstract _audioWorklet(): string;

	/**
	 * Get the name of the audio worklet
	 */
	protected abstract _audioWorkletName(): string;
	
	/**
	 * Invoked when the module is loaded and the node is created
	 */
	protected abstract onReady(node: AudioWorkletNode): void;

	/**
	 * Callback which is invoked when there is an error in the processing
	 */
	onprocessorerror: (e: string) => void = noOp;
	
	constructor(options: Options) {
		super(options);

		const blobUrl = URL.createObjectURL(new Blob([this._audioWorklet()], { type: "text/javascript" }));
		const name = this._audioWorkletName();

		// Register the processor
		this.context.addAudioWorkletModule(blobUrl, name).then(() => {
			// create the worklet when it's read
			if (!this.disposed) {
				this._worklet = this.context.createAudioWorkletNode(name, this.workletOptions);
				this._worklet.onprocessorerror = this.onprocessorerror.bind(this);
				this.onReady(this._worklet);
			}
		});
	}

	dispose(): this {
		super.dispose();
		if (this._worklet) {
			this._worklet.disconnect();
		}
		return this;
	}

}
