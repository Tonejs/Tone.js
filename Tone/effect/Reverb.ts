import { Merge } from "../component/channel/Merge";
import { Gain } from "../core/context/Gain";
import { Seconds } from "../core/type/Units";
import { optionsFromArguments } from "../core/util/Defaults";
import { Noise } from "../source/Noise";
import { Effect, EffectOptions } from "./Effect";
import { OfflineContext } from "../core/context/OfflineContext";

interface ReverbOptions extends EffectOptions {
	decay: Seconds;
	preDelay: Seconds;
}

/**
 * Simple convolution created with decaying noise.
 * Generates an Impulse Response Buffer
 * with Tone.Offline then feeds the IR into ConvolverNode.
 * Note: the Reverb will not make any sound until [[generate]]
 * has been invoked and resolved.
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
	 * [[generate]] must be called in order to update the values.
	 */
	decay: Seconds;
	
	/**
	 * The amount of time before the reverb is fully ramped in.
	 * [[generate]] must be called in order to update the values.
	 */
	preDelay: Seconds;

	/**
	 * @param decay The amount of time it will reverberate for.
	 */
	constructor(decay?: Seconds);
	constructor(options?: Partial<ReverbOptions>);
	constructor() {

		super(optionsFromArguments(Reverb.getDefaults(), arguments, ["decay"]));
		const options = optionsFromArguments(Reverb.getDefaults(), arguments, ["decay"]);

		this.decay = options.decay;
		this.preDelay = options.preDelay;

		this.connectEffect(this._convolver);
	}

	static getDefaults(): ReverbOptions {
		return Object.assign(Effect.getDefaults(), {
			decay: 1.5,
			preDelay: 0.01,
		});
	}

	/**
	 * Generate the Impulse Response. Returns a promise while the IR is being generated.
	 * @return Promise which returns this object.
	 */
	async generate(): Promise<this> {
		const context = new OfflineContext(2, this.decay + this.preDelay, this.context.sampleRate);
		// create a noise burst which decays over the duration
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
		gainNode.gain.setValueAtTime(1, this.preDelay);
		// decay
		gainNode.gain.exponentialApproachValueAtTime(0, this.preDelay, this.decay);
		
		// render the output
		const response = await context.render();
		this._convolver.buffer = response.get() as AudioBuffer;
		return this;
	}

	dispose(): this {
		super.dispose();
		this._convolver.disconnect();
		return this;
	}
}
