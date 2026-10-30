import "./keyboard";
import "./midi-in";

import { css, html, LitElement } from "lit";
import { customElement, query } from "lit/decorators.js";

import { Bindable, defaultParent } from "../bind";
import { ToneKeyboard } from "./keyboard";

export interface NoteEvent {
	name: string;
	midi: number;
	velocity: number;
}

/**
 * An instrument, polyphonic instruments are released by note
 */
export interface PianoInstrument {
	triggerAttack(note: string, time?: number, velocity?: number): unknown;
	triggerRelease(noteOrTime?: string | number): unknown;
	releaseAll?(): unknown;
}

/**
 * An instrument or callbacks for each note event
 */
export type PianoTarget =
	| PianoInstrument
	| {
			noteon(note: NoteEvent): void;
			noteoff(note: NoteEvent): void;
	  };

@customElement("tone-piano")
export class TonePiano extends LitElement implements Bindable<PianoTarget> {
	@query("#container")
	private _container: HTMLDivElement;

	@query("tone-keyboard")
	private _keyboard: ToneKeyboard;

	static override styles = css`
		:host {
			display: block;
		}

		#container {
			background-color: var(--color-light-gray);
			position: relative;
			padding: 5px;
			display: block;
		}

		tone-keyboard {
			display: block;
			clear: both;
		}

		tone-midi-in {
			position: relative;
			top: 5px;
			right: 5px;
			display: inline-block;
			float: right;
		}
	`;

	/**
	 * Play the instrument with the keyboard
	 */
	bind(target: PianoTarget) {
		const { noteon, noteoff } =
			"noteon" in target ? target : this._instrumentCallbacks(target);
		this.addEventListener("noteon", (e: CustomEvent<NoteEvent>) =>
			noteon(e.detail)
		);
		this.addEventListener("noteoff", (e: CustomEvent<NoteEvent>) =>
			noteoff(e.detail)
		);
	}

	private _instrumentCallbacks(instrument: PianoInstrument) {
		const polyphonic = "releaseAll" in instrument;
		return {
			noteon: (note: NoteEvent) =>
				instrument.triggerAttack(note.name, undefined, note.velocity),
			noteoff: (note: NoteEvent) =>
				polyphonic
					? instrument.triggerRelease(note.name)
					: instrument.triggerRelease(),
		};
	}

	override connectedCallback() {
		super.connectedCallback();
		window.addEventListener("resize", this._resize);
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventListener("resize", this._resize);
	}

	protected override firstUpdated() {
		setTimeout(() => this._resize(), 100);
	}

	private _clamp(v: number, floor: number, ceil: number) {
		return Math.max(Math.min(v, ceil), floor);
	}

	private _scale(
		v: number,
		inMin: number,
		inMax: number,
		outMin: number,
		outMax: number
	) {
		return ((v - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
	}

	private _resize = () => {
		const width = this._container.clientWidth;
		const octaves = this._clamp(Math.floor(width / 100) - 1, 1, 8);
		this._keyboard.rootoctave = Math.ceil(this._scale(octaves, 1, 8, 5, 1));
		this._keyboard.octaves = octaves;
	};

	protected override render() {
		return html`
			<div id="container">
				<tone-midi-in></tone-midi-in>
				<tone-keyboard></tone-keyboard>
			</div>
		`;
	}
}

/**
 * Create a piano keyboard which plays the instrument
 */
export function piano(
	instrument: PianoTarget,
	parent: HTMLElement = defaultParent()
): TonePiano {
	const element = document.createElement("tone-piano");
	element.bind(instrument);
	parent.appendChild(element);
	return element;
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-piano": TonePiano;
	}
}
