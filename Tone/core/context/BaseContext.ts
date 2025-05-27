import type { TransportClass as Transport } from "../clock/Transport.js";
import { Seconds } from "../type/Units.js";
import type { DrawClass as Draw } from "../util/Draw.js";
import { Emitter } from "../util/Emitter.js";
import { AnyAudioContext } from "./AudioContext.js";
import type { DestinationClass as Destination } from "./Destination.js";
import type { ListenerClass as Listener } from "./Listener.js";

// these are either not used in Tone.js or deprecated and not implemented.
export type ExcludedFromBaseAudioContext =
	| "onstatechange"
	| "addEventListener"
	| "removeEventListener"
	| "listener"
	| "dispatchEvent"
	| "audioWorklet"
	| "destination"
	| "createScriptProcessor";

// the subset of the BaseAudioContext which Tone.Context implements.
export type BaseAudioContextSubset = Omit<
	BaseAudioContext,
	ExcludedFromBaseAudioContext
>;

export type ContextLatencyHint = AudioContextLatencyCategory;

export abstract class BaseContext
	extends Emitter<"statechange" | "tick">
	implements BaseAudioContextSubset
{
	//---------------------------
	// BASE AUDIO CONTEXT METHODS
	//---------------------------
	abstract createAnalyser(): AnalyserNode;

	abstract createOscillator(): OscillatorNode;

	abstract createBufferSource(): AudioBufferSourceNode;

	abstract createBiquadFilter(): BiquadFilterNode;

	abstract createBuffer(
		_numberOfChannels: number,
		_length: number,
		_sampleRate: number
	): AudioBuffer;

	abstract createChannelMerger(
		_numberOfInputs?: number | undefined
	): ChannelMergerNode;

	abstract createChannelSplitter(
		_numberOfOutputs?: number | undefined
	): ChannelSplitterNode;

	abstract createConstantSource(): ConstantSourceNode;

	abstract createConvolver(): ConvolverNode;

	abstract createDelay(_maxDelayTime?: number | undefined): DelayNode;

	abstract createDynamicsCompressor(): DynamicsCompressorNode;

	abstract createGain(): GainNode;

	abstract createIIRFilter(
		_feedForward: number[] | Float32Array,
		_feedback: number[] | Float32Array
	): IIRFilterNode;

	abstract createPanner(): PannerNode;

	abstract createPeriodicWave(
		_real: number[] | Float32Array,
		_imag: number[] | Float32Array,
		_constraints?: PeriodicWaveConstraints | undefined
	): PeriodicWave;

	abstract createStereoPanner(): StereoPannerNode;

	abstract createWaveShaper(): WaveShaperNode;

	abstract createMediaStreamSource(
		_stream: MediaStream
	): MediaStreamAudioSourceNode;

	abstract createMediaElementSource(
		_element: HTMLMediaElement
	): MediaElementAudioSourceNode;

	abstract createMediaStreamDestination(): MediaStreamAudioDestinationNode;

	abstract decodeAudioData(_audioData: ArrayBuffer): Promise<AudioBuffer>;

	//---------------------------
	// TONE AUDIO CONTEXT METHODS
	//---------------------------

	abstract createAudioWorkletNode(
		_name: string,
		_options?: Partial<AudioWorkletNodeOptions>
	): AudioWorkletNode;

	abstract get rawContext(): AnyAudioContext;

	abstract addAudioWorkletModule(_url: string): Promise<void>;

	abstract lookAhead: number;

	abstract latencyHint: ContextLatencyHint | Seconds;

	abstract resume(): Promise<void>;

	abstract setTimeout(
		_fn: (...args: any[]) => void,
		_timeout: Seconds
	): number;

	abstract clearTimeout(_id: number): this;

	abstract setInterval(
		_fn: (...args: any[]) => void,
		_interval: Seconds
	): number;

	abstract clearInterval(_id: number): this;

	abstract getConstant(_val: number): AudioBufferSourceNode;

	abstract get currentTime(): Seconds;

	abstract get state(): AudioContextState;

	abstract get sampleRate(): number;

	abstract get listener(): Listener;

	abstract get transport(): Transport;

	abstract get draw(): Draw;

	abstract get destination(): Destination;

	abstract now(): Seconds;

	abstract immediate(): Seconds;

	/*
	 * This is a placeholder so that JSON.stringify does not throw an error
	 * This matches what JSON.stringify(audioContext) returns on a native
	 * audioContext instance.
	 */
	toJSON(): Record<string, any> {
		return {};
	}

	readonly isOffline: boolean = false;
}
