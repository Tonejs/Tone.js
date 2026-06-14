import { getContext } from "../Global.js";
import { Seconds, Ticks } from "../type/Units.js";
import { TimeClass } from "./Time.js";
import { TimeBaseUnit, TimeExpression, TimeValue } from "./TimeBase.js";

/**
 * TransportTime is a time along the Transport's
 * timeline. It is similar to Tone.Time, but instead of evaluating
 * against the AudioContext's clock, it is evaluated against
 * the Transport's position. See [TransportTime wiki](https://github.com/Tonejs/Tone.js/wiki/TransportTime).
 * @category Unit
 */
export class TransportTimeClass<
	Type extends Seconds | Ticks = Seconds,
> extends TimeClass<Type> {
	readonly name: string = "TransportTime";

	/**
	 * Return the current time in whichever context is relevant
	 */
	protected _now(): Type {
		return this.context.transport.seconds as Type;
	}

	protected _getExpressions(): TimeExpression<Type> {
		const expressions = super._getExpressions();
		// Override the quantize ("@") handler so that it returns Transport time
		// instead of AudioContext time.
		expressions.quantize = {
			method: (capture: string): Type => {
				const quantTo = new TimeClass(this.context, capture).valueOf();
				const nextSubdivisionAudioTime =
					this.context.transport.nextSubdivision(quantTo);
				return this._secondsToUnits(
					this.context.transport.getSecondsAtTime(
						nextSubdivisionAudioTime
					)
				);
			},
			regexp: /^@(.+)/,
		};
		return expressions;
	}
}

/**
 * TransportTime is a time along the Transport's
 * timeline. It is similar to Tone.Time, but instead of evaluating
 * against the AudioContext's clock, it is evaluated against
 * the Transport's position. See [TransportTime wiki](https://github.com/Tonejs/Tone.js/wiki/TransportTime).
 * @category Unit
 */
export function TransportTime(
	value?: TimeValue,
	units?: TimeBaseUnit
): TransportTimeClass {
	return new TransportTimeClass(getContext(), value, units);
}
