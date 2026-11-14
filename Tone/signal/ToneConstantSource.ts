import { Param } from "../core/context/Param.js";
import { connect } from "../core/context/ToneAudioNode.js";
import { Seconds, Time, UnitMap, UnitName } from "../core/type/Units.js";
import { optionsFromArguments } from "../core/util/Defaults.js";
import {
	OneShotSource,
	OneShotSourceOptions,
} from "../source/OneShotSource.js";

export interface ToneConstantSourceOptions<TypeName extends UnitName>
	extends OneShotSourceOptions {
	convert: boolean;
	offset: UnitMap[TypeName];
	units: TypeName;
	minValue?: number;
	maxValue?: number;
}

/**
 * Wrapper around the native fire-and-forget ConstantSource.
 * Adds the ability to reschedule the stop method.
 * @category Signal
 */
export class ToneConstantSource<
	TypeName extends UnitName = "number",
> extends OneShotSource<ToneConstantSourceOptions<TypeName>> {
	readonly name: string = "ToneConstantSource";

	/**
	 * The signal generator
	 */
	private _source?: ConstantSourceNode;

	/**
	 * Whether the native source was started, so it can be stopped
	 */
	private _sourceStarted = false;

	/**
	 * The offset of the signal generator
	 */
	readonly offset: Param<TypeName>;

	/**
	 * @param  offset   The offset value
	 */
	constructor(offset: UnitMap[TypeName]);
	constructor(options?: Partial<ToneConstantSourceOptions<TypeName>>);
	constructor() {
		const options = optionsFromArguments(
			ToneConstantSource.getDefaults(),
			arguments,
			["offset"]
		);
		super(options);

		this._onContextRunning(() => this._contextStarted());

		this.offset = new Param({
			context: this.context,
			convert: options.convert,
			param: !this._source
				? // placeholder param until the context is started
					this.context.createGain().gain
				: this._source.offset,
			swappable: !this._source,
			units: options.units,
			value: options.offset,
			minValue: options.minValue,
			maxValue: options.maxValue,
		});
	}

	static getDefaults(): ToneConstantSourceOptions<any> {
		return Object.assign(OneShotSource.getDefaults(), {
			convert: true,
			offset: 1,
			units: "number" as UnitName,
		});
	}

	/**
	 * Once the context is started, kick off source.
	 */
	private _contextStarted() {
		this._source = this.context.createConstantSource();
		connect(this._source, this._gainNode);
		this.offset?.setParam(this._source.offset);
		const isStarted = this._startTime !== -1;
		const isStoppedBeforeStart =
			this._stopTime !== -1 && this._stopTime < this._startTime;
		if (isStarted && !isStoppedBeforeStart) {
			this._source.start(this._startTime);
			this._sourceStarted = true;
		}
	}

	/**
	 * Start the source node at the given time
	 * @param  time When to start the source
	 */
	start(time?: Time): this {
		const computedTime = this.toSeconds(time);
		this.log("start", computedTime);
		this._startGain(computedTime);
		if (this._source) {
			this._source.start(computedTime);
			this._sourceStarted = true;
		}
		return this;
	}

	protected _stopSource(time?: Seconds): void {
		// state is already "stopped" here: OneShotSource defers this call
		// until after _stopTime, so check the native node instead
		if (this._sourceStarted) {
			this._source?.stop(time);
		}
	}

	dispose(): this {
		super.dispose();
		if (this.state === "started") {
			this.stop();
		}
		this._source?.disconnect();
		this.offset.dispose();
		return this;
	}
}
