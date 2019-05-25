import { PlaybackState } from "Tone/core/util/StateTimeline";
import { Gain } from "../core/context/Gain";
import { ToneAudioNode, ToneAudioNodeOptions } from "../core/context/ToneAudioNode";
import { noOp } from "../core/util/Interface";

export abstract class OneShotSource<Options extends ToneAudioNodeOptions> extends ToneAudioNode<Options> {

	/**
	 *  The callback to invoke after the
	 *  source is done playing.
	 */
	onended: () => void = noOp;

	/**
	 * Sources do not have input nodes
	 */
	input: undefined;

	/**
	 *  The start time
	 */
	private _startTime: number = -1;

	/**
	 *  The stop time
	 */
	private _stopTime: number = -1;

	/**
	 * The id of the timeout
	 */
	private _timeout: number = -1;

	/**
	 * The public output node
	 */
	output: Gain = new Gain({
		context: this.context,
		gain : 0,
	});

	/**
	 *  The output gain node.
	 */
	protected _gainNode = this.output;

	protected abstract _stopSource(time: Seconds): void;

	/**
	 * Start the source node at the given time
	 * @param  time When to start the node
	 */
	protected abstract start(time?: Time): this;
	/**
	 * Start the source at the given time
	 * @param  time When to start the source
	 */
	protected _startGain(time: Time): this {
		this.assert(this._startTime === -1, "Source cannot be started more than once");
		this._startTime = this.toSeconds(time);
		this._startTime = Math.max(this._startTime, this.context.currentTime);
		this._gainNode.gain.setValueAtTime(1, this._startTime);
		return this;
	}

	/**
	 * Stop the source node at the given time.
	 * @param time When to stop the source
	 */
	stop(time?: Time): this {
		this._stopGain(time);
		return this;
	}

	/**
	 * Stop the source at the given time
	 * @param  time When to stop the source
	 */
	protected _stopGain(time: Time): this {
		this.assert(this._startTime !== -1, "'start' must be called before 'stop'");
		// cancel the previous stop
		this.cancelStop();
		// reschedule it
		this._stopTime = this.toSeconds(time);
		this._stopTime = Math.max(this._stopTime, this.context.currentTime);
		if (this._stopTime > this._startTime) {
			this._gainNode.gain.setValueAtTime(0, this._stopTime);
			this.context.clearTimeout(this._timeout);
			this._timeout = this.context.setTimeout(() => {
				this._stopSource(this.now());
				this.onended();
				// disconnect when it's ended, to free up for garbage collection
				setTimeout(() => this._gainNode.disconnect(), 100);
			}, this._stopTime - this.context.currentTime);
		} else {
			// cancel the stop envelope
			this._gainNode.gain.cancelScheduledValues(this._startTime);
		}
		return this;
	}

	/**
	 *  Get the playback state at the given time
	 */
	getStateAtTime = function(time: Time): PlaybackState {
		const computedTime = this.toSeconds(time);
		if (this._startTime !== -1 && computedTime >= this._startTime &&
			(this._stopTime === -1 || computedTime <= this._stopTime)) {
			return "started";
		} else {
			return "stopped";
		}
	};

	/**
	 * Get the playback state at the current time
	 */
	get state(): PlaybackState {
		return this.getStateAtTime(this.now());
	}

	/**
	 *  Cancel a scheduled stop event
	 */
	protected cancelStop(): this {
		this.assert(this._startTime !== -1, "Source is not started");
		// cancel the stop envelope
		this._gainNode.gain.cancelScheduledValues(this._startTime + this.sampleTime);
		this.context.clearTimeout(this._timeout);
		this._stopTime = -1;
		return this;
	}
}
