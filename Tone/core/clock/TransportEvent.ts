import { Seconds, Ticks } from "../type/Units";
import { noOp } from "../util/Interface";

type Transport = import("../clock/Transport").Transport;

export interface TransportEventOptions {
	callback: (time: number) => void;
	once: boolean;
	time: Ticks;
}

/**
 * TransportEvent is an internal class used by [[Transport]]
 * to schedule events. Do no invoke this class directly, it is
 * handled from within Tone.Transport.
 */
export class TransportEvent {

	/**
	 * Reference to the Transport that created it
	 */
	protected transport: Transport;

	/**
	 * The unique id of the event
	 */
	id: number = TransportEvent._eventId++;

	/**
	 * The time the event starts
	 */
	time: Ticks;

	/**
	 * The callback to invoke
	 */
	private callback?: (time: Seconds) => void;

	/**
	 * If the event should be removed after being invoked.
	 */
	private _once: boolean;

	/**
	 * @param transport The transport object which the event belongs to
	 */
	constructor(transport: Transport, opts: Partial<TransportEventOptions>) {

		const options: TransportEventOptions = Object.assign(TransportEvent.getDefaults(), opts);

		this.transport = transport;
		this.callback = options.callback;
		this._once = options.once;
		this.time = options.time;
	}

	static getDefaults(): TransportEventOptions {
		return {
			callback: noOp,
			once: false,
			time: 0,
		};
	}

	/**
	 * Current ID counter
	 */
	private static _eventId = 0;

	/**
	 * Invoke the event callback.
	 * @param  time  The AudioContext time in seconds of the event
	 */
	invoke(time: Seconds): void {
		if (this.callback) {
			this.callback(time);
			if (this._once) {
				this.transport.clear(this.id);
			}
		}
	}

	/**
	 * Clean up
	 */
	dispose(): this {
		this.callback = undefined;
		return this;
	}
}
