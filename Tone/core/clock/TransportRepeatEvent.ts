import { BaseContext } from "../context/BaseContext";
import { TicksClass } from "../type/Ticks";
import { Seconds, Ticks, Time } from "../type/Units";
import { TransportEvent, TransportEventOptions } from "./TransportEvent";

type Transport = import("../clock/Transport").Transport;

interface TransportRepeatEventOptions extends TransportEventOptions {
	interval: Ticks;
	duration: Ticks;
}

/**
 * TransportRepeatEvent is an internal class used by Tone.Transport
 * to schedule repeat events. This class should not be instantiated directly.
 */
export class TransportRepeatEvent extends TransportEvent {

	/**
	 * When the event should stop repeating
	 */
	private duration: Ticks;

	/**
	 * The interval of the repeated event
	 */
	private _interval: Ticks;

	/**
	 * The ID of the current timeline event
	 */
	private _currentId = -1;

	/**
	 * The ID of the next timeline event
	 */
	private _nextId = -1;

	/**
	 * The time of the next event
	 */
	private _nextTick = this.time;

	/**
	 * a reference to the bound start method
	 */
	private _boundRestart = this._restart.bind(this);

	/**
	 * The audio context belonging to this event
	 */
	protected context: BaseContext;

	/**
	 * @param transport The transport object which the event belongs to
	 */
	constructor(transport: Transport, opts: Partial<TransportRepeatEventOptions>) {

		super(transport, opts);

		const options = Object.assign(TransportRepeatEvent.getDefaults(), opts);

		this.duration = new TicksClass(transport.context, options.duration).valueOf();
		this._interval = new TicksClass(transport.context, options.interval).valueOf();
		this._nextTick = options.time;
		this.transport.on("start", this._boundRestart);
		this.transport.on("loopStart", this._boundRestart);
		this.context = this.transport.context;
		this._restart();
	}

	static getDefaults(): TransportRepeatEventOptions {
		return Object.assign({}, TransportEvent.getDefaults(), {
			duration: Infinity,
			interval: 1,
			once: false,
		});
	}

	/**
	 * Invoke the callback. Returns the tick time which
	 * the next event should be scheduled at.
	 * @param  time  The AudioContext time in seconds of the event
	 */
	invoke(time: Seconds): void {
		// create more events if necessary
		this._createEvents(time);
		// call the super class
		super.invoke(time);
	}

	/**
	 * Push more events onto the timeline to keep up with the position of the timeline
	 */
	private _createEvents(time: Seconds): void {
		// schedule the next event
		const ticks = this.transport.getTicksAtTime(time);
		if (ticks >= this.time && ticks >= this._nextTick && this._nextTick + this._interval < this.time + this.duration) {
			this._nextTick += this._interval;
			this._currentId = this._nextId;
			this._nextId = this.transport.scheduleOnce(this.invoke.bind(this),
				new TicksClass(this.context, this._nextTick).toSeconds());
		}
	}

	/**
	 * Push more events onto the timeline to keep up with the position of the timeline
	 */
	private _restart(time?: Time): void {
		this.transport.clear(this._currentId);
		this.transport.clear(this._nextId);
		this._nextTick = this.time;
		const ticks = this.transport.getTicksAtTime(time);
		if (ticks > this.time) {
			this._nextTick = this.time + Math.ceil((ticks - this.time) / this._interval) * this._interval;
		}
		this._currentId = this.transport.scheduleOnce(this.invoke.bind(this),
			new TicksClass(this.context, this._nextTick).toSeconds());
		this._nextTick += this._interval;
		this._nextId = this.transport.scheduleOnce(this.invoke.bind(this),
			new TicksClass(this.context, this._nextTick).toSeconds());
	}

	/**
	 * Clean up
	 */
	dispose(): this {
		super.dispose();
		this.transport.clear(this._currentId);
		this.transport.clear(this._nextId);
		this.transport.off("start", this._boundRestart);
		this.transport.off("loopStart", this._boundRestart);
		return this;
	}
}
