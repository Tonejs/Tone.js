import { Context } from "../context/Context";
import { TransportTimeClass } from "./TransportTime";
import { TypeBaseUnits } from "./TypeBase";

/**
 * Ticks is a primitive type for encoding Time values.
 * Ticks can be constructed with or without the `new` keyword. Ticks can be passed
 * into the parameter of any method which takes time as an argument.
 * @example
 * const t = Ticks("4n"); //a quarter note as ticks
 */
export class TicksClass extends TransportTimeClass<Ticks> {

	name = "Ticks";

	readonly defaultUnits: TypeBaseUnits = "i";

	/**
	 * Get the current time in the given units
	 */
	protected _now(): Ticks {
		if (this.context.transport) {
			return this.context.transport.ticks;
		} else {
			return 0;
		}
	}

	/**
	 *  Return the value of the beats in the current units
	 */
	protected _beatsToUnits(beats: number): Ticks {
		return this._getPPQ() * beats;
	}

	/**
	 *  Returns the value of a second in the current units
	 */
	protected _secondsToUnits(seconds: Seconds): Ticks {
		return Math.floor(seconds / (60 / this._getBpm()) * this._getPPQ());
	}

	/**
	 *  Returns the value of a tick in the current time units
	 */
	protected _ticksToUnits(ticks: Ticks): Ticks {
		return ticks;
	}

	/**
	 *  Return the time in ticks
	 */
	toTicks(): Ticks {
		return this.valueOf() as Ticks;
	}

	/**
	 *  Return the time in seconds
	 */
	toSeconds(): Seconds {
		return (this.valueOf() / this._getPPQ()) * (60 / this._getBpm());
	}
}

export function Ticks(value: Time, units?: TypeBaseUnits): TicksClass {
	return new TicksClass(Context.getGlobal(), value, units);
}
