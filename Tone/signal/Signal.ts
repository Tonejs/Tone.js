import { AbstractParam } from "../core/context/AbstractParam";
import { Param } from "../core/context/Param";
import { InputNode, OutputNode, ToneAudioNode, ToneAudioNodeOptions } from "../core/context/ToneAudioNode";
import { optionsFromArguments } from "../core/util/Defaults";

export interface SignalOptions<Type> extends ToneAudioNodeOptions {
	value: Type;
	units: UnitName;
	convert: boolean;
}

/**
 * A signal is an audio-rate value. Tone.Signal is a core component of the library.
 * Unlike a number, Signals can be scheduled with sample-level accuracy. Tone.Signal
 * has all of the methods available to native Web Audio
 * [AudioParam](http://webaudio.github.io/web-audio-api/#the-audioparam-interface)
 * as well as additional conveniences. Read more about working with signals
 * [here](https://github.com/Tonejs/Tone.js/wiki/Signals).
 *  @param value Initial value of the signal
 *  @param units unit The units the signal is in.
 * @example
 * const signal = new Tone.Signal(10);
 */
export class Signal<Type extends Unit = number> extends ToneAudioNode<SignalOptions<any>>
implements AbstractParam<Type> {

	name = "Signal";

	/**
	 * Indicates if the value should be overridden on connection.
	 */
	readonly override: boolean = true;

	/**
	 * The constant source node which generates the signal
	 */
	private _constantSource: ConstantSourceNode = this.context.createConstantSource();
	readonly output: OutputNode = this._constantSource;
	protected _param: Param<Type>;
	readonly input: InputNode;
	protected _internalChannels = [this._constantSource];

	constructor(value?: Type, units?: UnitName);
	constructor(options?: Partial<SignalOptions<Type>>);
	constructor() {

		super(optionsFromArguments(Signal.getDefaults(), arguments, ["value", "units"]));

		const options = optionsFromArguments(Signal.getDefaults(), arguments, ["value", "units"]) as SignalOptions<Type>;

		this._constantSource.start(0);
		this.input = this._param = new Param({
			context: this.context,
			convert: options.convert,
			param: this._constantSource.offset,
			units: options.units,
			value: options.value,
		});
	}

	static getDefaults(): SignalOptions<any> {
		return Object.assign(ToneAudioNode.getDefaults(), {
			channelCount: 1,
			channelCountMode: "explicit",
			channelInterpretation: "discrete",
			convert: true,
			numberOfInputs: 1,
			numberOfOutputs: 1,
			units: "number" as UnitName,
			value: 0,
		}) as SignalOptions<any>;
	}

	connect(destination: InputNode, outputNum = 0, inputNum = 0): this {
		if (destination instanceof Param || destination instanceof AudioParam ||
			(destination instanceof Signal && destination.override)) {
			// cancel changes
			destination.cancelScheduledValues(0);
			// reset the value
			destination.setValueAtTime(0, 0);
			// mark the value as overridden
			if (destination instanceof Signal) {
				destination.overridden = true;
			}
		}
		super.connect(destination, outputNum, inputNum);
		return this;
	}

	///////////////////////////////////////////////////////////////////////////
	// ABSTRACT PARAM INTERFACE
	// just a proxy for the ConstantSourceNode's offset AudioParam
	// all docs are generated from AbstractParam.ts
	///////////////////////////////////////////////////////////////////////////

	setValueAtTime(value: Type, time: Time): this {
		this._param.setValueAtTime(value, time);
		return this;
	}
	getValueAtTime(time: Time): Type {
		return this._param.getValueAtTime(time);
	}
	setRampPoint(time: Time): this {
		this._param.setRampPoint(time);
		return this;
	}
	linearRampToValueAtTime(value: Type, time: Time): this {
		this._param.linearRampToValueAtTime(value, time);
		return this;
	}
	exponentialRampToValueAtTime(value: Type, time: Time): this {
		this._param.exponentialRampToValueAtTime(value, time);
		return this;
	}
	exponentialRampTo(value: Type, rampTime: Time, startTime?: Time): this {
		this._param.exponentialRampTo(value, rampTime, startTime);
		return this;
	}
	linearRampTo(value: Type, rampTime: Time, startTime?: Time): this {
		this._param.linearRampTo(value, rampTime, startTime);
		return this;
	}
	targetRampTo(value: Type, rampTime: Time, startTime?: Time): this {
		this._param.targetRampTo(value, rampTime, startTime);
		return this;
	}
	exponentialApproachValueAtTime(value: Type, time: Time, rampTime: Time): this {
		this._param.exponentialApproachValueAtTime(value, time, rampTime);
		return this;
	}
	setTargetAtTime(value: Type, startTime: Time, timeConstant: number): this {
		this._param.setTargetAtTime(value, startTime, timeConstant);
		return this;
	}
	setValueCurveAtTime(values: Type[], startTime: Time, duration: Time, scaling?: number): this {
		this._param.setValueCurveAtTime(values, startTime, duration, scaling);
		return this;
	}
	cancelScheduledValues(time: Time): this {
		this._param.cancelScheduledValues(time);
		return this;
	}
	cancelAndHoldAtTime(time: Time): this {
		this._param.cancelAndHoldAtTime(time);
		return this;
	}
	rampTo(value: Type, rampTime: Time, startTime?: Time): this {
		this._param.rampTo(value, rampTime, startTime);
		return this;
	}

	get value(): Type {
		return this._param.value;
	}
	set value(value: Type) {
		this._param.value = value;
	}

	get convert(): boolean {
		return this._param.convert;
	}
	set convert(convert: boolean) {
		this._param.convert = convert;
	}

	get units(): UnitName {
		return this._param.units;
	}

	get overridden(): boolean {
		return this._param.overridden;
	}
	set overridden(overridden: boolean) {
		this._param.overridden = overridden;
	}

	get maxValue(): number {
		return this._param.maxValue;
	}
	get minValue(): number {
		return this._param.minValue;
	}
}
