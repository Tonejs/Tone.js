import { Gain } from "../../core/context/Gain";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { Multiply } from "../../signal/Multiply";
import { Signal } from "../../signal/Signal";
import { Source } from "../Source";
import { Oscillator, OscillatorInterface, ToneOscillatorOptions, ToneOscillatorType } from "./Oscillator";
import { PulseOscillator } from "./PulseOscillator";

interface PWMOscillatorOptions extends ToneOscillatorOptions {
	modulationFrequency: Frequency;
}

type PWMOscillatorType = "pwm";

/**
 *  @class PWMOscillator modulates the width of a Tone.PulseOscillator
 *         at the modulationFrequency. This has the effect of continuously
 *         changing the timbre of the oscillator by altering the harmonics
 *         generated.
 *
 *  @extends {Tone.Source}
 *  @constructor
 *  @param {Frequency} frequency The starting frequency of the oscillator.
 *  @param {Frequency} modulationFrequency The modulation frequency of the width of the pulse.
 *  @example
 *  var pwm = new PWMOscillator("Ab3", 0.3).toMaster().start();
 */
export class PWMOscillator extends Source<PWMOscillatorOptions> implements OscillatorInterface {

	name = "PWMOscillator";

	/**
	 *  the pulse oscillator
	 */
	private _pulse: PulseOscillator = new PulseOscillator({ context: this.context });
	/**
	 *  the modulator
	 *  @type {Tone.Oscillator}
	 *  @private
	 */
	private _modulator: Oscillator = new Oscillator({ context: this.context });

	/**
	 *  Scale the oscillator so it doesn't go silent
	 *  at the extreme values.
	 */
	private _scale: Multiply = new Multiply({
		context: this.context,
		value: 2,
	});

	/**
	 *  The frequency control.
	 */
	readonly frequency: Signal<Frequency> = this._modulator.frequency;

	/**
	 *  The detune of the oscillator.
	 */
	readonly detune: Signal<Cents> = this._modulator.detune;

	/**
	 *  The modulation rate of the oscillator.
	 */
	readonly modulationFrequency: Signal<Frequency> = this._pulse.frequency;

	constructor() {
		super(optionsFromArguments(PWMOscillator.getDefaults(), arguments, ["frequency", "modulationFrequency"]));
		const options = optionsFromArguments(PWMOscillator.getDefaults(), arguments, ["frequency", "modulationFrequency"]);

		// change the pulse oscillator type
		// @ts-ignore
		this._pulse._sawtooth.type = "sine";

		this._pulse.frequency.setValueAtTime(options.modulationFrequency, 0);
		this._modulator.frequency.setValueAtTime(options.frequency, 0);
		this._modulator.detune.setValueAtTime(options.detune, 0);
		this._modulator.phase = options.phase;

		// connections
		this._modulator.chain(this._scale, this._pulse.width);
		this._pulse.connect(this.output);
		readOnly(this, ["modulationFrequency", "frequency", "detune"]);
	}

	static getDefaults(): PWMOscillatorOptions {
		return Object.assign(Oscillator.getDefaults(), {
			modulationFrequency: 0.4,
		});
	}
	/**
	 *  start the oscillator
	 */
	protected _start(time: Time): void {
		time = this.toSeconds(time);
		this._modulator.start(time);
		this._pulse.start(time);
	}

	/**
	 *  stop the oscillator
	 */
	protected _stop(time: Time): void {
		time = this.toSeconds(time);
		this._modulator.stop(time);
		this._pulse.stop(time);
	}

	/**
	 *  restart the oscillator
	 */
	restart(time?: Time): this {
		this._modulator.restart(time);
		this._pulse.restart(time);
		return this;
	}

	/**
	 * The type of the oscillator. Always returns "pwm".
	 */
	get type(): PWMOscillatorType {
		return "pwm";
	}

	/**
	 * The baseType of the oscillator. Always returns "pwm".
	 */
	get baseType(): PWMOscillatorType {
		return "pwm";
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

	/**
	 * The phase of the oscillator in degrees.
	 */
	get phase(): Degrees {
		return this._modulator.phase;
	}
	set phase(phase: Degrees) {
		this._modulator.phase = phase;
	}

	/**
	 *  Clean up.
	 */
	dispose(): this {
		super.dispose();
		this._pulse.dispose();
		this._scale.dispose();
		this._modulator.dispose();
		return this;
	}
}
