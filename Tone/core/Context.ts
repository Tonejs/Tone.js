import { Ticker, TickerClockSource } from "./ContextTicker";
import { Emitter } from "./Emitter";
import { Timeline } from "./Timeline";
import { isString, Omit, optionsFromArguments } from "./Util";

type ContextLatencyHint = AudioContextLatencyCategory | "fastest";

// these are either not used in Tone.js or deprecated and not implemented.
type ExcludedFromBaseAudioContext = "createScriptProcessor" | "onstatechange" | "addEventListener"
	| "removeEventListener" | "listener" | "dispatchEvent" | "audioWorklet";

// the subset of the BaseAudioContext which Tone.Context implements.
type BaseAudioContextSubset = Omit<BaseAudioContext, ExcludedFromBaseAudioContext>;

interface ContextOptions {
	clockSource: TickerClockSource;
	latencyHint: ContextLatencyHint;
	lookAhead: Seconds;
	updateInterval: Seconds;
}

interface ContextTimeoutEvent {
	callback: (...args: any[]) => void;
	id: number;
	time: Seconds;
}

/**
 * Wrapper around the native AudioContext.
 */
export class Context extends Emitter implements BaseAudioContextSubset {

	name = "Context";

	static getDefaults(): ContextOptions {
		return {
			clockSource: "worker",
			latencyHint: "interactive",
			lookAhead: 0.1,
			updateInterval: 0.03,
		};
	}

	/**
	 *  The amount of time into the future events are scheduled
	 */
	lookAhead: Seconds;

	/**
	 * private reference to the BaseAudioContext
	 */
	private readonly _context: BaseAudioContext;

	/**
	 * A reliable callback method
	 */
	private readonly _ticker: Ticker;

	/**
	 *  The default latency hint
	 */
	private _latencyHint: ContextLatencyHint | Seconds;

	/**
	 *  An object containing all of the constants AudioBufferSourceNodes
	 */
	private _constants = new Map<number, AudioBufferSourceNode>();

	/**
	 *  All of the setTimeout events.
	 */
	private _timeouts: Timeline<ContextTimeoutEvent>;

	/**
	 *  The timeout id counter
	 */
	private _timeoutIds = 0;

	constructor(context: BaseAudioContext) {
		super();

		this._context = context;

		const defaults = Context.getDefaults();
		this._latencyHint = defaults.latencyHint;
		this.lookAhead = defaults.lookAhead;
		this._timeouts = new Timeline();

		this._ticker = new Ticker(this.emit.bind(this, "tick"), defaults.clockSource, defaults.updateInterval);
		this.on("tick", this._timeoutLoop.bind(this));

		// fwd events from the context
		this._context.addEventListener("statechange", () => {
			this.emit("statechange", this.state);
		});
	}

	///////////////////////////////////////////////////////////////////////
	// BASE AUDIO CONTEXT METHODS
	///////////////////////////////////////////////////////////////////////

	createAnalyser(): AnalyserNode {
		return this._context.createAnalyser();
	}
	createOscillator(): OscillatorNode {
		return this._context.createOscillator();
	}
	createBufferSource(): AudioBufferSourceNode {
		return this._context.createBufferSource();
	}
	createBiquadFilter(): BiquadFilterNode {
		return this._context.createBiquadFilter();
	}
	createBuffer(numberOfChannels: number, length: number, sampleRate: number): AudioBuffer {
		return this._context.createBuffer(numberOfChannels, length, sampleRate);
	}
	createChannelMerger(numberOfInputs?: number | undefined): ChannelMergerNode {
		return this._context.createChannelMerger(numberOfInputs);
	}
	createChannelSplitter(numberOfOutputs?: number | undefined): ChannelSplitterNode {
		return this._context.createChannelSplitter(numberOfOutputs);
	}
	createConstantSource(): ConstantSourceNode {
		return this._context.createConstantSource();
	}
	createConvolver(): ConvolverNode {
		return this._context.createConvolver();
	}
	createDelay(maxDelayTime?: number | undefined): DelayNode {
		return this._context.createDelay(maxDelayTime);
	}
	createDynamicsCompressor(): DynamicsCompressorNode {
		return this._context.createDynamicsCompressor();
	}
	createGain(): GainNode {
		return this._context.createGain();
	}
	createIIRFilter(feedforward: number[], feedback: number[]): IIRFilterNode {
		return this._context.createIIRFilter(feedforward, feedback);
	}
	createPanner(): PannerNode {
		return this._context.createPanner();
	}
	createPeriodicWave(
		real: number[] | Float32Array,
		imag: number[] | Float32Array,
		constraints?: PeriodicWaveConstraints | undefined,
	): PeriodicWave {
		return this._context.createPeriodicWave(real, imag, constraints);
	}
	createStereoPanner(): StereoPannerNode {
		return this._context.createStereoPanner();
	}
	createWaveShaper(): WaveShaperNode {
		return this._context.createWaveShaper();
	}
	decodeAudioData(audioData: ArrayBuffer): Promise<AudioBuffer> {
		return this._context.decodeAudioData(audioData);
	}
	/**
	 *  The audio output destination. Alias for Tone.Master
	 */
	get destination(): AudioDestinationNode {
		return this._context.destination;
	}
	/**
	 *  The current time in seconds of the AudioContext.
	 */
	get currentTime(): Seconds {
		return this._context.currentTime;
	}
	/**
	 *  The current time in seconds of the AudioContext.
	 */
	get state(): AudioContextState {
		return this._context.state;
	}
	/**
	 *  The current time in seconds of the AudioContext.
	 */
	get sampleRate(): number {
		return this._context.sampleRate;
	}
	/**
	 *  The listener
	 */
	get listener(): AudioListener {
		return this._context.listener;
	}

