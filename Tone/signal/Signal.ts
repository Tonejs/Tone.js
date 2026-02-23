import { AbstractParam } from "../core/context/AbstractParam.js";
import { Param } from "../core/context/Param.js";
import {
	disconnect,
	InputNode,
	OutputNode,
	ToneAudioNode,
	ToneAudioNodeOptions,
} from "../core/context/ToneAudioNode.js";
import { connect } from "../core/context/ToneAudioNode.js";
import { Time, UnitMap, UnitName } from "../core/type/Units.js";
import { isAudioParam } from "../core/util/AdvancedTypeCheck.js";
import { optionsFromArguments } from "../core/util/Defaults.js";
import { isUndef } from "../core/util/TypeCheck.js";
import { ToneConstantSource } from "./ToneConstantSource.js";

export interface SignalOptions<TypeName extends UnitName>
	extends ToneAudioNodeOptions {
	value: UnitMap[TypeName];
	units: TypeName;
	convert: boolean;
	minValue?: number;
	maxValue?: number;
}

/**
 * A signal is an audio-rate value. Tone.Signal is a core component of the library.
 * Unlike a number, Signals can be scheduled with sample-level accuracy. Tone.Signal
 * has all of the methods available to native Web Audio
 * [AudioParam](http://webaudio.github.io/web-audio-api/#the-audioparam-interface)
 * as well as additional conveniences. Read more about working with signals
 * [here](https://github.com/Tonejs/Tone.js/wiki/Signals).
 *
 * @example
 * const osc = new Tone.Oscillator().toDestination().start();
 * // a schedulable signal which can be connected to control an AudioParam or another Signal
 * const signal = new Tone.Signal({
 * 	value: "C4",
 * 	units: "frequency"
 * }).connect(osc.frequency);
 * // the scheduled ramp controls the connected signal
 * signal.rampTo("C2", 4, "+0.5");
 * @category Signal
 */
export class Signal<TypeName extends UnitName = "number">
	extends ToneAudioNode<SignalOptions<any>>
	implements AbstractParam<TypeName>
{
	readonly name: string = "Signal";

	/**
	 * Indicates if the value should be overridden on connection.
	 */
	readonly override: boolean = true;

	/**
	 * The constant source node which generates the signal
	 */
	protected _constantSource: ToneConstantSource<TypeName>;
	readonly output: OutputNode;
	protected _param: Param<TypeName>;
	readonly input: InputNode;

	/**
	 * @param value Initial value of the signal
	 * @param units The unit name, e.g. "frequency"
	 */
	constructor(value?: UnitMap[TypeName], units?: TypeName);
	constructor(options?: Partial<SignalOptions<TypeName>>);
	constructor() {
		const options = optionsFromArguments(Signal.getDefaults(), arguments, [
			"value",
			"units",
		]) as SignalOptions<TypeName>;
		super(options);

		this.output = this._constantSource = new ToneConstantSource({
			context: this.context,
			convert: options.convert,
			offset: options.value,
			units: options.units,
			minValue: options.minValue,
			maxValue: options.maxValue,
		});
		this._constantSource.start(0);
		this.input = this._param = this._constantSource.offset;
	}
	/** @inheritdoc */
	static getDefaults(): SignalOptions<any> {
		return Object.assign(ToneAudioNode.getDefaults(), {
			convert: true,
			units: "number" as UnitName,
			value: 0,
		});
	}
	/** @inheritdoc */
	connect(destination: InputNode, outputNum = 0, inputNum = 0): this {
		// start it only when connected to something
		connectSignal(this, destination, outputNum, inputNum);
		return this;
	}
	/** @inheritdoc */
	disconnect(
		destination?: InputNode,
		outputNum?: number,
		inputNum?: number
	): this {
		// disconnect the signal
		disconnectSignal(this, destination, outputNum, inputNum);
		return this;
	}
	/** @inheritdoc */
	dispose(): this {
		super.dispose();
		this._param.dispose();
		this._constantSource.dispose();
		return this;
	}

	//-------------------------------------
	// ABSTRACT PARAM INTERFACE
	// just a proxy for the ConstantSourceNode's offset AudioParam
	// all docs are generated from AbstractParam.ts
	//-------------------------------------

	/** @inheritdoc */
	setValueAtTime(value: UnitMap[TypeName], time: Time): this {
		this._param.setValueAtTime(value, time);
		return this;
	}
	/** @inheritdoc */
	getValueAtTime(time: Time): UnitMap[TypeName] {
		return this._param.getValueAtTime(time);
	}
	/** @inheritdoc */
	setRampPoint(time: Time): this {
		this._param.setRampPoint(time);
		return this;
	}
	/** @inheritdoc */
	linearRampToValueAtTime(value: UnitMap[TypeName], time: Time): this {
		this._param.linearRampToValueAtTime(value, time);
		return this;
	}
	/** @inheritdoc */
	exponentialRampToValueAtTime(value: UnitMap[TypeName], time: Time): this {
		this._param.exponentialRampToValueAtTime(value, time);
		return this;
	}
	/** @inheritdoc */
	exponentialRampTo(
		value: UnitMap[TypeName],
		rampTime: Time,
		startTime?: Time
	): this {
		this._param.exponentialRampTo(value, rampTime, startTime);
		return this;
	}
	/** @inheritdoc */
	linearRampTo(
		value: UnitMap[TypeName],
		rampTime: Time,
		startTime?: Time
	): this {
		this._param.linearRampTo(value, rampTime, startTime);
		return this;
	}
	/** @inheritdoc */
	targetRampTo(
		value: UnitMap[TypeName],
		rampTime: Time,
		startTime?: Time
	): this {
		this._param.targetRampTo(value, rampTime, startTime);
		return this;
	}
	/** @inheritdoc */
	exponentialApproachValueAtTime(
		value: UnitMap[TypeName],
		time: Time,
		rampTime: Time
	): this {
		this._param.exponentialApproachValueAtTime(value, time, rampTime);
		return this;
	}
	/** @inheritdoc */
	setTargetAtTime(
		value: UnitMap[TypeName],
		startTime: Time,
		timeConstant: number
	): this {
		this._param.setTargetAtTime(value, startTime, timeConstant);
		return this;
	}
	/** @inheritdoc */
	setValueCurveAtTime(
		values: UnitMap[TypeName][],
		startTime: Time,
		duration: Time,
		scaling?: number
	): this {
		this._param.setValueCurveAtTime(values, startTime, duration, scaling);
		return this;
	}
	/** @inheritdoc */
	cancelScheduledValues(time: Time): this {
		this._param.cancelScheduledValues(time);
		return this;
	}
	/** @inheritdoc */
	cancelAndHoldAtTime(time: Time): this {
		this._param.cancelAndHoldAtTime(time);
		return this;
	}
	/** @inheritdoc */
	rampTo(value: UnitMap[TypeName], rampTime: Time, startTime?: Time): this {
		this._param.rampTo(value, rampTime, startTime);
		return this;
	}
	/** @inheritdoc */
	get value(): UnitMap[TypeName] {
		return this._param.value;
	}
	set value(value: UnitMap[TypeName]) {
		this._param.value = value;
	}
	/** @inheritdoc */
	get convert(): boolean {
		return this._param.convert;
	}
	set convert(convert: boolean) {
		this._param.convert = convert;
	}
	/** @inheritdoc */
	get units(): UnitName {
		return this._param.units;
	}
	/** @inheritdoc */
	get overridden(): boolean {
		return this._param.overridden;
	}
	set overridden(overridden: boolean) {
		this._param.overridden = overridden;
	}
	/** @inheritdoc */
	get maxValue(): number {
		return this._param.maxValue;
	}
	get minValue(): number {
		return this._param.minValue;
	}

	/**
	 * @see {@link Param.apply}.
	 */
	apply(param: Param | AudioParam): this {
		this._param.apply(param);
		return this;
	}
}

