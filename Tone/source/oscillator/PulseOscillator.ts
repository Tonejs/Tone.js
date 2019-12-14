import { Gain } from "../../core/context/Gain";
import { AudioRange, Degrees, Frequency, Seconds, Time } from "../../core/type/Units";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { Signal } from "../../signal/Signal";
import { WaveShaper } from "../../signal/WaveShaper";
import { Source } from "../Source";
import { Oscillator } from "./Oscillator";
import { generateWaveform, PulseOscillatorOptions, ToneOscillatorInterface } from "./OscillatorInterface";

export { PulseOscillatorOptions } from "./OscillatorInterface";

/**
 * PulseOscillator is an oscillator with control over pulse width,
 * also known as the duty cycle. At 50% duty cycle (width = 0) the wave is
 * a square wave.
 * [Read more](https://wigglewave.wordpress.com/2014/08/16/pulse-waveforms-and-harmonics/).
 * ```
 *    width = -0.25        width = 0.0          width = 0.25
 *
 *   +-----+            +-------+       +    +-------+     +-+
 *   |     |            |       |       |            |     |
 *   |     |            |       |       |            |     |
 * +-+     +-------+    +       +-------+            +-----+
 *
 *
 *    width = -0.5                              width = 0.5
 *
 *     +---+                                 +-------+   +---+
 *     |   |                                         |   |
 *     |   |                                         |   |
 * +---+   +-------+                                 +---+
 *
 *
 *    width = -0.75                             width = 0.75
 *
 *       +-+                                 +-------+ +-----+
 *       | |                                         | |
 *       | |                                         | |
 * +-----+ +-------+                                 +-+
 * ```
 * @example
 * import { PulseOscillator } from "tone";
 * const pulse = new PulseOscillator("E5", 0.4).toDestination().start();
 * @category Source
 */
export class PulseOscillator extends Source<PulseOscillatorOptions> implements ToneOscillatorInterface {

	readonly name: string = "PulseOscillator";

	/**
	 * The width of the pulse.
	 */
	width: Signal<"audioRange">;

	/**
	 * gate the width amount
	 */
	private _widthGate: Gain = new Gain({
		context: this.context,
		gain: 0,
	});

	/**
	 * the sawtooth oscillator
	 */
	private _sawtooth: Oscillator;

	/**
	 * The frequency control.
	 */
	frequency: Signal<"frequency">;

	/**
	 * The detune in cents.
	 */
	detune: Signal<"cents">;

	/**
	 * Threshold the signal to turn it into a square
	 */
	private _thresh = new WaveShaper({
		context: this.context,
		mapping: val => val <= 0 ? -1 : 1,
	});

	/**
	 * @param frequency The frequency of the oscillator
	 * @param width The width of the pulse
	 */
	constructor(frequency?: Frequency, width?: AudioRange);
	constructor(options?: Partial<PulseOscillatorOptions>);
	constructor() {

		super(optionsFromArguments(PulseOscillator.getDefaults(), arguments, ["frequency", "width"]));
		const options = optionsFromArguments(PulseOscillator.getDefaults(), arguments, ["frequency", "width"]);

		this.width = new Signal({
			context: this.context,
			units: "audioRange",
			value: options.width,
		});

		this._sawtooth = new Oscillator({
			context: this.context,
			detune: options.detune,
			frequency: options.frequency,
			onstop: () => this.onstop(this),
			phase: options.phase,
			type: "sawtooth",
		});
		this.frequency = this._sawtooth.frequency;
		this.detune = this._sawtooth.detune;

		// connections
		this._sawtooth.chain(this._thresh, this.output);
		this.width.chain(this._widthGate, this._thresh);
		readOnly(this, ["width", "frequency", "detune"]);
	}

	static getDefaults(): PulseOscillatorOptions {
		return Object.assign(Source.getDefaults(), {
			detune: 0,
			frequency: 440,
			phase: 0,
			type: "pulse" as "pulse",
			width: 0.2,
		});
	}

	/**
	 * start the oscillator
	 */
	protected _start(time: Time): void {
		time = this.toSeconds(time);
		this._sawtooth.start(time);
		this._widthGate.gain.setValueAtTime(1, time);
	}

	/**
	 * stop the oscillator
	 */
	protected _stop(time: Time): void {
		time = this.toSeconds(time);
		this._sawtooth.stop(time);
		// the width is still connected to the output.
		// that needs to be stopped also
		this._widthGate.gain.cancelScheduledValues(time);
		this._widthGate.gain.setValueAtTime(0, time);
	}

	protected _restart(time: Seconds): void {
		this._sawtooth.restart(time);
		this._widthGate.gain.cancelScheduledValues(time);
		this._widthGate.gain.setValueAtTime(1, time);
	}

	/**
	 * The phase of the oscillator in degrees.
	 */
	get phase(): Degrees {
		return this._sawtooth.phase;
	}
	set phase(phase: Degrees) {
		this._sawtooth.phase = phase;
	}

	/**
	 * The type of the oscillator. Always returns "pulse".
	 */
	get type(): "pulse" {
		return "pulse";
	}

	/**
	 * The baseType of the oscillator. Always returns "pulse".
	 */
	get baseType(): "pulse" {
		return "pulse";
	}

	/**
	 * The partials of the waveform. Cannot set partials for this waveform type
	 */
	get partials(): number[] {
		return [];
	}

	/**
	 * No partials for this waveform type.
	 */
	get partialCount(): number {
		return 0;
	}

	async asArray(length = 1024): Promise<Float32Array> {
		return generateWaveform(this, length);
	}

	/**
	 * Clean up method.
	 */
	dispose(): this {
		super.dispose();
		this._sawtooth.dispose();
		this.width.dispose();
		this._widthGate.dispose();
		this._thresh.dispose();
		return this;
	}
}