	///////////////////////////////////////////////////////////////////////
	// TICKER
	///////////////////////////////////////////////////////////////////////

	/**
	 *  How often the interval callback is invoked.
	 *  This number corresponds to how responsive the scheduling
	 *  can be. context.updateInterval + context.lookAhead gives you the
	 *  total latency between scheduling an event and hearing it.
	 */
	get updateInterval(): Seconds {
		return this._ticker.updateInterval;
	}
	set updateInterval(interval: Seconds) {
		this._ticker.updateInterval = interval;
	}

	/**
	 *  What the source of the clock is, either "worker" (Web Worker [default]),
	 *  "timeout" (setTimeout), or "offline" (none).
	 */
	get clockSource(): TickerClockSource {
		return this._ticker.type;
	}
	set clockSource(type: TickerClockSource) {
		this._ticker.type = type;
	}

	/**
	 *  The type of playback, which affects tradeoffs between audio
	 *  output latency and responsiveness.
	 *
	 *  In addition to setting the value in seconds, the latencyHint also
	 *  accepts the strings "interactive" (prioritizes low latency),
	 *  "playback" (prioritizes sustained playback), "balanced" (balances
	 *  latency and performance), and "fastest" (lowest latency, might glitch more often).
	 *  @example
	 * //set the lookAhead to 0.3 seconds
	 * Tone.context.latencyHint = 0.3;
	 */
	get latencyHint(): ContextLatencyHint | Seconds {
		return this._latencyHint;
	}
	set latencyHint(hint: ContextLatencyHint | Seconds) {
		let lookAheadValue = 0;
		this._latencyHint = hint;
		if (isString(hint)) {
			switch (hint) {
				case "interactive":
					lookAheadValue = 0.1;
					break;
				case "playback":
					lookAheadValue = 0.8;
					break;
				case "balanced":
					lookAheadValue = 0.25;
					break;
				case "fastest":
					lookAheadValue = 0.01;
					break;
			}
		}
		this.lookAhead = lookAheadValue;
		this.updateInterval = lookAheadValue / 3;
	}

	/**
	 *  The unwrapped AudioContext.
	 */
	get rawContext(): BaseAudioContext {
		return this._context;
	}

	/**
	 *  The current audio context time
	 */
	now(): Seconds {
		return this._context.currentTime + this.lookAhead;
	}

	/**
	 *  Starts the audio context from a suspended state. This is required
	 *  to initially start the AudioContext.
	 */
	resume(): Promise<void> {
		if (this._context.state === "suspended" && this._context instanceof AudioContext) {
			return this._context.resume();
		} else {
			return Promise.resolve();
		}
	}

	/**
	 *  Promise which is invoked when the context is running.
	 *  Tries to resume the context if it's not started.
	 *  @return  {Promise}
	 */
	async close(): Promise<Context> {
		if (this._context instanceof AudioContext) {
			await this._context.close();
		}
		return this;
	}

	/**
	 *  Generate a looped buffer at some constant value.
	 */
	getConstant(val: number): AudioBufferSourceNode {
		if (this._constants.has(val)) {
			return this._constants.get(val) as AudioBufferSourceNode;
		} else {
			const buffer = this._context.createBuffer(1, 128, this._context.sampleRate);
			const arr = buffer.getChannelData(0);
			for (let i = 0; i < arr.length; i++) {
				arr[i] = val;
			}
			const constant = this._context.createBufferSource();
			constant.channelCount = 1;
			constant.channelCountMode = "explicit";
			constant.buffer = buffer;
			constant.loop = true;
			constant.start(0);
			this._constants.set(val, constant);
			return constant;
		}
	}

	/**
	 *  Clean up. Also closes the audio context.
	 */
	dispose(): Context {
		this._ticker.dispose();
		this._timeouts.dispose();
		Object.keys(this._constants).map(val => this._constants[val].disconnect());
		this.close();
		return this;
	}

	///////////////////////////////////////////////////////////////////////
	// TIMEOUTS
	///////////////////////////////////////////////////////////////////////

	/**
	 *  The private loop which keeps track of the context scheduled timeouts
	 *  Is invoked from the clock source
	 */
	private _timeoutLoop(): void  {
		const now = this.now();
		let firstEvent = this._timeouts.peek();
		while (this._timeouts.length && firstEvent && firstEvent.time <= now) {
			// invoke the callback
			firstEvent.callback();
			firstEvent = this._timeouts.peek();
			// shift the first event off
			this._timeouts.shift();
		}
	}

	/**
	 *  A setTimeout which is guarented by the clock source.
	 *  Also runs in the offline context.
	 *  @param  fn       The callback to invoke
	 *  @param  timeout  The timeout in seconds
	 *  @returns ID to use when invoking Context.clearTimeout
	 */
	setTimeout(fn: (...args: any[]) => void, timeout: Seconds): number {
		this._timeoutIds++;
		const now = this.now();
		this._timeouts.add({
			callback : fn,
			id : this._timeoutIds,
			time : now + timeout,
		});
		return this._timeoutIds;
	}

	/**
	 *  Clears a previously scheduled timeout with Tone.context.setTimeout
	 *  @param  id  The ID returned from setTimeout
	 */
	clearTimeout(id: number): Context {
		this._timeouts.forEach(event => {
			if (event.id === id) {
				this._timeouts.remove(event);
			}
		});
		return this;
	}
}
