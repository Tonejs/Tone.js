import { Seconds } from "../type/Units";

export type TickerClockSource = "worker" | "timeout" | "offline";

/**
 * A class which provides a reliable callback using either
 * a Web Worker, or if that isn't supported, falls back to setTimeout.
 */
export class Ticker {

	/**
	 * Either "worker" or "timeout" or "offline"
	 */
	private _type: TickerClockSource;

	/**
	 * The update interval of the worker
	 */
	private _updateInterval: Seconds;

	/**
	 * The callback to invoke at regular intervals
	 */
	private _callback: () => void;

	/**
	 * track the callback interval
	 */
	private _timeout!: ReturnType<typeof setTimeout>;

	/**
	 * private reference to the worker
	 */
	private _worker!: Worker;

	constructor(callback: () => void, type: TickerClockSource, updateInterval: Seconds) {

		this._callback = callback;
		this._type = type;
		this._updateInterval = updateInterval;

		// create the clock source for the first time
		this._createClock();
	}

	/**
	 * Generate a web worker
	 */
	private _createWorker(): void {

		const blob = new Blob([
			/* javascript */`
			// the initial timeout time
			let timeoutTime =  ${(this._updateInterval * 1000).toFixed(1)};
			// onmessage callback
			self.onmessage = function(msg){
				timeoutTime = parseInt(msg.data);
			};
			// the tick function which posts a message
			// and schedules a new tick
			function tick(){
				setTimeout(tick, timeoutTime);
				self.postMessage('tick');
			}
			// call tick initially
			tick();
			`
		], { type: "text/javascript" });
		const blobUrl = URL.createObjectURL(blob);
		const worker = new Worker(blobUrl);

		worker.onmessage = this._callback.bind(this);

		this._worker = worker;
	}

	/**
	 * Create a timeout loop
	 */
	private _createTimeout(): void {
		this._timeout = setTimeout(() => {
			this._createTimeout();
			this._callback();
		}, this._updateInterval * 1000);
	}

	/**
	 * Create the clock source.
	 */
	private _createClock(): void {
		if (this._type === "worker") {
			try {
				this._createWorker();
			} catch (e) {
				// workers not supported, fallback to timeout
				this._type = "timeout";
				this._createClock();
			}
		} else if (this._type === "timeout") {
			this._createTimeout();
		}
	}

	/**
	 * Clean up the current clock source
	 */
	private _disposeClock(): void {
		if (this._timeout) {
			clearTimeout(this._timeout);
			this._timeout = 0;
		}
		if (this._worker) {
			this._worker.terminate();
			this._worker.onmessage = null;
		}
	}

	/**
	 * The rate in seconds the ticker will update
	 */
	get updateInterval(): Seconds {
		return this._updateInterval;
	}
	set updateInterval(interval: Seconds) {
		this._updateInterval = Math.max(interval, 128 / 44100);
		if (this._type === "worker") {
			this._worker.postMessage(Math.max(interval * 1000, 1));
		}
	}

	/**
	 * The type of the ticker, either a worker or a timeout
	 */
	get type(): TickerClockSource {
		return this._type;
	}
	set type(type: TickerClockSource) {
		this._disposeClock();
		this._type = type;
		this._createClock();
	}

	/**
	 * Clean up
	 */
	dispose(): void {
		this._disposeClock();
	}
}
