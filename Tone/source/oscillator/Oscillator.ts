import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { Signal } from "../../signal/Signal";
import { Source, SourceOptions } from "../Source";
import { ToneOscillatorNode } from "./OscillatorNode";

export type ToneOscillatorType = OscillatorType | string;

export interface ToneOscillatorOptions extends SourceOptions {
	type: ToneOscillatorType;
	frequency: Frequency;
	detune: Cents;
	phase: Degrees;
	partials: number[];
	partialCount: number;
}

/**
 * All Oscillators share this interface
 */
export interface OscillatorInterface {
	partials: number[];
	partialCount: number;
	phase: Degrees;
	frequency: Signal<"frequency">;
	detune: Signal<"cents">;
	type: ToneOscillatorType;
	baseType: OscillatorType | "pulse" | "pwm";
}

/**
 *  Oscillator supports a number of features including
 *  phase rotation, multiple oscillator types (see Oscillator.type),
 *  and Transport syncing (see Oscillator.syncFrequency).
 *
 *  @param frequency Starting frequency
 *  @param type The oscillator type. Read more about type below.
 *  @example
 * //make and start a 440hz sine tone
 * var osc = new Oscillator(440, "sine").toMaster().start();
 */
export class Oscillator extends Source<ToneOscillatorOptions> implements OscillatorInterface {

	name = "Oscillator";

	/**
	 *  the main oscillator
	 */
	private _oscillator: ToneOscillatorNode | null = null;

	/**
	 *  The frequency control.
	 */
	frequency: Signal<"frequency">;

	/**
	 *  The detune control signal.
	 */
	detune: Signal<"cents">;

	/**
	 *  the periodic wave
	 */
	private _wave?: PeriodicWave;

	/**
	 *  The partials of the oscillator
	 */
	private _partials: number[];

	/**
	 *  The number of partials to limit or extend the periodic wave by
	 */
	private _partialCount: number;

	/**
	 *  the phase of the oscillator between 0 - 360
	 */
	private _phase: Radians;

	/**
	 *  the type of the oscillator
	 *  @type {string}
	 *  @private
	 */
	private _type;

	constructor(options?: Partial<ToneOscillatorOptions>)
	constructor(frequency?: Frequency, type?: ToneOscillatorType);
	constructor() {

		super(optionsFromArguments(Oscillator.getDefaults(), arguments, ["frequency", "type"]));
		const options = optionsFromArguments(Oscillator.getDefaults(), arguments, ["frequency", "type"]);

		this.frequency = new Signal({
			context: this.context,
			units: "frequency",
			value: options.frequency,
		});
		readOnly(this, "frequency");

		this.detune = new Signal({
			context: this.context,
			units: "cents",
			value: options.detune,
		});
		readOnly(this, "detune");

		this._partials = options.partials;
		this._partialCount = options.partialCount;
		this._phase = options.phase;
		this._type = options.type;

		if (options.partialCount && options.type !== "custom") {
			this._type = this.baseType + options.partialCount.toString();
		}
		this.phase = this._phase;
	}

	static getDefaults(): ToneOscillatorOptions {
		return Object.assign(Source.getDefaults(), {
			detune: 0,
			frequency: 440,
			partialCount: 0,
			partials: [],
			phase: 0,
			type: "sine",
		});
	}

	/**
	 *  start the oscillator
	 */
	protected _start(time?: Time): void {
		this.log("start", time);
		// new oscillator with previous values
		const oscillator = new ToneOscillatorNode({
			context: this.context,
		});
		this._oscillator = oscillator;
		if (this._wave) {
			this._oscillator.setPeriodicWave(this._wave);
		} else {
			this._oscillator.type = this._type;
		}
		// connect the control signal to the oscillator frequency & detune
		this._oscillator.connect(this.output);
		this.frequency.connect(this._oscillator.frequency);
		this.detune.connect(this._oscillator.detune);

		// disconnect onended
		oscillator.onended = () => {
			// defer the callback for the offline context rendering
			setTimeout(() => {
				this.frequency.disconnect(oscillator.frequency);
				this.detune.disconnect(oscillator.detune);
			}, 100);
		};

		// start the oscillator
		time = this.toSeconds(time);
		this._oscillator.start(time);
	}

	/**
	 *  stop the oscillator
	 */
	protected _stop(time?: Time): void {
		this.log("stop", time);
		if (this._oscillator) {
			time = this.toSeconds(time);
			this._oscillator.stop(time);
		}
	}

