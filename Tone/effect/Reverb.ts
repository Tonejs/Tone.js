import { Merge } from "../component/channel/Merge";
import { Gain } from "../core/context/Gain";
import { Seconds, Time } from "../core/type/Units";
import { optionsFromArguments } from "../core/util/Defaults";
import { Noise } from "../source/Noise";
import { Effect, EffectOptions } from "./Effect";
import { OfflineContext } from "../core/context/OfflineContext";
import { noOp } from "../core/util/Interface";
import { assertRange } from "../core/util/Debug";

interface ReverbOptions extends EffectOptions {
	decay: Seconds;
	preDelay: Seconds;
}

/**
 * Simple convolution created with decaying noise.
 * Generates an Impulse Response Buffer
 * with Tone.Offline then feeds the IR into ConvolverNode.
 * The impulse response generation is async, so you have
 * to wait until [[ready]] resolves before it will make a sound. 
 *
 * Inspiration from [ReverbGen](https://github.com/adelespinasse/reverbGen).
 * Copyright (c) 2014 Alan deLespinasse Apache 2.0 License.
 * 
 * @category Effect
 */
export class Reverb extends Effect<ReverbOptions> {

	readonly name: string = "Reverb";

	/**
	 * Convolver node
	 */
	private _convolver: ConvolverNode = this.context.createConvolver();

	/**
	 * The duration of the reverb.
	 */
	private _decay: Seconds;
	
	/**
	 * The amount of time before the reverb is fully ramped in.
	 */
	private _preDelay: Seconds;

	/**
	 * Resolves when the reverb buffer is generated. Whenever either [[decay]]
	 * or [[preDelay]] are set, you have to wait until [[ready]] resolves
	 * before the IR is generated with the latest values. 
	 */
	ready: Promise<void> = Promise.resolve();

	/**
	 * @param decay The amount of time it will reverberate for.
	 */
	constructor(decay?: Seconds);
	constructor(options?: Partial<ReverbOptions>);
	constructor() {

		super(optionsFromArguments(Reverb.getDefaults(), arguments, ["decay"]));
		const options = optionsFromArguments(Reverb.getDefaults(), arguments, ["decay"]);

		this._decay = options.decay;
		this._preDelay = options.preDelay;
		this.generate();

		this.connectEffect(this._convolver);
	}

	static getDefaults(): ReverbOptions {
		return Object.assign(Effect.getDefaults(), {
			decay: 1.5,
			preDelay: 0.01,
		});
	}

	/**
	 * The duration of the reverb.
	 */
	get decay(): Time {
		return this._decay;
	}
	set decay(time) {
		time = this.toSeconds(time);
		assertRange(time, 0.001);
		this._decay = time;
		this.generate();
	}

	/**
	 * The amount of time before the reverb is fully ramped in.
	 */
	get preDelay(): Time {
		return this._preDelay;
	}
	set preDelay(time) {
		time = this.toSeconds(time);
		assertRange(time, 0);
		this._preDelay = time;
		this.generate();
	}

	/**
	 * Generate the Impulse Response. Returns a promise while the IR is being generated.
	 * @return Promise which returns this object.
	 */
	async generate(): Promise<this> {
		const previousReady = this.ready;

		// create a noise burst which decays over the duration in each channel
		const context = new OfflineContext(2, this._decay + this._preDelay, this.context.sampleRate);
		const noiseL = new Noise({ context });
		const noiseR = new Noise({ context });
		const merge = new Merge({ context });
		noiseL.connect(merge, 0, 0);
		noiseR.connect(merge, 0, 1);
		const gainNode = new Gain({ context }).toDestination();
		merge.connect(gainNode);
		noiseL.start(0);
		noiseR.start(0);
		// predelay
		gainNode.gain.setValueAtTime(0, 0);
		gainNode.gain.setValueAtTime(1, this._preDelay);
		// decay
		gainNode.gain.exponentialApproachValueAtTime(0, this._preDelay, this.decay);
		
		// render the buffer
		const renderPromise = context.render();
		this.ready = renderPromise.then(noOp);
		
		// wait for the previous `ready` to resolve
		await previousReady;
		// set the buffer
		this._convolver.buffer = (await renderPromise).get() as AudioBuffer;

		return this;
	}

	dispose(): this {
		super.dispose();
		this._convolver.disconnect();
		return this;
	}
}
