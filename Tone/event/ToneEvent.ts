import "../core/clock/Transport";
import { ToneWithContext, ToneWithContextOptions } from "../core/context/ToneWithContext";
import { TicksClass } from "../core/type/Ticks";
import { defaultArg, optionsFromArguments } from "../core/util/Defaults";
import { noOp } from "../core/util/Interface";
import { BasicPlaybackState, StateTimeline } from "../core/util/StateTimeline";
import { isBoolean, isDefined, isNumber } from "../core/util/TypeCheck";

type ToneEventCallback = (time: Seconds, value: any) => void;

interface ToneEventOptions extends ToneWithContextOptions {
	callback: ToneEventCallback;
	loop: boolean | number;
	loopEnd: Time;
	loopStart: Time;
	playbackRate: Positive;
	value: any;
	probability: NormalRange;
	mute: boolean;
	humanize: boolean | Time;
}

/**
 * ToneEvent abstracts away this.context.transport.schedule and provides a schedulable
 * callback for a single or repeatable events along the timeline.
 *
 * @extends {Tone}
 * @param callback The callback to invoke at the time.
 * @param value The value or values which should be passed to the callback function on invocation.
 * @example
 * var chord = new ToneEvent(function(time, chord){
 * 	//the chord as well as the exact time of the event
 * 	//are passed in as arguments to the callback function
 * }, ["D4", "E4", "F4"]);
 * //start the chord at the beginning of the transport timeline
 * chord.start();
 * //loop it every measure for 8 measures
 * chord.loop = 8;
 * chord.loopEnd = "1m";
 */
export class ToneEvent extends ToneWithContext<ToneEventOptions> {

	name = "ToneEvent";

	/**
	 *  Loop value
	 */
	private _loop: boolean | number;

	/**
	 *  The callback to invoke.
	 */
	callback: ToneEventCallback;

	/**
	 *  The value which is passed to the
	 *  callback function.
	 */
	value: any;

	/**
	 *  When the note is scheduled to start.
	 */
	private _loopStart: Ticks;

	/**
	 *  When the note is scheduled to start.
	 */
	private _loopEnd: Ticks;

	/**
	 *  Tracks the scheduled events
	 */
	private _state: StateTimeline<{id: number}> = new StateTimeline("stopped");

	/**
	 *  The playback speed of the note. A speed of 1
	 *  is no change.
	 */
	private _playbackRate: Positive;

	/**
	 *  A delay time from when the event is scheduled to start
	 */
	private _startOffset: Ticks = 0;

	/**
	 *  private holder of probability value
	 */
	private _probability: NormalRange;

	/**
	 *  the amount of variation from the given time.
	 */
	private _humanize: boolean | Time;

	/**
	 *  If mute is true, the callback won't be invoked.
	 */
	mute: boolean;

	constructor(options?: Partial<ToneEventOptions>);
	constructor(callback?: ToneEventCallback, value?: any);
	constructor() {

		super(optionsFromArguments(ToneEvent.getDefaults(), arguments, ["callback", "value"]));
		const options = optionsFromArguments(ToneEvent.getDefaults(), arguments, ["callback", "value"]);

		this._loop = options.loop;
		this.callback = options.callback;
		this.value = options.value;
		this._loopStart = this.toTicks(options.loopStart);
		this._loopEnd = this.toTicks(options.loopEnd);
		this._playbackRate = options.playbackRate;
		this._probability = options.probability;
		this._humanize = options.humanize;
		this.mute = options.mute;
		this.playbackRate = options.playbackRate;
	}

	static getDefaults(): ToneEventOptions {
		return Object.assign(ToneWithContext.getDefaults(), {
			callback : noOp,
			humanize : false,
			loop : false,
			loopEnd : "1m",
			loopStart : 0,
			mute : false,
			playbackRate : 1,
			probability : 1,
			value : null,
		});
	}

	/**
	 *  Reschedule all of the events along the timeline
	 *  with the updated values.
	 *  @param after Only reschedules events after the given time.
	 *  @private
	 */
	private _rescheduleEvents(after: Ticks = -1): void {
		// if no argument is given, schedules all of the events
		this._state.forEachFrom(after, event => {
			let duration;
			if (event.state === "started") {
				if (event.id !== -1) {
					this.context.transport.clear(event.id);
				}
				const startTick = event.time + Math.round(this.startOffset / this._playbackRate);
				if (this._loop === true || isNumber(this._loop) && this._loop > 1) {
					duration = Infinity;
					if (isNumber(this._loop)) {
						duration = (this._loop) * this._getLoopDuration();
					}
					const nextEvent = this._state.getAfter(startTick);
					if (nextEvent !== null) {
						duration = Math.min(duration, nextEvent.time - startTick);
					}
					if (duration !== Infinity) {
						// schedule a stop since it's finite duration
						this._state.setStateAtTime("stopped", startTick + duration + 1, { id : -1 });
						duration = new TicksClass(this.context, duration);
					}
					const interval = new TicksClass(this.context, this._getLoopDuration());
					event.id = this.context.transport.scheduleRepeat(
						this._tick.bind(this), interval, new TicksClass(this.context, startTick), duration);
				} else {
					event.id = this.context.transport.schedule(this._tick.bind(this), new TicksClass(this.context, startTick));
				}
			}
		});
	}

