import "./keyboard";
import "./midi-in";

import { css, html, LitElement } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import { Bindable, defaultParent } from "../bind";
import { ToneKeyboard } from "./keyboard";

interface NoteEvent {
	name: string;
	midi: number;
	velocity: number;
}

/**
 * An instrument, polyphonic instruments are released by note
 */
interface PianoInstrument {
	triggerAttack(note: string, time?: number, velocity?: number): unknown;
	triggerRelease(noteOrTime?: string | number): unknown;
	releaseAll?(): unknown;
}

@customElement("tone-piano")
export class TonePiano extends LitElement implements Bindable<PianoInstrument> {
	@query("#container")
	private _container: HTMLDivElement;

	@query("tone-keyboard")
	private _keyboard: ToneKeyboard;

	/**
	 * The keyboard is hidden until it has its number of octaves
	 */
	@state()
	private _sized = false;

	static override styles = css`
		:host {
			display: block;
		}

		#container {
			position: relative;
			padding: 5px;
			display: block;
		}

		tone-keyboard {
			display: block;
			clear: both;
		}

		tone-keyboard:not(.sized) {
			visibility: hidden;
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
	bind(instrument: PianoInstrument) {
		const polyphonic = "releaseAll" in instrument;
		this.addEventListener("noteon", (e: CustomEvent<NoteEvent>) =>
			instrument.triggerAttack(
				e.detail.name,
				undefined,
				e.detail.velocity
			)
		);
		this.addEventListener("noteoff", (e: CustomEvent<NoteEvent>) =>
			polyphonic
				? instrument.triggerRelease(e.detail.name)
				: instrument.triggerRelease()
		);
	}

	/**
	 * Sizes the keyboard to the piano's width. The first callback comes
	 * after layout but before the first paint, so the keyboard is never
	 * shown with the wrong number of octaves.
	 */
	private _resizeObserver = new ResizeObserver(() => this._resize());

	override connectedCallback() {
		super.connectedCallback();
		this._resizeObserver.observe(this);
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this._resizeObserver.disconnect();
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

	private _resize() {
		if (!this._container) {
			return;
		}
		const width = this._container.clientWidth;
		const octaves = this._clamp(Math.floor(width / 100) - 1, 1, 8);
		this._keyboard.rootOctave = Math.ceil(this._scale(octaves, 1, 8, 5, 1));
		this._keyboard.octaves = octaves;
		this._sized = true;
	}

	protected override render() {
		return html`
			<div id="container">
				<tone-midi-in></tone-midi-in>
				<tone-keyboard
					class=${classMap({ sized: this._sized })}
				></tone-keyboard>
			</div>
		`;
	}
}

/**
 * Create a piano keyboard which plays the instrument
 */
export function piano(instrument: PianoInstrument): TonePiano {
	const element = document.createElement("tone-piano");
	element.bind(instrument);
	defaultParent().appendChild(element);
	return element;
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-piano": TonePiano;
	}
}
