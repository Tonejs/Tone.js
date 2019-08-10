import { AudioRange, Cents, Degrees, Frequency, Positive, Time } from "../../core/type/Units";
import { optionsFromArguments  } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { isNumber, isString } from "../../core/util/TypeCheck";
import { Signal } from "../../signal/Signal";
import { Source } from "../Source";
import { AMOscillator } from "./AMOscillator";
import { FatOscillator } from "./FatOscillator";
import { FMOscillator } from "./FMOscillator";
import { Oscillator } from "./Oscillator";
import { OmniOscillatorConstructorOptions,
	OmniOscillatorOptions, OmniOscillatorType,
	ToneOscillatorInterface, ToneOscillatorType } from "./OscillatorInterface";
import { PulseOscillator } from "./PulseOscillator";
import { PWMOscillator } from "./PWMOscillator";

/**
 * All of the oscillator types that OmniOscillator can take on
 */
type AnyOscillator = Oscillator | PWMOscillator | PulseOscillator | FatOscillator | AMOscillator | FMOscillator;

/**
 * The constructor of each of the OmniOscillator types
 */
type TypeofAnyOscillator = typeof Oscillator | typeof PWMOscillator |
	typeof PulseOscillator | typeof FatOscillator |
	typeof AMOscillator | typeof FMOscillator;

/**
 * All of the Oscillator constructor types mapped to their name.
 */
interface OmniOscillatorSource {
	"fm": FMOscillator;
	"am": AMOscillator;
	"pwm": PWMOscillator;
	"pulse": PulseOscillator;
	"oscillator": Oscillator;
	"fat": FatOscillator;
}

/**
 * The available oscillator types.
 */
export type OmniOscSourceType = keyof OmniOscillatorSource;

// Conditional Types
type IsAmOrFmOscillator<Osc, Ret> = Osc extends AMOscillator ? Ret : Osc extends FMOscillator ? Ret : undefined;
type IsFatOscillator<Osc, Ret> = Osc extends FatOscillator ? Ret : undefined;
type IsPWMOscillator<Osc, Ret> = Osc extends PWMOscillator ? Ret : undefined;
type IsPulseOscillator<Osc, Ret> = Osc extends PulseOscillator ? Ret : undefined;
type IsFMOscillator<Osc, Ret> = Osc extends FMOscillator ? Ret : undefined;

type AnyOscillatorConstructor = new (...args: any[]) => AnyOscillator;

// tslint:disable-next-line: variable-name
const OmniOscillatorSourceMap: {
	[key in OmniOscSourceType] : AnyOscillatorConstructor
} = {
	am: AMOscillator,
	fat: FatOscillator,
	fm: FMOscillator,
	oscillator: Oscillator,
	pulse: PulseOscillator,
	pwm: PWMOscillator,
};

/**
 * OmniOscillator aggregates Tone.Oscillator, Tone.PulseOscillator,
 * Tone.PWMOscillator, Tone.FMOscillator, Tone.AMOscillator, and Tone.FatOscillator
 * into one class. The oscillator class can be changed by setting the `type`.
 * `omniOsc.type = "pwm"` will set it to the Tone.PWMOscillator. Prefixing
 * any of the basic types ("sine", "square4", etc.) with "fm", "am", or "fat"
 * will use the FMOscillator, AMOscillator or FatOscillator respectively.
 * For example: `omniOsc.type = "fatsawtooth"` will create set the oscillator
 * to a FatOscillator of type "sawtooth".
 *
 * @param frequency The initial frequency of the oscillator.
 * @param type The type of the oscillator.
 * @example
 * var omniOsc = new OmniOscillator("C#4", "pwm");
 */