	/**
	 * Restart the oscillator. Does not stop the oscillator, but instead
	 * just cancels any scheduled 'stop' from being invoked.
	 */
	restart(time?: Time): this {
		if (this._oscillator) {
			this._oscillator.cancelStop();
		}
		this._state.cancel(this.toSeconds(time));
		return this;
	}

	/**
	 *  Sync the signal to the Transport's bpm. Any changes to the transports bpm,
	 *  will also affect the oscillators frequency.
	 *  @example
	 * Tone.Transport.bpm.value = 120;
	 * osc.frequency.value = 440;
	 * //the ration between the bpm and the frequency will be maintained
	 * osc.syncFrequency();
	 * Tone.Transport.bpm.value = 240;
	 * // the frequency of the oscillator is doubled to 880
	 */
	syncFrequency(): this {
		this.context.transport.syncSignal(this.frequency);
		return this;
	}

	/**
	 *  Unsync the oscillator's frequency from the Transport.
	 *  See Oscillator.syncFrequency
	 */
	unsyncFrequency(): this {
		this.context.transport.unsyncSignal(this.frequency);
		return this;
	}

	/* tslint:disable */
	/**
	 * The type of the oscillator: either sine, square, triangle, or sawtooth. Also capable of
	 * setting the first x number of partials of the oscillator. For example: "sine4" would
	 * set be the first 4 partials of the sine wave and "triangle8" would set the first
	 * 8 partials of the triangle wave.
	 * <br><br>
	 * Uses PeriodicWave internally even for native types so that it can set the phase.
	 * PeriodicWave equations are from the
	 * [Webkit Web Audio implementation](https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/modules/webaudio/PeriodicWave.cpp&sq=package:chromium).
	 *
	 * @memberOf Oscillator#
	 * @type {string}
	 * @name type
	 * @example
	 * //set it to a square wave
	 * osc.type = "square";
	 * @example
	 * //set the first 6 partials of a sawtooth wave
	 * osc.type = "sawtooth6";
	 */
	/* tslint:enable */
	get type(): ToneOscillatorType {
		return this._type;
	}
	set type(type: ToneOscillatorType) {
		const isBasicType = ["sine", "square", "sawtooth", "triangle"].indexOf(type) !== -1;
		if (this._phase === 0 && isBasicType) {
			this._wave = undefined;
			this._partialCount = 0;
			// just go with the basic approach
			if (this._oscillator !== null) {
				// already tested that it's a basic type
				this._oscillator.type = type as OscillatorType;
			}
		} else {
			const [real, imag] = this._getRealImaginary(type, this._phase);
			const periodicWave = this.context.createPeriodicWave(real, imag);
			this._wave = periodicWave;
			if (this._oscillator !== null) {
				this._oscillator.setPeriodicWave(this._wave);
			}
		}
		this._type = type;
	}

	/**
	 * The oscillator type without the partialsCount appended to the end
	 * @example
	 * osc.type = 'sine2'
	 * osc.baseType //'sine'
	 * osc.partialCount = 2
	 */
	get baseType(): OscillatorType {
		return this._type.replace(this.partialCount, "");
	}
	set baseType(baseType: OscillatorType) {
		if (this.partialCount && this._type !== "custom" && baseType !== "custom") {
			this.type = baseType + this.partialCount;
		} else {
			this.type = baseType;
		}
	}

	/**
	 * 'partialCount' offers an alternative way to set the number of used partials.
	 * When partialCount is 0, the maximum number of partials are used when representing
	 * the waveform using the periodicWave. When 'partials' is set, this value is
	 * not settable, but equals the length of the partials array.
	 * @example
	 * osc.type = 'sine'
	 * osc.partialCount = 3
	 * //is equivalent to
	 * osc.type = 'sine3'
	 */
	get partialCount(): number {
		return this._partialCount;
	}
	set partialCount(p: number) {
		let type = this._type;
		const partial = /^(sine|triangle|square|sawtooth)(\d+)$/.exec(this._type);
		if (partial) {
			type = partial[1];
		}
		if (this._type !== "custom") {
			if (p === 0) {
				this.type = type;
			} else {
				this.type = type + p.toString();
			}
		}
	}

	/**
	 *  Get the object's attributes. Given no arguments get
	 *  will return all available object properties and their corresponding
	 *  values.
	 */
	get(): ToneOscillatorOptions {
		const values = super.get();
		if (values.type !== "custom") {
			delete values.partials;
		}
		return values;
	}

