import { Context } from "../context/Context";
import { getContext } from "../Global";
import { TimeClass } from "./Time";
import { TypeBaseUnits } from "./TypeBase";

/**
 * TransportTime is a the time along the Transport's
 * timeline. It is similar to Tone.Time, but instead of evaluating
 * against the AudioContext's clock, it is evaluated against
 * the Transport's position. See [TransportTime wiki](https://github.com/Tonejs/Tone.js/wiki/TransportTime).
 */
export class TransportTimeClass<Type extends Seconds | Ticks = Seconds> extends TimeClass<Type> {

	name = "TransportTime";

	/**
	 * Return the current time in whichever context is relevant
	 */
	protected _now(): Type {
		return this.context.transport.seconds as Type;
	}
}

export function TransportTime(value: Time, units?: TypeBaseUnits): TransportTimeClass {
	return new TransportTimeClass(getContext(), value, units);
}
