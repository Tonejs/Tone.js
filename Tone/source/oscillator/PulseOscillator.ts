// import Tone from "../core/Tone";
// import "../source/Source";
// import "../source/Oscillator";
// import "../signal/Signal";
// import "../signal/WaveShaper";
// import "../core/Gain";
import { readOnly } from "Tone/core/util/Interface";
import { WaveShaper } from "Tone/signal/WaveShaper";
import { Gain } from "../../core/context/Gain";
import { Param } from "../../core/context/Param";
import { optionsFromArguments } from "../../core/util/Defaults";
import { Signal } from "../../signal/Signal";
import { Source } from "../Source";
import { Oscillator, OscillatorInterface, ToneOscillatorOptions, ToneOscillatorType } from "./Oscillator";

type PulseOscillatorType = "pulse";

interface PulseOscillatorOptions extends ToneOscillatorOptions {
	width: NormalRange;
}

/**
 * PulseOscillator is an oscillator with control over pulse width,
 * also known as the duty cycle. At 50% duty cycle (width = 0) the wave is
 * a square wave.
 * [Read more](https://wigglewave.wordpress.com/2014/08/16/pulse-waveforms-and-harmonics/).
 * <pre>
 *   width = 0.25        width = 0.5         width = 0.75
 * +---+         +     +------+      +     +---------+   +
 * |   |         |     |      |      |     |         |   |
 * |   |         |     |      |      |     |         |   |
 * +   +---------+     +      +------+     +         +---+
 * </pre>
 * @param frequency The frequency of the oscillator
 * @param width The width of the pulse
 * @example
 * var pulse = new PulseOscillator("E5", 0.4).toMaster().start();
 */
export class PulseOscillator extends Source<PulseOscillatorOptions> implements OscillatorInterface {

	readonly name = "PulseOscillator";

	/**
	 *  The width of the pulse.
	 */
	width: Signal<"audioRange"> = new Signal({
		context: this.context,
		units: "audioRange",
	});

	/**
	 *  gate the width amount
	 */
	private _widthGate: Gain = new Gain({
		context: this.context,
		gain: 0,
	});

	/**
	 *  the sawtooth oscillator
	 */
	private _sawtooth: Oscillator = new Oscillator({
		context: this.context,
		type : "sawtooth",
	});

	/**
	 *  The frequency control.
	 */
	frequency: Signal<"frequency"> = this._sawtooth.frequency;

	/**
	 *  The detune in cents.
	 */
	detune: Signal<"cents"> = this._sawtooth.detune;

	/**
	 *  Threshold the signal to turn it into a square
	 */
	private _thresh = new WaveShaper({
		context: this.context,
		mapping: val => val <= 0 ? -1 : 1,
	});

	constructor(options?: Partial<PulseOscillatorOptions>);
	constructor(frequency?: Frequency, type?: ToneOscillatorType, modulationType?: ToneOscillatorType);
	constructor() {

		super(optionsFromArguments(PulseOscillator.getDefaults(), arguments, ["frequency", "width"]));
		const options = optionsFromArguments(PulseOscillator.getDefaults(), arguments, ["frequency", "width"]);

		this.width.setValueAtTime(options.width, 0);
		this._sawtooth.frequency.setValueAtTime(options.frequency, 0);
		this._sawtooth.detune.setValueAtTime(options.detune, 0);
		this._sawtooth.phase = options.phase;

		// connections
		this._sawtooth.chain(this._thresh, this.output);
		this.width.chain(this._widthGate, this._thresh);
		readOnly(this, ["width", "frequency", "detune"]);
	}

	static getDefaults(): PulseOscillatorOptions {
		return Object.assign(Oscillator.getDefaults(), {
			width: 0.2,
		});
	}

	/**
	 *  start the oscillator
	 */
	protected _start(time: Time): void {
		time = this.toSeconds(time);
		this._sawtooth.start(time);
		this._widthGate.gain.setValueAtTime(1, time);
	}

	/**
	 *  stop the oscillator
	 */
	protected _stop(time: Time): void {
		time = this.toSeconds(time);
		this._sawtooth.stop(time);
		// the width is still connected to the output.
		// that needs to be stopped also
		this._widthGate.gain.cancelScheduledValues(time);
		this._widthGate.gain.setValueAtTime(0, time);
	}

	/**
	 *  Restart the oscillator
	 */
	restart(time?: Time): this {
		this._sawtooth.restart(time);
		this._widthGate.gain.cancelScheduledValues(time);
		this._widthGate.gain.setValueAtTime(1, time);
		return this;
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
	get type(): PulseOscillatorType {
		return "pulse";
	}

	/**
	 * The baseType of the oscillator. Always returns "pulse".
	 */
	get baseType(): PulseOscillatorType {
		return "pulse";
	}

	/**
	 * The partials of the waveform. Cannot set partials for this waveform type
	 */
	get partials(): number[] {
		return [];
	}

	/**
	 * The partials no partials for this waveform type.
	 */
	get partialCount(): number {
		return 0;
	}

	/**
	 *  Clean up method.
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
