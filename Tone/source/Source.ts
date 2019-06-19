import { Volume } from "Tone/component/channel/Volume";
import { ToneAudioNode, ToneAudioNodeOptions } from "Tone/core/context/ToneAudioNode";
import { defaultArg, optionsFromArguments } from "Tone/core/util/Defaults";
import { noOp, readOnly } from "Tone/core/util/Interface";
import { PlaybackState, StateTimeline, StateTimelineEvent } from "Tone/core/util/StateTimeline";
import { isUndef } from "Tone/core/util/TypeCheck";

export interface SourceOptions extends ToneAudioNodeOptions {
	volume: Decibels;
	mute: boolean;
}

/**
 *  @class  Base class for sources. Sources have start/stop methods
 *          and the ability to be synced to the
 *          start/stop of this.context.transport.
 *
 *  @constructor
 *  @extends {Tone.AudioNode}
 *  @example
 * //Multiple state change events can be chained together,
 * //but must be set in the correct order and with ascending times
 *
 * // OK
 * state.start().stop("+0.2");
 * // AND
 * state.start().stop("+0.2").start("+0.4").stop("+0.7")
 *
 * // BAD
 * state.stop("+0.2").start();
 * // OR
 * state.start("+0.3").stop("+0.2");
 *
 */
export abstract class Source<Options extends SourceOptions> extends ToneAudioNode<Options> {

	/**
	 *  The output volume node
	 *  @type  {Tone.Volume}
	 *  @private
	 */
	private _volume: Volume = new Volume({
		context: this.context,
	});

	/**
	 * The output note
	 */
	output = this._volume;
	protected _internalChannels = [this.output];

	/**
	 * There is no input
	 */
	input = undefined;

	/**
	 * The volume of the output in decibels.
	 * @type {Decibels}
	 * @signal
	 * @example
	 * source.volume.value = -6;
	 */
	volume = this._volume.volume;

	/**
	 * 	Keep track of the scheduled state.
	 *  @type {Tone.StateTimeline}
	 *  @private
	 */
	protected _state: StateTimeline = new StateTimeline("stopped");

	/**
	 *  The synced `start` callback function from the transport
	 *  @type {Function}
	 *  @private
	 */
	private _synced = false;

	/**
	 *  Keep track of all of the scheduled event ids
	 */
	private _scheduled: number[] = [];

	/**
	 * Placeholder functions for syncing/unsyncing to transport
	 */
	private _syncedStart: (time, offset) => void = noOp;
	private _syncedStop: (time) => void = noOp;

	constructor(options: Partial<SourceOptions>);
	constructor() {

		super(optionsFromArguments(Volume.getDefaults(), arguments, ["volume"]));
		const options = optionsFromArguments(Volume.getDefaults(), arguments, ["volume"]);

		readOnly(this, "volume");
		this._state.memory = 100;
		this.volume.value = options.volume;
		// set mute initially
		this.mute = options.mute;

	}

