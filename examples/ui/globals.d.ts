/**
 * The globals which tone-ui.js adds to the example pages
 */
import type * as ToneModule from "tone";

type Node = ToneModule.ToneAudioNode;

interface NodeOptions {
	name?: string;
}

interface Folder extends HTMLElement {
	add(tone: Node, options?: NodeOptions): this;
}

interface Drawer extends Folder {
	folder(name: string): Folder;
}

interface PianoInstrument {
	triggerAttack(note: string, time?: number, velocity?: number): unknown;
	triggerRelease(noteOrTime?: string | number): unknown;
}

interface SliderPadPosition {
	x: number;
	y: number;
}

/**
 * What each kind of element can be bound to
 */
type BindTarget =
	// tone-play-toggle and tone-momentary-button
	| { start(): unknown; stop(): unknown }
	// tone-momentary-button
	| { triggerAttack(): unknown; triggerRelease(): unknown }
	// tone-slider
	| ToneModule.Param<any>
	| ToneModule.Signal<any>
	| ((value: number) => void)
	// tone-button
	| (() => void)
	// tone-mic-button
	| ToneModule.UserMedia
	// tone-step-sequencer
	| ((time: number, row: number) => void)
	// tone-slider-pad
	| {
			down?(position: SliderPadPosition): void;
			move?(position: SliderPadPosition): void;
			up?(position: SliderPadPosition): void;
	  }
	// tone-piano
	| PianoInstrument;

declare global {
	const Tone: typeof ToneModule;
	function bind(selector: string | Element, target: BindTarget): Element;
	function ui(tone: Node, options?: NodeOptions): HTMLElement;
	function drawer(): Drawer;
	function piano(instrument: PianoInstrument): HTMLElement;
	function meter(tone: ToneModule.Meter<number>): HTMLElement;
	function fft(tone: ToneModule.FFT): HTMLElement;
	function waveform(tone: ToneModule.Waveform): HTMLElement;
}
