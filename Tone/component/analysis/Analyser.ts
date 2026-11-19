import { Gain } from "../../core/context/Gain.js";
import {
	InputNode,
	OutputNode,
	ToneAudioNode,
	ToneAudioNodeOptions,
} from "../../core/context/ToneAudioNode.js";
import { Decibels, NormalRange, PowerOfTwo } from "../../core/type/Units.js";
import { assert, assertRange } from "../../core/util/Debug.js";
import { optionsFromArguments } from "../../core/util/Defaults.js";
import { Split } from "../channel/Split.js";

export type AnalyserType = "fft" | "waveform";

export interface AnalyserOptions<ChannelCount extends number>
	extends ToneAudioNodeOptions {
	size: PowerOfTwo;
	type: AnalyserType;
	smoothing: NormalRange;
	channels: ChannelCount;
	minDecibels: Decibels;
	maxDecibels: Decibels;
}

/**
 * Wrapper around the native Web Audio's [AnalyserNode](http://webaudio.github.io/web-audio-api/#idl-def-AnalyserNode).
 * Extracts FFT or Waveform data from the incoming signal.
 * @category Component
 */
export class Analyser<ChannelCount extends number = 1> extends ToneAudioNode<
	AnalyserOptions<ChannelCount>
> {
	readonly name: string = "Analyser";

	readonly input: InputNode;
	readonly output: OutputNode;

	/**
	 * The analyser node.
	 */
	private _analyzers: AnalyserNode[] = [];

	/**
	 * Input and output are a gain node
	 */
	private _gain: Gain;

	/**
	 * The channel splitter node
	 */
	private _split: Split;

	/**
	 * The analysis type
	 */
	private _type!: AnalyserType;

	/**
	 * The buffer that the FFT data is written to
	 */
	private _buffers: Float32Array[] = [];

	/**
	 * @param type The return type of the analysis, either "fft", or "waveform".
	 * @param size The size of the FFT. This must be a power of two in the range 16 to 16384.
	 */
	constructor(type?: AnalyserType, size?: number);
	constructor(options?: Partial<AnalyserOptions<ChannelCount>>);
	constructor() {
		const options = optionsFromArguments(
			Analyser.getDefaults(),
			arguments,
			["type", "size"]
		);
		super(options);

		this.input =
			this.output =
			this._gain =
				new Gain({ context: this.context });
		this._split = new Split({
			context: this.context,
			channels: options.channels,
		});
		this.input.connect(this._split);

		assertRange(options.channels, 1);

		// create the analyzers
		for (let channel = 0; channel < options.channels; channel++) {
			this._analyzers[channel] = this.context.createAnalyser();
			this._split.connect(this._analyzers[channel], channel, 0);
		}

		// set the values initially
		this.size = options.size;
		this.type = options.type;
		this.smoothing = options.smoothing;
		// minDecibels has to stay below maxDecibels after each assignment,
		// so raise maxDecibels first when the new range is above the current one
		this.maxDecibels = Math.max(options.maxDecibels, this.maxDecibels);
		this.minDecibels = options.minDecibels;
		this.maxDecibels = options.maxDecibels;
	}

	static getDefaults(): AnalyserOptions<1> {
		return Object.assign(ToneAudioNode.getDefaults(), {
			size: 1024,
			smoothing: 0.8,
			type: "fft" as AnalyserType,
			channels: 1 as const,
			minDecibels: -100,
			maxDecibels: -30,
		});
	}

	/**
	 * Run the analysis given the current settings. If {@link channels} = 1,
	 * it will return a Float32Array. If {@link channels} > 1, it will
	 * return an array of Float32Arrays where each index in the array
	 * represents the analysis done on a channel.
	 */
	getValue(): ChannelCount extends 1 ? Float32Array : Float32Array[] {
		this._analyzers.forEach((analyser, index) => {
			const buffer = this._buffers[index];
			if (this._type === "fft") {
				analyser.getFloatFrequencyData(buffer);
			} else if (this._type === "waveform") {
				analyser.getFloatTimeDomainData(buffer);
			}
		});
		if (this.channels === 1) {
			return this._buffers[0] as ChannelCount extends 1
				? Float32Array
				: Float32Array[];
		} else {
			return this._buffers as ChannelCount extends 1
				? Float32Array
				: Float32Array[];
		}
	}

	/**
	 * The size of analysis. This must be a power of two in the range 16 to 16384.
	 */
	get size(): PowerOfTwo {
		return this._analyzers[0].frequencyBinCount;
	}
	set size(size: PowerOfTwo) {
		this._analyzers.forEach((analyser, index) => {
			analyser.fftSize = size * 2;
			this._buffers[index] = new Float32Array(size);
		});
	}

	/**
	 * The number of channels the analyser does the analysis on. Channel
	 * separation is done using {@link Split}
	 */
	get channels(): ChannelCount {
		return this._analyzers.length as ChannelCount;
	}

	/**
	 * The analysis function returned by analyser.getValue(), either "fft" or "waveform".
	 */
	get type(): AnalyserType {
		return this._type;
	}
	set type(type: AnalyserType) {
		assert(
			type === "waveform" || type === "fft",
			`Analyser: invalid type: ${type}`
		);
		this._type = type;
	}

	/**
	 * 0 represents no time averaging with the last analysis frame.
	 */
	get smoothing(): NormalRange {
		return this._analyzers[0].smoothingTimeConstant;
	}
	set smoothing(val: NormalRange) {
		this._analyzers.forEach((a) => (a.smoothingTimeConstant = val));
	}

	/**
	 * The lowest value in decibels of the analyser's FFT range, -100 by default.
	 * Sets [minDecibels](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/minDecibels)
	 * on the AnalyserNode of each channel. Must be less than {@link maxDecibels}.
	 * The native node uses this range when it scales the frequency data to bytes.
	 * The decibel values returned by {@link getValue} are not clamped to it.
	 */
	get minDecibels(): Decibels {
		return this._analyzers[0].minDecibels;
	}
	set minDecibels(min: Decibels) {
		assert(
			min < this.maxDecibels,
			`Analyser: minDecibels (${min}) must be less than maxDecibels (${this.maxDecibels})`
		);
		this._analyzers.forEach((a) => (a.minDecibels = min));
	}

	/**
	 * The highest value in decibels of the analyser's FFT range, -30 by default.
	 * Sets [maxDecibels](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/maxDecibels)
	 * on the AnalyserNode of each channel. Must be greater than {@link minDecibels}.
	 */
	get maxDecibels(): Decibels {
		return this._analyzers[0].maxDecibels;
	}
	set maxDecibels(max: Decibels) {
		assert(
			max > this.minDecibels,
			`Analyser: maxDecibels (${max}) must be greater than minDecibels (${this.minDecibels})`
		);
		this._analyzers.forEach((a) => (a.maxDecibels = max));
	}

	/**
	 * Clean up.
	 */
	dispose(): this {
		super.dispose();
		this._analyzers.forEach((a) => a.disconnect());
		this._split.dispose();
		this._gain.dispose();
		return this;
	}
}