/**
 * Keep track of connected signals so they can be disconnected and restored to their previous value
 */
const connectedSignals = new WeakMap<
	OutputNode,
	Array<{
		destination: Param | AudioParam | Signal;
		outputNum: number;
		inputNum: number;
		/**
		 * The value before overriding
		 */
		previousValue: number;
	}>
>();

/**
 * When connecting from a signal, it's necessary to zero out the node destination
 * node if that node is also a signal. If the destination is not 0, then the values
 * will be summed. This method insures that the output of the destination signal will
 * be the same as the source signal, making the destination signal a pass through node.
 * @param signal The output signal to connect from
 * @param destination the destination to connect to
 * @param outputNum the optional output number
 * @param inputNum the input number
 */
export function connectSignal(
	signal: OutputNode,
	destination: InputNode,
	outputNum?: number,
	inputNum?: number
): void {
	if (
		destination instanceof Param ||
		isAudioParam(destination) ||
		(destination instanceof Signal && destination.override)
	) {
		const previousValue = destination.value;
		// cancel changes
		destination.cancelScheduledValues(0);
		// reset the value
		destination.setValueAtTime(0, 0);
		// mark the value as overridden
		if (destination instanceof Signal || destination instanceof Param) {
			destination.overridden = true;
		}
		// store the connection
		if (!connectedSignals.has(signal)) {
			connectedSignals.set(signal, []);
		}
		connectedSignals.get(signal)?.push({
			destination,
			outputNum: outputNum || 0,
			inputNum: inputNum || 0,
			previousValue,
		});
	}
	connect(signal, destination, outputNum, inputNum);
}

/**
 * Disconnect a signal connection and restore the value of the destination if
 * it was a signal that was overridden by the connection.
 * @param signal
 * @param destination
 * @param outputNum
 * @param inputNum
 */
export function disconnectSignal(
	signal: OutputNode,
	destination?: InputNode,
	outputNum?: number,
	inputNum?: number
): void {
	if (
		destination instanceof Param ||
		isAudioParam(destination) ||
		(destination instanceof Signal && destination.override) ||
		destination === undefined
	) {
		if (connectedSignals.has(signal)) {
			let connections = connectedSignals.get(signal)!;

			if (destination) {
				connections = connections.filter((conn) => {
					return (
						conn.destination === destination &&
						(isUndef(outputNum) || conn.outputNum === outputNum) &&
						(isUndef(inputNum) || conn.inputNum === inputNum)
					);
				});
			}

			if (!connections.length) {
				throw new Error("Not connected to destination node");
			}

			// restore the value
			connections.forEach((connection) => {
				if (
					connection.destination instanceof Signal ||
					connection.destination instanceof Param
				) {
					connection.destination.overridden = false;
				}
				connection.destination.setValueAtTime(
					connection.previousValue,
					0
				);
			});
			// remove the connection from the stored array
			connectedSignals.set(
				signal,
				connectedSignals
					.get(signal)!
					.filter((conn) => !connections.includes(conn))
			);
		}
	}
	disconnect(signal, destination, outputNum, inputNum);
}
