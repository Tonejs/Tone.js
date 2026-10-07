import { Frequency } from "../core/type/Units.js";
import { optionsFromArguments } from "../core/util/Defaults.js";
import { readOnly } from "../core/util/Interface.js";
import { Multiply } from "../signal/Multiply.js";
import { Signal } from "../signal/Signal.js";
import { Oscillator } from "../source/oscillator/Oscillator.js";
import { ToneOscillatorType } from "../source/oscillator/OscillatorInterface.js";
import { Effect, EffectOptions } from "./Effect.js";

export interface RingModulatorOptions extends EffectOptions {
	frequency: Frequency;
	type: ToneOscillatorType;
}

/**
 * RingModulator multiplies the incoming signal by a carrier oscillator.
 * Unlike {@link Tremolo}, the carrier swings between -1 and 1, so the output
 * contains the sum and difference of the input and carrier frequencies
 * instead of the original frequencies, giving the classic metallic, bell-like sound.
 *
 * @example
 * const ringMod = new Tone.RingModulator(440).toDestination();
 * const synth = new Tone.Synth().connect(ringMod);
 * synth.triggerAttackRelease("C4", "2n");
 * @category Effect
 */
export class RingModulator extends Effect<RingModulatorOptions> {
	readonly name: string = "RingModulator";

	/**
	 * The frequency of the carrier oscillator.
	 */
	readonly frequency: Signal<"frequency">;

	/**
	 * The carrier oscillator
	 */
	private _carrier: Oscillator;

	/**
	 * Where the input is multiplied by the carrier
	 */
	private _multiply: Multiply;

	/**
	 * @param frequency The frequency of the carrier oscillator.
	 */
	constructor(frequency?: Frequency);
	constructor(options?: Partial<RingModulatorOptions>);
	constructor() {
		const options = optionsFromArguments(
			RingModulator.getDefaults(),
			arguments,
			["frequency"]
		);
		super(options);

		this._carrier = new Oscillator({
			context: this.context,
			frequency: options.frequency,
		});
		this.frequency = this._carrier.frequency;
		this.type = options.type;

		this._multiply = new Multiply({ context: this.context });
		this.connectEffect(this._multiply);
		this._carrier.connect(this._multiply.factor);

		readOnly(this, "frequency");

		this._onContextRunning(() => this._carrier.start(this.immediate()));
	}

	static getDefaults(): RingModulatorOptions {
		return Object.assign(Effect.getDefaults(), {
			frequency: 440,
			type: "sine" as const,
		});
	}

	/**
	 * The type of the carrier oscillator.
	 */
	get type(): ToneOscillatorType {
		return this._carrier.type;
	}
	set type(type) {
		this._carrier.type = type;
	}

	dispose(): this {
		super.dispose();
		this._carrier.dispose();
		this._multiply.dispose();
		return this;
	}
}