	static getDefaults(): SourceOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			mute: false,
			volume: 0,
		});
	}

	/**
	 *  Returns the playback state of the source, either "started" or "stopped".
	 */
	get state(): PlaybackState {
		if (this.context.transport && this._synced) {
			if (this.context.transport.state === "started") {
				return this._state.getValueAtTime(this.context.transport.seconds);
			} else {
				return "stopped";
			}
		} else {
			return this._state.getValueAtTime(this.now());
		}
	}

	/**
	 * Mute the output.
	 * @example
	 * //mute the output
	 * source.mute = true;
	 */
	get mute(): boolean {
		return this._volume.mute;
	}
	set mute(mute: boolean) {
		this._volume.mute = mute;
	}

	// overwrite these functions
	protected abstract _start(time: Time, offset?: Time, duration?: Time): void;
	protected abstract _stop(time: Time): void;
	abstract restart(time: Time, offset?: Time, duration?: Time): this;

	/**
	 *  Start the source at the specified time. If no time is given,
	 *  start the source now.
	 *  @param  {Time} [time=now] When the source should be started.
	 *  @returns {Source} this
	 *  @example
	 * source.start("+0.5"); //starts the source 0.5 seconds from now
	 */
	start(time?: Time, offset?: Time, duration?: Time): this {
		if (isUndef(time) && this._synced && this.context.transport) {
			time = this.context.transport.seconds;
		} else {
			time = this.toSeconds(time);
			time = Math.max(time, this.context.currentTime);
		}
		// if it's started, stop it and restart it
		if (this._state.getValueAtTime(time) === "started") {
			this._state.cancel(time);
			this._state.setStateAtTime("started", time);
			this.restart(time, offset, duration);
		} else {
			this._state.setStateAtTime("started", time);
			if (this._synced && this.context.transport) {
				// add the offset time to the event
				const event = this._state.get(time);
				if (event) {
					event.offset = this.toSeconds(defaultArg(offset, 0));
					event.duration = this.toSeconds(duration);
				}
				const sched = this.context.transport.schedule(t => {
					this._start(t, offset, duration);
				}, time);
				this._scheduled.push(sched);

				// if it's already started
				if (this.context.transport.state === "started") {
					this._syncedStart(this.now(), this.context.transport.seconds);
				}
			} else {
				this._start.apply(this, arguments);
			}
		}
		return this;
	}

	/**
	 *  Stop the source at the specified time. If no time is given,
	 *  stop the source now.
	 *  @param  {Time} [time=now] When the source should be stopped.
	 *  @returns {Source} this
	 *  @example
	 * source.stop(); // stops the source immediately
	 */
	stop(time) {
		if (isUndef(time) && this._synced && this.context.transport) {
			time = this.context.transport.seconds;
		} else {
			time = this.toSeconds(time);
			time = Math.max(time, this.context.currentTime);
		}
		if (!this._synced) {
			this._stop.apply(this, arguments);
		} else if (this.context.transport) {
			const sched = this.context.transport.schedule(this._stop.bind(this), time);
			this._scheduled.push(sched);
		}
		this._state.cancel(time);
		this._state.setStateAtTime("stopped", time);
		return this;
	}

	/**
	 *  Sync the source to the Transport so that all subsequent
	 *  calls to `start` and `stop` are synced to the TransportTime
	 *  instead of the AudioContext time.
	 *
	 * @example
	 * //sync the source so that it plays between 0 and 0.3 on the Transport's timeline
	 * source.sync().start(0).stop(0.3);
	 * //start the transport.
	 * this.context.transport.start();
	 *
	 * @example
	 * //start the transport with an offset and the sync'ed sources
	 * //will start in the correct position
	 * source.sync().start(0.1);
	 * //the source will be invoked with an offset of 0.4 = (0.5 - 0.1)
	 * this.context.transport.start("+0.5", 0.5);
	 */
	sync(): this {
		if (this.context.transport) {
			this._synced = true;
			this._syncedStart = (time, offset) => {
				if (offset > 0) {
					// get the playback state at that time
					const stateEvent = this._state.get(offset);
					// listen for start events which may occur in the middle of the sync'ed time
					if (stateEvent && stateEvent.state === "started" && stateEvent.time !== offset) {
						// get the offset
						const startOffset = offset - this.toSeconds(stateEvent.time);
						let duration;
						if (stateEvent.duration) {
							duration = this.toSeconds(stateEvent.duration) - startOffset;
						}
						this._start(time, this.toSeconds(stateEvent.offset) + startOffset, duration);
					}
				}
			};
			this._syncedStop = time => {
				if (this.context.transport) {
					const seconds = this.context.transport.getSecondsAtTime(Math.max(time - this.sampleTime, 0));
					if (this._state.getValueAtTime(seconds) === "started") {
						this._stop(time);
					}
				}
			};
			this.context.transport.on("start", this._syncedStart);
			this.context.transport.on("loopStart", this._syncedStart);
			this.context.transport.on("stop", this._syncedStop);
			this.context.transport.on("pause", this._syncedStop);
			this.context.transport.on("loopEnd", this._syncedStop);
		}
		return this;
	}

	/**
	 *  Unsync the source to the Transport. See Source.sync
	 *  @returns {Source} this
	 */
	unsync(): this {
		if (this.context.transport) {
			if (this._synced) {
				this.context.transport.off("stop", this._syncedStop);
				this.context.transport.off("pause", this._syncedStop);
				this.context.transport.off("loopEnd", this._syncedStop);
				this.context.transport.off("start", this._syncedStart);
				this.context.transport.off("loopStart", this._syncedStart);
			}
			this._synced = false;
			// clear all of the scheduled ids
			for (let i = 0; i < this._scheduled.length; i++) {
				const id = this._scheduled[i];
				this.context.transport.clear(id);
			}
			this._scheduled = [];
			this._state.cancel(0);
		}
		return this;
	}

	/**
	 * Clean up.
	 */
	dispose(): this {
		this.unsync();
		this._volume.dispose();
		this._state.dispose();
		return this;
	}
}
