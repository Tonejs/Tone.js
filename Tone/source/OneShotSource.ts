import { Tone } from "Tone/core/Tone";
import { PlaybackState } from "Tone/core/util/StateTimeline";
import { Gain } from "../core/context/Gain";
import { ToneAudioNode, ToneAudioNodeOptions } from "../core/context/ToneAudioNode";
import { noOp } from "../core/util/Interface";

export interface OneShotSourceOptions extends ToneAudioNodeOptions {
	onended: () => void;
}

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
	protected _startTime: number = -1;

	/**
	 *  The stop time
	 */
	protected _stopTime: number = -1;

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

	/**
	 *  The fadeIn time of the amplitude envelope.
	 */
	protected _fadeIn: Time = 0;

	/**
	 *  The fadeOut time of the amplitude envelope.
	 */
	protected _fadeOut: Time = 0;

	/**
	 * The curve applied to the fades, either "linear" or "exponential"
	 */
	protected _curve: "linear" | "exponential" = "linear";

	static getDefaults(): OneShotSourceOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			onended : noOp,
		});
	}

	/**
	 * Stop the source node
	 */
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
	protected _startGain(time: Seconds, gain: GainFactor = 1): this {
		this.assert(this._startTime === -1, "Source cannot be started more than once");
		// apply a fade in envelope
		const fadeInTime = this.toSeconds(this._fadeIn);

		// record the start time
		this._startTime = time + fadeInTime;
		this._startTime = Math.max(this._startTime, this.context.currentTime);

		// schedule the envelope
		if (fadeInTime > 0) {
			this._gainNode.gain.setValueAtTime(0, time);
			if (this._curve === "linear") {
				this._gainNode.gain.linearRampToValueAtTime(gain, time + fadeInTime);
			} else {
				this._gainNode.gain.exponentialApproachValueAtTime(gain, time, fadeInTime);
			}
		} else {
			this._gainNode.gain.setValueAtTime(gain, time);
		}
		return this;
	}

	/**
	 * Stop the source node at the given time.
	 * @param time When to stop the source
	 */
	stop(time?: Time): this {
		this._stopGain(this.toSeconds(time));
		return this;
	}

	/**
	 * Stop the source at the given time
	 * @param  time When to stop the source
	 */
	protected _stopGain(time: Seconds): this {
		this.assert(this._startTime !== -1, "'start' must be called before 'stop'");
		// cancel the previous stop
		this.cancelStop();

		// the fadeOut time
		const fadeOutTime = this.toSeconds(this._fadeOut);

		// schedule the stop callback
		this._stopTime = this.toSeconds(time) + fadeOutTime;
		this._stopTime = Math.max(this._stopTime, this.context.currentTime);
		if (fadeOutTime > 0) {
			// start the fade out curve at the given time
			if (this._curve === "linear") {
				this._gainNode.gain.linearRampTo(0, fadeOutTime, time);
			} else {
				this._gainNode.gain.targetRampTo(0, fadeOutTime, time);
			}
		} else {
			// stop any ongoing ramps, and set the value to 0
			this._gainNode.gain.cancelAndHoldAtTime(time);
			this._gainNode.gain.setValueAtTime(0, time);
		}
		this.context.clearTimeout(this._timeout);
		this._timeout = this.context.setTimeout(() => {
			this._stopSource(this.now());
			this.onended();
			// disconnect when it's ended, to free up for garbage collection
			setTimeout(() => this._gainNode.disconnect(), 100);
		}, this._stopTime - this.context.currentTime);
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
