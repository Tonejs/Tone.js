import { Param } from "../../core/context/Param";
import { ToneMediaElement } from "../../core/context/ToneMediaElement";
import { GainFactor, Positive, Seconds, Time } from "../../core/type/Units";
import { defaultArg, optionsFromArguments } from "../../core/util/Defaults";
import { noOp } from "../../core/util/Interface";
import { isDefined } from "../../core/util/TypeCheck";
import { OneShotSource, OneShotSourceOptions } from "../OneShotSource";
import { EQ, GTE, LT } from "../../core/util/Math";

export interface ToneMediaElementSourceOptions extends OneShotSourceOptions {
	element: ToneMediaElement;
	playbackRate: Positive;
	fadeIn: Time;
	fadeOut: Time;
	loopStart: Time;
	loopEnd: Time;
	loop: boolean;
	onload: () => void;
	onerror: (error: Error) => void;
}

/**
 * Wrapper around the native MediaElementAudioSourceNode.
 * @category Source
 */
export class ToneMediaElementSource extends OneShotSource<ToneMediaElementSourceOptions> {
	readonly name: string = "ToneMediaElementSource";

	/**
	 * The oscillator
	 */
	private _source: MediaElementAudioSourceNode | null = null;

	/**
	 * The frequency of the oscillator
	 */
	readonly playbackRate: Param<"positive">;

	/**
	 * Playback speed
	 */
	readonly duration: Param<"positive">;

	/**
	 * indicators if the source has started/stopped
	 */
	private _sourceStarted = false;
	private _sourceStopped = false;

	/**
	 * @param url The buffer to play or url to load
	 * @param onload The callback to invoke when the buffer is done playing.
	 */
	constructor(mediaElement?: ToneMediaElement, onload?: () => void);
	constructor(options?: Partial<ToneMediaElementSourceOptions>);
	constructor() {
		super(
			optionsFromArguments(
				ToneMediaElementSource.getDefaults(),
				arguments,
				["element", "onload"]
			)
		);
		const options = optionsFromArguments(
			ToneMediaElementSource.getDefaults(),
			arguments,
			["element", "onload"]
		);

		const audioElement = options.element.get() as HTMLAudioElement;
		this._source = this.context.createMediaElementSource(
			audioElement
		) as MediaElementAudioSourceNode;

		this.duration = new Param({
			context: this.context,
			units: "positive",
			value: 10, // TODO: get duration from mediaElement
		});

		audioElement.playbackRate = options.playbackRate;
		this.playbackRate = new Param({
			context: this.context,
			units: "positive",
			value: options.playbackRate,
		});

		// set some values initially
		this.loop = options.loop;
		this.loopStart = options.loopStart;
		this.loopEnd = options.loopEnd;
	}

	static getDefaults(): ToneMediaElementSourceOptions {
		return Object.assign(OneShotSource.getDefaults(), {
			element: null as unknown as ToneMediaElement,
			loop: false,
			loopEnd: 0,
			loopStart: 0,
			onload: noOp,
			onerror: noOp,
			playbackRate: 1,
		});
	}

	/**
	 * The fadeIn time of the amplitude envelope.
	 */
	get fadeIn(): Time {
		return this._fadeIn;
	}
	set fadeIn(t: Time) {
		this._fadeIn = t;
	}

	/**
	 * The fadeOut time of the amplitude envelope.
	 */
	get fadeOut(): Time {
		return this._fadeOut;
	}
	set fadeOut(t: Time) {
		this._fadeOut = t;
	}

	/**
	 * Start the buffer
	 * @param  time When the player should start.
	 * @param  offset The offset from the beginning of the sample to start at.
	 * @param  duration How long the sample should play. If no duration is given, it will default to the full length of the sample (minus any offset)
	 * @param  gain  The gain to play the buffer back at.
	 */
	start(
		time?: Time,
		offset?: Time,
		duration?: Time,
		gain: GainFactor = 1
	): this {
		if (!this._source) {
			return this;
		}

		const computedTime = this.toSeconds(time);

		// apply the gain envelope
		this._startGain(computedTime, gain);

		// if it's a loop the default offset is the loopstart point
		if (this.loop) {
			offset = defaultArg(offset, this.loopStart);
		} else {
			// otherwise the default offset is 0
			offset = defaultArg(offset, 0);
		}
		// make sure the offset is not less than 0
		let computedOffset = Math.max(this.toSeconds(offset), 0);

		// start the buffer source
		if (this.loop) {
			// modify the offset if it's greater than the loop time
			const loopEnd = this.toSeconds(this.loopEnd) || this.duration.value;
			const loopStart = this.toSeconds(this.loopStart);
			const loopDuration = loopEnd - loopStart;
			// move the offset back
			if (GTE(computedOffset, loopEnd)) {
				computedOffset =
					((computedOffset - loopStart) % loopDuration) + loopStart;
			}
			// when the offset is very close to the duration, set it to 0
			if (EQ(computedOffset, this.duration.value)) {
				computedOffset = 0;
			}
		}

		if (LT(computedOffset, this.duration.value)) {
			this._sourceStarted = true;
			this.start(computedTime, computedOffset);
		}

		// if a duration is given, schedule a stop
		if (isDefined(duration)) {
			let computedDur = this.toSeconds(duration);
			// make sure it's never negative
			computedDur = Math.max(computedDur, 0);
			this.stop(computedTime + computedDur);
		}

		return this;
	}

	protected _stopSource(time?: Seconds): void {
		if (!this._sourceStopped && this._sourceStarted) {
			this._sourceStopped = true;
			this.stop(this.toSeconds(time));
			this._onended();
		}
	}

	/**
	 * If loop is true, the loop will start at this position.
	 */
	get loopStart(): Time {
		return this.loopStart;
	}
	set loopStart(loopStart: Time) {
		this.loopStart = this.toSeconds(loopStart);
	}

	/**
	 * If loop is true, the loop will end at this position.
	 */
	get loopEnd(): Time {
		return this.loopEnd;
	}
	set loopEnd(loopEnd: Time) {
		this.loopEnd = this.toSeconds(loopEnd);
	}

	/**
	 * If the buffer should loop once it's over.
	 */
	get loop(): boolean {
		return this.loop;
	}
	set loop(loop: boolean) {
		this.loop = loop;
		if (this._sourceStarted) {
			this.cancelStop();
		}
	}

	/**
	 * Clean up.
	 */
	dispose(): this {
		super.dispose();
		this.onended = noOp;
		this.disconnect();
		this.playbackRate.dispose();
		return this;
	}
}
