import { connect } from "../core/context/ToneAudioNode.js";
import { Param } from "../core/context/Param.js";
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

		const isSuspended =
			!this.context.isOffline && this.context.state !== "running";

		if (!isSuspended) {
			this._source = this.context.createConstantSource();
			connect(this._source, this._gainNode);
		} else {
			this.context.on("statechange", this._contextStarted);
		}

		this.offset = new Param({
			context: this.context,
			convert: options.convert,
			param: isSuspended
				? // placeholder param until the context is started
					this.context.createGain().gain
				: this._source?.offset,
			swappable: isSuspended,
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
	private readonly _contextStarted = (state: AudioContextState) => {
		if (state !== "running") {
			return;
		}
		this._source = this.context.createConstantSource();
		connect(this._source, this._gainNode);
		this.offset.setParam(this._source.offset);
		if (this.state === "started") {
			this._source.start(0);
		}
	};

	/**
	 * Start the source node at the given time
	 * @param  time When to start the source
	 */
	start(time?: Time): this {
		const computedTime = this.toSeconds(time);
		this.log("start", computedTime);
		this._startGain(computedTime);
		this._source?.start(computedTime);
		return this;
	}

	protected _stopSource(time?: Seconds): void {
		if (this.state === "stopped") {
			return;
		}
		this._source?.stop(time);
	}

	dispose(): this {
		super.dispose();
		if (this.state === "started") {
			this.stop();
		}
		this._source?.disconnect();
		this.offset.dispose();
		this.context.off("statechange", this._contextStarted);
		return this;
	}
}