	/**
	 *  Returns the real and imaginary components based
	 *  on the oscillator type.
	 *  @returns [real: Float32Array, imaginary: Float32Array]
	 *  @private
	 */
	private _getRealImaginary(type: ToneOscillatorType, phase: Radians): Float32Array[] {
		const fftSize = 4096;
		let periodicWaveSize = fftSize / 2;

		const real = new Float32Array(periodicWaveSize);
		const imag = new Float32Array(periodicWaveSize);

		let partialCount = 1;
		if (type === "custom") {
			partialCount = this._partials.length + 1;
			this._partialCount = this._partials.length;
			periodicWaveSize = partialCount;
		} else {
			const partial = /^(sine|triangle|square|sawtooth)(\d+)$/.exec(type);
			if (partial) {
				partialCount = parseInt(partial[2], 10) + 1;
				this._partialCount = parseInt(partial[2], 10);
				type = partial[1];
				partialCount = Math.max(partialCount, 2);
				periodicWaveSize = partialCount;
			} else {
				this._partialCount = 0;
			}
			this._partials = [];
		}

		// tslint:disable: no-bitwise
		for (let n = 1; n < periodicWaveSize; ++n) {
			const piFactor = 2 / (n * Math.PI);
			let b;
			switch (type) {
				case "sine":
					b = (n <= partialCount) ? 1 : 0;
					this._partials[n - 1] = b;
					break;
				case "square":
					b = (n & 1) ? 2 * piFactor : 0;
					this._partials[n - 1] = b;
					break;
				case "sawtooth":
					b = piFactor * ((n & 1) ? 1 : -1);
					this._partials[n - 1] = b;
					break;
				case "triangle":
					if (n & 1) {
						b = 2 * (piFactor * piFactor) * ((((n - 1) >> 1) & 1) ? -1 : 1);
					} else {
						b = 0;
					}
					this._partials[n - 1] = b;
					break;
				case "custom":
					b = this._partials[n - 1];
					break;
				default:
					throw new TypeError("Oscillator: invalid type: " + type);
			}
			if (b !== 0) {
				real[n] = -b * Math.sin(phase * n);
				imag[n] = b * Math.cos(phase * n);
			} else {
				real[n] = 0;
				imag[n] = 0;
			}
		}
		return [real, imag];
	}

	/**
	 *  Compute the inverse FFT for a given phase.
	 */
	private _inverseFFT(real: Float32Array, imag: Float32Array, phase: Radians): number {
		let sum = 0;
		const len = real.length;
		for (let i = 0; i < len; i++) {
			sum += real[i] * Math.cos(i * phase) + imag[i] * Math.sin(i * phase);
		}
		return sum;
	}

	/**
	 *  Returns the initial value of the oscillator.
	 */
	protected _getInitialValue(): AudioRange {
		const [real, imag] = this._getRealImaginary(this._type, 0);
		let maxValue = 0;
		const twoPi = Math.PI * 2;
		// check for peaks in 8 places
		for (let i = 0; i < 8; i++) {
			maxValue = Math.max(this._inverseFFT(real, imag, (i / 8) * twoPi), maxValue);
		}
		return -this._inverseFFT(real, imag, this._phase) / maxValue;
	}

	/**
	 * The partials of the waveform. A partial represents
	 * the amplitude at a harmonic. The first harmonic is the
	 * fundamental frequency, the second is the octave and so on
	 * following the harmonic series.
	 * Setting this value will automatically set the type to "custom".
	 * The value is an empty array when the type is not "custom".
	 * @example
	 * osc.partials = [1, 0.2, 0.01];
	 */
	get partials(): number[] {
		return this._partials;
	}
	set partials(partials: number[]) {
		this._partials = partials;
		this.type = "custom";
	}

	/**
	 * The phase of the oscillator in degrees.
	 * @example
	 * osc.phase = 180; //flips the phase of the oscillator
	 */
	get phase(): Degrees {
		return this._phase * (180 / Math.PI);
	}
	set phase(phase: Degrees) {
		this._phase = phase * Math.PI / 180;
		// reset the type
		this.type = this._type;
	}

	/**
	 *  Dispose and disconnect.
	 */
	dispose(): this {
		super.dispose();
		if (this._oscillator !== null) {
			this._oscillator.dispose();
		}
		this._wave = undefined;
		this.frequency.dispose();
		this.detune.dispose();
		return this;
	}
}
