import { connect } from "../../core/Connect";
import { Param } from "../../core/context/Param";
import { ToneAudioBuffer } from "../../core/context/ToneAudioBuffer";
import { defaultArg, optionsFromArguments } from "../../core/util/Defaults";
import { noOp } from "../../core/util/Interface";
import { isDefined } from "../../core/util/TypeCheck";
import { OneShotSource, OneShotSourceOptions } from "../OneShotSource";

interface ToneBufferSourceOptions extends OneShotSourceOptions {
	buffer: ToneAudioBuffer;
	playbackRate: Positive;
	fadeIn: Time;
	fadeOut: Time;
	loopStart: Time;
	loopEnd: Time;
	loop: boolean;
	onload: () => void;
}

/**
 *  @class Wrapper around the native BufferSourceNode.
 *  @extends {Tone.AudioNode}
 *  @param  buffer   The buffer to play
 *  @param  onended  The callback to invoke when the buffer is done playing.
 */
export class ToneBufferSource extends OneShotSource<ToneBufferSourceOptions> {

	name = "ToneBufferSource";

	/**
	 *  The oscillator
	 */
	private _source = this.context.createBufferSource();
	protected _internalChannels = [this._gainNode, this._source];

	/**
	 *  The frequency of the oscillator
	 */
	readonly playbackRate: Param<Positive>;

	/**
	 * The private instance of the buffer object
	 */
	private _buffer: ToneAudioBuffer;

	/**
	 * indicators if the source has started/stopped
	 */
	private _sourceStarted: boolean = false;
	private _sourceStopped: boolean = false;

	constructor(options?: Partial<ToneBufferSourceOptions>);
	constructor(buffer?: ToneAudioBuffer | AudioBuffer | string, onload?: () => void);
	constructor() {

		super(optionsFromArguments(ToneBufferSource.getDefaults(), arguments, ["buffer", "onload"]));
		const options = optionsFromArguments(ToneBufferSource.getDefaults(), arguments, ["buffer", "onload"]);

		connect(this._source, this._gainNode);
		this._source.onended = this._stopSource.bind(this);

		/**
		 *  The playbackRate of the buffer
		 */
		this.playbackRate = new Param({
			context: this.context,
			param : this._source.playbackRate,
			units : "positive",
			value : options.playbackRate,
		});

		// set some values initially
		this.loop = options.loop;
		this.loopStart = options.loopStart;
		this.loopEnd = options.loopEnd;
		this._buffer = new ToneAudioBuffer(options.buffer, options.onload);
	}

	static getDefaults(): ToneBufferSourceOptions {
		return Object.assign(OneShotSource.getDefaults(), {
			buffer: new ToneAudioBuffer(),
			curve: "linear",
			fadeIn: 0,
			fadeOut: 0,
			loop: false,
			loopEnd : 0,
			loopStart : 0,
			onload: noOp,
			playbackRate : 1,
		});
	}

	/**
	 *  The fadeIn time of the amplitude envelope.
	 */
	get fadeIn(): Time {
		return this._fadeIn;
	}
	set fadeIn(t: Time) {
		this._fadeIn = t;
	}

	/**
	 *  The fadeOut time of the amplitude envelope.
	 */
	get fadeOut(): Time {
		return this._fadeOut;
	}
	set fadeOut(t: Time) {
		this._fadeOut = t;
	}

	/**
	 * The curve applied to the fades, either "linear" or "exponential"
	 */
	get curve(): "linear" | "exponential" {
		return this._curve;
	}
	set curve(t: "linear" | "exponential") {
		this._curve = t;
	}

	/**
	 *  Start the buffer
	 *  @param  time When the player should start.
	 *  @param  offset The offset from the beginning of the sample to start at.
	 *  @param  duration How long the sample should play. If no duration
	 *                   is given, it will default to the full length
	 *                   of the sample (minus any offset)
	 *  @param  gain  The gain to play the buffer back at.
	 */
	start(time?: Time, offset?: Time, duration?: Time, gain: GainFactor = 1): this {
		this.assert(this.buffer.loaded, "buffer is either not set or not loaded");
		time = this.toSeconds(time);

		// apply the gain envelope
		this._startGain(time, gain);

		// if it's a loop the default offset is the loopstart point
		if (this.loop) {
			offset = defaultArg(offset, this.loopStart);
		} else {
			// otherwise the default offset is 0
			offset = defaultArg(offset, 0);
		}
		offset = this.toSeconds(offset);
		// make sure the offset is not less than 0
		offset = Math.max(offset, 0);

		// start the buffer source
		if (this.loop) {
			// modify the offset if it's greater than the loop time
			const loopEnd = this.toSeconds(this.loopEnd) || this.buffer.duration;
			const loopStart = this.toSeconds(this.loopStart);
			const loopDuration = loopEnd - loopStart;
			// move the offset back
			if (offset >= loopEnd) {
				offset = ((offset - loopStart) % loopDuration) + loopStart;
			}
		}

		// this.buffer.loaded would have return false if the AudioBuffer was undefined
		this._source.buffer = this.buffer.get() as AudioBuffer;
		this._source.loopEnd = this.toSeconds(this.loopEnd) || this.buffer.duration;
		if (offset < this.buffer.duration) {
			this._sourceStarted = true;
			this._source.start(time, offset);
		}

		// if a duration is given, schedule a stop
		if (isDefined(duration)) {
			let computedDur = this.toSeconds(duration);
			// make sure it's never negative
			computedDur = Math.max(computedDur, 0);
			this.stop(time + computedDur);
		}

		return this;
	}

	protected _stopSource(): void {
		if (!this._sourceStopped) {
			this._sourceStopped = true;
			// allow additional time for the exponential curve to fully decay
			const additionalTail = this._curve === "exponential" ? this.toSeconds(this._fadeOut) * 2 : 0;
			if (this._sourceStarted && this._stopTime !== -1) {
				this._source.stop(this._stopTime + additionalTail);
			}

			this.onended();
			// remove the onended callback
			this.onended = noOp;

			// dispose the source after it's come to a stop
			setTimeout(() => {
				// if it hasn't already been disposed
				if (this._source) {
					this._source.disconnect();
					this._gainNode.disconnect();
				}
			}, additionalTail * 1000 + 100);
		}
	}

	/**
	 * If loop is true, the loop will start at this position.
	 */
	get loopStart(): Time {
		return this._source.loopStart;
	}
	set loopStart(loopStart: Time) {
		this._source.loopStart = this.toSeconds(loopStart);
	}

	/**
	 * If loop is true, the loop will end at this position.
	 */
	get loopEnd(): Time {
		return this._source.loopEnd;
	}
	set loopEnd(loopEnd: Time) {
		this._source.loopEnd = this.toSeconds(loopEnd);
	}

	/**
	 * The audio buffer belonging to the player.
	 * @memberOf ToneBufferSource#
	 * @type {Tone.Buffer}
	 * @name buffer
	 */
	get buffer(): ToneAudioBuffer {
		return this._buffer;
	}
	set buffer(buffer: ToneAudioBuffer) {
		this._buffer.set(buffer);
	}

	/**
	 * If the buffer should loop once it's over.
	 */
	get loop(): boolean {
		return this._source.loop;
	}
	set loop(loop: boolean) {
		this._source.loop = loop;
		if (this._sourceStarted) {
			this.cancelStop();
		}
	}

	/**
	 *  Clean up.
	 */
	dispose(): this {
		super.dispose();
		this._source.onended = null;
		this._source.disconnect();
		this._buffer.dispose();
		this.playbackRate.dispose();
		return this;
	}
}
