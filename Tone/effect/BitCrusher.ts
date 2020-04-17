import { ToneAudioWorklet, ToneAudioWorkletOptions } from "../core/context/ToneAudioWorklet";
import { Effect, EffectOptions } from "./Effect";
import { NormalRange, Positive } from "../core/type/Units";
import { Gain } from "../core/context/Gain";
import { optionsFromArguments } from "../core/util/Defaults";
import { connectSeries } from "../core/context/ToneAudioNode";
import { Param } from "../core/context/Param";

export interface BitCrusherOptions extends EffectOptions {
	bits: Positive;
}

/**
 * BitCrusher down-samples the incoming signal to a different bit depth.
 * Lowering the bit depth of the signal creates distortion. Read more about BitCrushing
 * on [Wikipedia](https://en.wikipedia.org/wiki/Bitcrusher).
 * @example
 * // initialize crusher and route a synth through it
 * const crusher = new Tone.BitCrusher(4).toDestination();
 * const synth = new Tone.Synth().connect(crusher);
 * synth.triggerAttackRelease("C2", 2);
 * 
 * @category Effect
 */
export class BitCrusher extends Effect<BitCrusherOptions> {

	readonly name: string = "BitCrusher";

	/**
	 * The bit depth of the effect
	 * @min 1
	 * @max 16
	 */
	readonly bits: Param<"positive">;

	/**
	 * The node which does the bit crushing effect. Runs in an AudioWorklet when possible.
	 */
	private _bitCrusherWorklet: BitCrusherWorklet;

	constructor(bits?: Positive, frequencyReduction?: NormalRange);
	constructor(options?: Partial<BitCrusherWorkletOptions>);
	constructor() {
		super(optionsFromArguments(BitCrusher.getDefaults(), arguments, ["bits"]));
		const options = optionsFromArguments(BitCrusher.getDefaults(), arguments, ["bits"]);

		this._bitCrusherWorklet = new BitCrusherWorklet({
			context: this.context,
			bits: options.bits,
		});
		// connect it up
		this.connectEffect(this._bitCrusherWorklet);

		this.bits = this._bitCrusherWorklet.bits;
	}

	static getDefaults(): BitCrusherOptions {
		return Object.assign(Effect.getDefaults(), {
			bits: 4,
			frequencyReduction: 0.5,
		});
	}

	dispose(): this {
		super.dispose();
		this._bitCrusherWorklet.dispose();
		return this;
	}
}

interface BitCrusherWorkletOptions extends ToneAudioWorkletOptions {
	bits: number;
}

/**
 * Internal class which creates an AudioWorklet to do the bit crushing
 */
class BitCrusherWorklet extends ToneAudioWorklet<BitCrusherWorkletOptions> {

	readonly name: string = "BitCrusherWorklet";

	readonly input: Gain;
	readonly output: Gain;

	readonly bits: Param<"positive">;

	protected workletOptions: Partial<AudioWorkletNodeOptions> = {
		numberOfInputs: 1,
		numberOfOutputs: 1,
	}

	constructor(options?: Partial<BitCrusherWorkletOptions>);
	constructor() {
		super(optionsFromArguments(BitCrusherWorklet.getDefaults(), arguments));
		const options = optionsFromArguments(BitCrusherWorklet.getDefaults(), arguments);

		this.input = new Gain({ context: this.context });
		this.output = new Gain({ context: this.context });

		const dummyGain = this.context.createGain();

		this.bits = new Param<"positive">({
			context: this.context,
			value: options.bits,
			units: "positive",
			minValue: 1,
			maxValue: 16,
			param: dummyGain.gain,
			swappable: true,
		});
	}

	static getDefaults(): BitCrusherWorkletOptions {
		return Object.assign(ToneAudioWorklet.getDefaults(), {
			bits: 12,
		});
	}

	protected _audioWorkletName(): string {
		return "bit-crusher";
	}

	protected _audioWorklet(): string {
		return /* javascript */` 
		registerProcessor("${this._audioWorkletName()}", class extends AudioWorkletProcessor {
			static get parameterDescriptors () {
				return [{
					name: 'bits',
					defaultValue: 12,
					minValue: 1,
					maxValue: 16
				}];
			}
			
			process (inputs, outputs, parameters) {
				const input = inputs[0];
				const output = outputs[0];
				if (input && output && input.length === output.length) {
					const bits = parameters.bits;
					for (let channelNum = 0; channelNum < input.length; channelNum++) {
						const inputChannel = input[channelNum];
						for (let index = 0; index < inputChannel.length; index++) {
							const value = inputChannel[index];
							const step = bits.length > 1 ? Math.pow(0.5, bits[index]) : Math.pow(0.5, bits[0]);
							const val = step * Math.floor(value / step + 0.5);
							output[channelNum][index] = val;
						}
					}
				}
				return true;
			}
		});
		`;
	}

	onReady(node: AudioWorkletNode) {
		connectSeries(this.input, node, this.output);
		// @ts-ignore
		const bits = node.parameters.get("bits");
		this.bits.setParam(bits);
	}

	dispose(): this {
		super.dispose();
		this.input.dispose();
		this.output.dispose();
		this.bits.dispose();
		return this;
	}
}
