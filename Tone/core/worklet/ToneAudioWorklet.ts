import {
	ToneAudioNode,
	ToneAudioNodeOptions,
} from "../context/ToneAudioNode.js";
import { noOp } from "../util/Interface.js";

export interface ToneAudioWorkletOptions extends ToneAudioNodeOptions {
	workletOptions?: Partial<AudioWorkletNodeOptions>;
}
export abstract class ToneAudioWorklet<
	Options extends ToneAudioWorkletOptions,
> extends ToneAudioNode<Options> {
	readonly name: string = "ToneAudioWorklet";

	/**
	 * The processing node
	 */
	protected _worklet!: AudioWorkletNode;

	/**
	 * A dummy gain node to create a dummy audio param from
	 */
	private _dummyGain: GainNode;

	/**
	 * A dummy audio param to use when creating Params
	 */
	protected _dummyParam: AudioParam;

	/**
	 * The constructor options for the node
	 */
	protected workletOptions: Partial<AudioWorkletNodeOptions> = {};

	/**
	 * Get the name of the audio worklet
	 */
	protected abstract _audioWorkletName(): string;

	/**
	 * The compiled AudioWorkletProcessor code which registers `_audioWorkletName()`,
	 * see the corresponding `*.worklet.ts`/`*.worklet.generated.ts` files
	 */
	protected abstract _audioWorkletCode(): string;

	/**
	 * Invoked when the module is loaded and the node is created
	 */
	protected abstract _onReady(node: AudioWorkletNode): void;

	/**
	 * Callback which is invoked when there is an error in the processing
	 */
	onprocessorerror: (e: string) => void = noOp;

	constructor(options: Options) {
		super(options);

		const name = this._audioWorkletName();

		this._dummyGain = this.context.createGain();
		this._dummyParam = this._dummyGain.gain;

		if (options.workletOptions) {
			this.workletOptions = Object.assign(
				{},
				this.workletOptions,
				options.workletOptions
			);
		}

		// each distinct processor only needs to be registered once per context
		let contextWorklets = ToneAudioWorklet._workletPromises.get(
			this.context
		);
		if (!contextWorklets) {
			contextWorklets = new Map();
			ToneAudioWorklet._workletPromises.set(
				this.context,
				contextWorklets
			);
		}

		let workletPromise = contextWorklets.get(name);
		if (!workletPromise) {
			const blobUrl = URL.createObjectURL(
				new Blob([this._audioWorkletCode()], {
					type: "text/javascript",
				})
			);
			workletPromise = this.context.addAudioWorkletModule(blobUrl);
			contextWorklets.set(name, workletPromise);
		}

		workletPromise.then(() => {
			if (this.disposed) {
				return;
			}
			// create the worklet when it's read
			this._worklet = this.context.createAudioWorkletNode(
				name,
				this.workletOptions
			);
			this._worklet.onprocessorerror = (e) =>
				this.onprocessorerror((e as ErrorEvent).message);
			this._onReady(this._worklet);
		});
	}

	private static _workletPromises = new WeakMap<
		any,
		Map<string, Promise<void>>
	>();

	dispose(): this {
		super.dispose();
		this._dummyGain.disconnect();
		this._worklet?.port.postMessage("dispose");
		this._worklet?.disconnect();
		return this;
	}
}