export class OmniOscillator<OscType extends AnyOscillator>
extends Source<OmniOscillatorConstructorOptions>
implements Omit<ToneOscillatorInterface, "type"> {

	name = "OmniOscillator";

	/**
	 *  The frequency control.
	 */
	readonly frequency: Signal<Frequency>;

	/**
	 *  The detune control.
	 */
	readonly detune: Signal<Cents>;

	/**
	 * The oscillator that can switch types
	 */
	private _oscillator!: AnyOscillator;

	/**
	 *  the type of the oscillator source
	 */
	private _sourceType!: OmniOscSourceType;

	constructor(options?: Partial<OmniOscillatorConstructorOptions>);
	constructor(frequency?: Frequency, type?: OmniOscillatorType);
	constructor() {

		super(optionsFromArguments(OmniOscillator.getDefaults(), arguments, ["frequency", "type"]));
		const options = optionsFromArguments(OmniOscillator.getDefaults(), arguments, ["frequency", "type"]);

		this.frequency = new Signal({
			context: this.context,
			units: "frequency",
			value: options.frequency,
		});
		this.detune = new Signal({
			context: this.context,
			units: "cents",
			value: options.detune,
		});
		readOnly(this, ["frequency", "detune"]);

		// set the options
		this.set(options);
	}

	static getDefaults(): OmniOscillatorOptions {
		return Object.assign(
			Oscillator.getDefaults(),
			FMOscillator.getDefaults(),
			AMOscillator.getDefaults(),
			FatOscillator.getDefaults(),
			PulseOscillator.getDefaults(),
			PWMOscillator.getDefaults(),
		);
	}

	/**
	 *  start the oscillator
	 */
	protected _start(time: Time): void {
		this._oscillator.start(time);
	}

	/**
	 *  start the oscillator
	 */
	protected _stop(time: Time): void {
		this._oscillator.stop(time);
	}

	restart(time?: Time): this {
		this._oscillator.restart(time);
		return this;
	}

	/**
	 * The type of the oscillator. Can be any of the basic types: sine, square, triangle, sawtooth. Or
	 * prefix the basic types with "fm", "am", or "fat" to use the FMOscillator, AMOscillator or FatOscillator
	 * types. The oscillator could also be set to "pwm" or "pulse". All of the parameters of the
	 * oscillator's class are accessible when the oscillator is set to that type, but throws an error
	 * when it's not.
	 * @example
	 * omniOsc.type = "pwm";
	 * //modulationFrequency is parameter which is available
	 * //only when the type is "pwm".
	 * omniOsc.modulationFrequency.value = 0.5;
	 * @example
	 * //an square wave frequency modulated by a sawtooth
	 * omniOsc.type = "fmsquare";
	 * omniOsc.modulationType = "sawtooth";
	 */
	get type(): OmniOscillatorType {
		let prefix = "";
		if (["am", "fm", "fat"].some(p => this._sourceType === p)) {
			prefix = this._sourceType;
		}
		return prefix + this._oscillator.type as OmniOscillatorType;
	}
	set type(type) {
		if (type.substr(0, 2) === "fm") {
			this._createNewOscillator("fm");
			this._oscillator = this._oscillator as FMOscillator;
			this._oscillator.type = type.substr(2) as ToneOscillatorType;
		} else if (type.substr(0, 2) === "am") {
			this._createNewOscillator("am");
			this._oscillator = this._oscillator as AMOscillator;
			this._oscillator.type = type.substr(2)  as ToneOscillatorType;
		} else if (type.substr(0, 3) === "fat") {
			this._createNewOscillator("fat");
			this._oscillator = this._oscillator as FatOscillator;
			this._oscillator.type = type.substr(3)  as ToneOscillatorType;
		} else if (type === "pwm") {
			this._createNewOscillator("pwm");
			this._oscillator = this._oscillator as PWMOscillator;
		} else if (type === "pulse") {
			this._createNewOscillator("pulse");
		} else {
			this._createNewOscillator("oscillator");
			this._oscillator = this._oscillator as Oscillator;
			this._oscillator.type = (type as ToneOscillatorType);
		}
	}

	/**
	 * The partials of the waveform. A partial represents
	 * the amplitude at a harmonic. The first harmonic is the
	 * fundamental frequency, the second is the octave and so on
	 * following the harmonic series.
	 * Setting this value will automatically set the type to "custom".
	 * The value is an empty array when the type is not "custom".
	 * This is not available on "pwm" and "pulse" oscillator types.
	 * @example
	 * osc.partials = [1, 0.2, 0.01];
	 */
	get partials(): number[] {
		return this._oscillator.partials;
	}
	set partials(partials) {
		if (!this._getOscType(this._oscillator, "pulse") && !this._getOscType(this._oscillator, "pwm")) {
			this._oscillator.partials = partials;
		}
	}

	/**
	 * The partial count of the oscillator. This is not available on "pwm" and "pulse" oscillator types.
	 * @example
	 * //set the maximum number of partials
	 * osc.partialCount = 0;
	 */
	get partialCount(): number {
		return this._oscillator.partialCount;
	}
	set partialCount(partialCount) {
		if (!this._getOscType(this._oscillator, "pulse") && !this._getOscType(this._oscillator, "pwm")) {
			this._oscillator.partialCount = partialCount;
		}
	}

	/**
	 * Set the parameters at once. Either pass in an
	 * object mapping parameters to values, or to set a
	 * single parameter, by passing in a string and value.
	 * The last argument is an optional ramp time which
	 * will ramp any signal values to their destination value
	 * over the duration of the rampTime.
	 * @param  params
	 * @example
	 * //set values using an object
	 * filter.set({
	 * 	"frequency" : 300,
	 * 	"type" : "highpass"
	 * });
	 */
	set(props: Partial<OmniOscillatorConstructorOptions>): this {
		// make sure the type is set first
		if (Reflect.has(props, "type") && props.type) {
			this.type = props.type;
			// delete props.type;
		}
		// then set the rest
		super.set(props);
		return this;
	}

	get(): OmniOscillatorConstructorOptions {
		const options = this._oscillator.get();
		// @ts-ignore
		options.type = this.type;
		return options as OmniOscillatorOptions;
	}

	/**
	 *  connect the oscillator to the frequency and detune signals
	 */
	private _createNewOscillator(oscType: OmniOscSourceType): void {
		if (oscType !== this._sourceType) {
			this._sourceType = oscType;
			// tslint:disable-next-line: variable-name
			const OscConstructor = OmniOscillatorSourceMap[oscType];
			// short delay to avoid clicks on the change
			const now = this.now();
			if (this._oscillator) {
				const oldOsc = this._oscillator;
				oldOsc.stop(now);
				// dispose the old one
				this.context.setTimeout(() => oldOsc.dispose(), this.blockTime);
			}
			this._oscillator = new OscConstructor({
				context : this.context,
			});
			this.frequency.connect(this._oscillator.frequency);
			this.detune.connect(this._oscillator.detune);
			this._oscillator.connect(this.output);
			this._oscillator.onstop = () => this.onstop(this);
			if (this.state === "started") {
				this._oscillator.start(now);
			}
		}
	}

	/**
	 * The phase of the oscillator in degrees.
	 */
	get phase(): Degrees {
		return this._oscillator.phase;
	}
	set phase(phase) {
		this._oscillator.phase = phase;
	}

	/**
	 * The source type of the oscillator.
	 * @example
	 * var omniOsc = new OmniOscillator(440, "fmsquare");
	 * omniOsc.sourceType // 'fm'
	 */
	get sourceType(): OmniOscSourceType {
		return this._sourceType;
	}
	set sourceType(sType) {
		// the basetype defaults to sine
		let baseType = "sine";
		if (this._oscillator.type !== "pwm" && this._oscillator.type !== "pulse") {
			baseType = this._oscillator.type;
		}

		// set the type
		if (sType === "fm") {
			this.type = "fm" + baseType as OmniOscillatorType;
		} else if (sType === "am") {
			this.type = "am" + baseType as OmniOscillatorType;
		} else if (sType === "fat") {
			this.type = "fat" + baseType as OmniOscillatorType;
		} else if (sType === "oscillator") {
			this.type = baseType as OmniOscillatorType;
		} else if (sType === "pulse") {
			this.type = "pulse";
		} else if (sType === "pwm") {
			this.type = "pwm";
		}
	}

	private _getOscType<SourceType extends OmniOscSourceType>(
		osc: AnyOscillator,
		sourceType: SourceType,
	): osc is OmniOscillatorSource[SourceType] {
		return osc instanceof OmniOscillatorSourceMap[sourceType];
	}

	/**
	 * The base type of the oscillator.
	 * @example
	 * var omniOsc = new OmniOscillator(440, "fmsquare4");
	 * omniOsc.sourceType // 'fm'
	 * omniOsc.baseType //'square'
	 * omniOsc.partialCount //4
	 */
	get baseType(): OscillatorType | "pwm" | "pulse" {
		return this._oscillator.baseType;
	}
	set baseType(baseType) {
		if (!this._getOscType(this._oscillator, "pulse") &&
			!this._getOscType(this._oscillator, "pwm") &&
			baseType !== "pulse" && baseType !== "pwm") {
			this._oscillator.baseType = baseType;
		}
	}

	/**
	 * The width of the oscillator when sourceType === "pulse".
	 * @example
	 * var omniOsc = new OmniOscillator(440, "pulse");
	 * //can access the width attribute only if type === "pulse"
	 * omniOsc.width.value = 0.2;
	 */
	get width(): IsPulseOscillator<OscType, Signal<AudioRange>> {
		if (this._getOscType(this._oscillator, "pulse")) {
			return this._oscillator.width as IsPulseOscillator<OscType, Signal<AudioRange>> ;
		} else {
			return undefined as IsPulseOscillator<OscType, Signal<AudioRange>> ;
		}
	}

	/**
	 * The number of detuned oscillators, when sourceType === "fat".
	 */
	get count(): IsFatOscillator<OscType, number> {
		if (this._getOscType(this._oscillator, "fat")) {
			return this._oscillator.count as IsFatOscillator<OscType, number>;
		} else {
			return undefined as IsFatOscillator<OscType, number>;
		}
	}
	set count(count) {
		if (this._getOscType(this._oscillator, "fat") && isNumber(count)) {
			this._oscillator.count = count;
		}
	}

	/**
	 * The detune spread between the oscillators. If "count" is
	 * set to 3 oscillators and the "spread" is set to 40,
	 * the three oscillators would be detuned like this: [-20, 0, 20]
	 * for a total detune spread of 40 cents. See Tone.FatOscillator
	 * for more info.
	 */
	get spread(): IsFatOscillator<OscType, Cents> {
		if (this._getOscType(this._oscillator, "fat")) {
			return this._oscillator.spread as IsFatOscillator<OscType, Cents>;
		} else {
			return undefined as IsFatOscillator<OscType, Cents>;
		}
	}
	set spread(spread) {
		if (this._getOscType(this._oscillator, "fat") && isNumber(spread)) {
			this._oscillator.spread = spread;
		}
	}

	/**
	 * The type of the modulator oscillator. Only if the oscillator
	 * is set to "am" or "fm" types. see. Tone.AMOscillator or Tone.FMOscillator
	 * for more info.
	 */
	get modulationType(): IsAmOrFmOscillator<OscType, ToneOscillatorType> {
		if (this._getOscType(this._oscillator, "fm") || this._getOscType(this._oscillator, "am")) {
			return this._oscillator.modulationType as IsAmOrFmOscillator<OscType, ToneOscillatorType>;
		} else {
			return undefined as IsAmOrFmOscillator<OscType, ToneOscillatorType>;
		}
	}
	set modulationType(mType) {
		if ((this._getOscType(this._oscillator, "fm") || this._getOscType(this._oscillator, "am")) && isString(mType)) {
			this._oscillator.modulationType = mType;
		}
	}

	/**
	 * The modulation index which is in essence the depth or amount of the modulation. In other terms it is the
	 * ratio of the frequency of the modulating signal (mf) to the amplitude of the
	 * modulating signal (ma) -- as in ma/mf.
	 * See Tone.FMOscillator for more info.
	 */
	get modulationIndex(): IsFMOscillator<OscType, Signal<Positive>> {
		if (this._getOscType(this._oscillator, "fm")) {
			return this._oscillator.modulationIndex as IsFMOscillator<OscType, Signal<Positive>>;
		} else {
			return undefined as IsFMOscillator<OscType, Signal<Positive>>;
		}
	}

	/**
	 *  Harmonicity is the frequency ratio between the carrier and the modulator oscillators.
	 *  A harmonicity of 1 gives both oscillators the same frequency.
	 *  Harmonicity = 2 means a change of an octave. See Tone.AMOscillator or Tone.FMOscillator
	 *  for more info.
	 */
	get harmonicity(): IsAmOrFmOscillator<OscType, Signal<Positive>> {
		if (this._getOscType(this._oscillator, "fm") || this._getOscType(this._oscillator, "am")) {
			return this._oscillator.harmonicity as IsAmOrFmOscillator<OscType, Signal<Positive>>;
		} else {
			return undefined as IsAmOrFmOscillator<OscType, Signal<Positive>>;
		}
	}

	/**
	 * The modulationFrequency Signal of the oscillator
	 * (only if the oscillator type is set to pwm). See
	 * Tone.PWMOscillator for more info.
	 * @example
	 * var omniOsc = new OmniOscillator(440, "pwm");
	 * //can access the modulationFrequency attribute only if type === "pwm"
	 * omniOsc.modulationFrequency.value = 0.2;
	 */
	get modulationFrequency(): IsPWMOscillator<OscType, Signal<Frequency>> {
		if (this._getOscType(this._oscillator, "pwm")) {
			return this._oscillator.modulationFrequency as IsPWMOscillator<OscType, Signal<Frequency>>;
		} else {
			return undefined as IsPWMOscillator<OscType, Signal<Frequency>>;
		}
	}

	dispose(): this {
		super.dispose();
		this.detune.dispose();
		this.frequency.dispose();
		this._oscillator.dispose();
		return this;
	}
}