	/**
	 *  Returns the playback state of the note, either "started" or "stopped".
	 */
	get state(): BasicPlaybackState {
		return this._state.getValueAtTime(this.context.transport.ticks) as BasicPlaybackState;
	}

	/**
	 *  The start from the scheduled start time
	 */
	protected get startOffset(): Ticks {
		return this._startOffset;
	}
	protected set startOffset(offset) {
		this._startOffset = offset;
	}

	/**
	 *  The probability of the notes being triggered.
	 */
	get probability(): NormalRange {
		return this._probability;
	}
	set probability(prob) {
		this._probability = prob;
	}

	/**
	 *  If set to true, will apply small random variation
	 *  to the callback time. If the value is given as a time, it will randomize
	 *  by that amount.
	 * @example
	 * event.humanize = true;
	 */
	get humanize(): Time | boolean {
		return this._humanize;
	}

	set humanize(variation) {
		this._humanize = variation;
	}

	/**
	 *  Start the note at the given time.
	 *  @param  time  When the event should start.
	 */
	start(time?: TransportTime): this {
		time = this.toTicks(time);
		if (this._state.getValueAtTime(time) === "stopped") {
			this._state.add({
				id : -1,
				state : "started",
				time,
			});
			this._rescheduleEvents(time);
		}
		return this;
	}

	/**
	 *  Stop the Event at the given time.
	 *  @param  time  When the event should stop.
	 */
	stop(time?: TransportTime): this {
		this.cancel(time);
		time = this.toTicks(time);
		if (this._state.getValueAtTime(time) === "started") {
			this._state.setStateAtTime("stopped", time, { id: -1 });
			const previousEvent = this._state.getBefore(time);
			let reschedulTime = time;
			if (previousEvent !== null) {
				reschedulTime = previousEvent.time;
			}
			this._rescheduleEvents(reschedulTime);
		}
		return this;
	}

	/**
	 *  Cancel all scheduled events greater than or equal to the given time
	 *  @param  time  The time after which events will be cancel.
	 */
	cancel(time?: TransportTime): this {
		time = defaultArg(time, -Infinity);
		time = this.toTicks(time);
		this._state.forEachFrom(time, event => {
			this.context.transport.clear(event.id);
		});
		this._state.cancel(time);
		return this;
	}

	/**
	 *  The callback function invoker. Also
	 *  checks if the Event is done playing
	 *  @param  time  The time of the event in seconds
	 *  @private
	 */
	private _tick(time: Seconds): void {
		const ticks = this.context.transport.getTicksAtTime(time);
		if (!this.mute && this._state.getValueAtTime(ticks) === "started") {
			if (this.probability < 1 && Math.random() > this.probability) {
				return;
			}
			if (this.humanize) {
				let variation = 0.02;
				if (!isBoolean(this.humanize)) {
					variation = this.toSeconds(this.humanize);
				}
				time += (Math.random() * 2 - 1) * variation;
			}
			this.callback(time, this.value);
		}
	}

	/**
	 *  Get the duration of the loop.
	 */
	private _getLoopDuration(): Ticks {
		return Math.round((this._loopEnd - this._loopStart) / this._playbackRate);
	}

	/**
	 *  If the note should loop or not
	 *  between ToneEvent.loopStart and
	 *  ToneEvent.loopEnd. If set to true,
	 *  the event will loop indefinitely,
	 *  if set to a number greater than 1
	 *  it will play a specific number of
	 *  times, if set to false, 0 or 1, the
	 *  part will only play once.
	 */
	get loop(): boolean | number {
		return this._loop;
	}
	set loop(loop) {
		this._loop = loop;
		this._rescheduleEvents();
	}

	/**
	 * 	The playback rate of the note. Defaults to 1.
	 *  @example
	 * note.loop = true;
	 * //repeat the note twice as fast
	 * note.playbackRate = 2;
	 */
	get playbackRate(): Positive {
		return this._playbackRate;
	}
	set playbackRate(rate) {
		this._playbackRate = rate;
		this._rescheduleEvents();
	}

	/**
	 *  The loopEnd point is the time the event will loop
	 *  if ToneEvent.loop is true.
	 */
	get loopEnd(): Time {
		return new TicksClass(this.context, this._loopEnd).toSeconds();
	}
	set loopEnd(loopEnd) {
		this._loopEnd = this.toTicks(loopEnd);
		if (this._loop) {
			this._rescheduleEvents();
		}
	}

	/**
	 *  The time when the loop should start.
	 */
	get loopStart(): Time {
		return new TicksClass(this.context, this._loopStart).toSeconds();
	}
	set loopStart(loopStart) {
		this._loopStart = this.toTicks(loopStart);
		if (this._loop) {
			this._rescheduleEvents();
		}
	}

	/**
	 *  The current progress of the loop interval.
	 *  Returns 0 if the event is not started yet or
	 *  it is not set to loop.
	 */
	get progress(): NormalRange {
		if (this._loop) {
			const ticks = this.context.transport.ticks;
			const lastEvent = this._state.get(ticks);
			if (lastEvent !== null && lastEvent.state === "started") {
				const loopDuration = this._getLoopDuration();
				const progress = (ticks - lastEvent.time) % loopDuration;
				return progress / loopDuration;
			} else {
				return 0;
			}
		} else {
			return 0;
		}
	}

	dispose(): this {
		super.dispose();
		this.cancel();
		this._state.dispose();
		this.value = null;
		return this;
	}
}
