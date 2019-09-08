import { connect } from "../core/Connect";
import { Param } from "../core/context/Param";
import { Seconds, Time, Unit, UnitName } from "../core/type/Units";
import { optionsFromArguments } from "../core/util/Defaults";
import { OneShotSource, OneShotSourceOptions } from "../source/OneShotSource";

export interface ToneConstantSourceOptions<Type> extends OneShotSourceOptions {
	convert: boolean;
	offset: Type;
	units: UnitName;
}

/**
 * Wrapper around the native fire-and-forget ConstantSource.
 * Adds the ability to reschedule the stop method.
 * ***[[Oscillator]] is better for most use-cases***
 */
export class ToneConstantSource<Type extends Unit = number> extends OneShotSource<ToneConstantSourceOptions<Type>> {

	readonly name: string = "ToneConstantSource";

	/**
	 *  The signal generator
	 */
	private _source = this.context.createConstantSource();

	/**
	 *  The offset of the signal generator
	 */
	readonly offset: Param<Type>;

	/**
	 * @param  offset   The offset value
	 */
	constructor(offset: Type);
	constructor(options?: Partial<ToneConstantSourceOptions<Type>>);
	constructor() {

		super(optionsFromArguments(ToneConstantSource.getDefaults(), arguments, ["offset"]));
		const options = optionsFromArguments(ToneConstantSource.getDefaults(), arguments, ["offset"]);

		connect(this._source, this._gainNode);

		this.offset = new Param({
			context: this.context,
			convert: options.convert,
			param : this._source.offset,
			units : options.units,
			value : options.offset,
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
	 * Start the source node at the given time
	 * @param  time When to start the source
	 */
	start(time?: Time): this {
		const computedTime = this.toSeconds(time);
		this.log("start", computedTime);
		this._startGain(computedTime);
		this._source.start(computedTime);
		return this;
	}

	protected _stopSource(time?: Seconds): void {
		this._source.stop(time);
	}

	dispose(): this {
		super.dispose();
		if (this.state === "started") {
			this.stop();
		}
		this._source.disconnect();
		this.offset.dispose();
		return this;
	}
}
