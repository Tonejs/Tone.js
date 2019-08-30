import { createOfflineAudioContext } from "../context/AudioContext";
import { Context } from "../context/Context";
import { Seconds } from "../type/Units";
import { isOfflineAudioContext } from "../util/AdvancedTypeCheck";

/**
 * Wrapper around the OfflineAudioContext
 * @category Core
 */
export class OfflineContext extends Context {

	name = "OfflineContext";

	/**
	 *  A private reference to the duration
	 */
	private readonly _duration: Seconds;

	/**
	 *  An artificial clock source
	 */
	private _currentTime: Seconds = 0;

	/**
	 * Private reference to the OfflineAudioContext.
	 */
	protected _context!: OfflineAudioContext;

	/**
	 *  @param  channels  The number of channels to render
	 *  @param  duration  The duration to render in seconds
	 *  @param sampleRate the sample rate to render at
	 */
	constructor(
		channels: number,
		duration: Seconds, sampleRate: number,
	);
	constructor(context: OfflineAudioContext);
	constructor() {

		super({
			clockSource: "offline",
			context: isOfflineAudioContext(arguments[0]) ?
				arguments[0] : createOfflineAudioContext(arguments[0], arguments[1] * arguments[2], arguments[2]),
			lookAhead: 0,
			updateInterval: isOfflineAudioContext(arguments[0]) ?
					128 / arguments[0].sampleRate : 128 / arguments[2],
		});

		this._duration = isOfflineAudioContext(arguments[0]) ?
			arguments[0].length / arguments[0].sampleRate : arguments[1];
	}

	/**
	 *  Override the now method to point to the internal clock time
	 */
	now(): Seconds {
		return this._currentTime;
	}

	/**
	 * Same as this.now()
	 */
	get currentTime(): Seconds {
		return this._currentTime;
	}

	/**
	 *  Render the output of the OfflineContext
	 */
	render(): Promise<AudioBuffer> {
		while (this._duration - this._currentTime >= 0) {
			// invoke all the callbacks on that time
			this.emit("tick");
			// increment the clock in 5ms chunks
			this._currentTime += 128 / this.sampleRate;
		}

		return this._context.startRendering();
	}

	/**
	 *  Close the context
	 */
	close(): Promise<void> {
		return Promise.resolve();
	}
}
