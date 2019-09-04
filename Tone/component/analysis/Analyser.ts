import { ToneAudioNode, ToneAudioNodeOptions } from "../../core/context/ToneAudioNode";
import { NormalRange, PowerOfTwo } from "../../core/type/Units";
import { optionsFromArguments } from "../../core/util/Defaults";

type AnalyserType = "fft" | "waveform";

interface AnalyserOptions extends ToneAudioNodeOptions {
	size: PowerOfTwo;
	type: AnalyserType;
	smoothing: NormalRange;
}

/**
 * Wrapper around the native Web Audio's [AnalyserNode](http://webaudio.github.io/web-audio-api/#idl-def-AnalyserNode).
 * Extracts FFT or Waveform data from the incoming signal.
 * @category Component
 */
export class Analyser extends ToneAudioNode<AnalyserOptions> {

		readonly name: string = "Analyser";

	input: AnalyserNode;
	output: AnalyserNode;

	/**
	 *  The analyser node.
	 */
	private _analyser = this.context.createAnalyser();

	/**
	 *  The analysis type
	 */
	private _type!: AnalyserType;

	/**
	 *  The buffer that the FFT data is written to
	 */
	private _buffer!: Float32Array;

	/**
	 * @param type The return type of the analysis, either "fft", or "waveform".
	 * @param size The size of the FFT. This must be a power of two in the range 16 to 16384.
	 */
	constructor(type?: AnalyserType, size?: number);
	constructor(options?: Partial<AnalyserOptions>);
	constructor() {
		super(optionsFromArguments(Analyser.getDefaults(), arguments, ["type", "size"]));
		const options = optionsFromArguments(Analyser.getDefaults(), arguments, ["type", "size"]);
		// set the values initially
		this.size = options.size;
		this.type = options.type;
		this.input = this.output = this._analyser;
	}

	static getDefaults(): AnalyserOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			size: 1024,
			smoothing: 0.8,
			type: "fft" as AnalyserType,
		});
	}

	/**
	 *  Run the analysis given the current settings and return the
	 */
	getValue(): Float32Array {
		if (this._type === "fft") {
			this._analyser.getFloatFrequencyData(this._buffer);
		} else if (this._type === "waveform") {
			this._analyser.getFloatTimeDomainData(this._buffer);
		}
		return this._buffer;
	}

	/**
	 *  The size of analysis. This must be a power of two in the range 16 to 16384.
	 */
	get size(): PowerOfTwo {
		return this._analyser.frequencyBinCount;
	}
	set size(size: PowerOfTwo) {
		this._analyser.fftSize = size * 2;
		this._buffer = new Float32Array(size);
	}

	/**
	 *  The analysis function returned by analyser.getValue(), either "fft" or "waveform".
	 */
	get type(): AnalyserType {
		return this._type;
	}
	set type(type: AnalyserType) {
		this.assert(type === "waveform" || type === "fft", `Analyser: invalid type: ${type}`);
		this._type = type;
	}

	/**
	 *  0 represents no time averaging with the last analysis frame.
	 */
	get smoothing(): NormalRange {
		return this._analyser.smoothingTimeConstant;
	}

	set smoothing(val: NormalRange) {
		this._analyser.smoothingTimeConstant = val;
	}

	/**
	 *  Clean up.
	 */
	dispose(): this {
		super.dispose();
		this._analyser.disconnect();
		return this;
	}
}
