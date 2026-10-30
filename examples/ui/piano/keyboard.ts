import "./octave";

import AudioKeys from "audiokeys";
import { css, html, LitElement } from "lit";
import { customElement, property, queryAll } from "lit/decorators.js";

import { ToneKeyboardNote } from "./note";
import { ToneKeyboardOctave } from "./octave";

@customElement("tone-keyboard")
export class ToneKeyboard extends LitElement {
	@property({ type: Number })
	rootOctave = 4;

	@property({ type: Number })
	octaves = 4;

	@queryAll("tone-keyboard-octave")
	private _octaves: NodeListOf<ToneKeyboardOctave>;

	private _computerKeyboard: AudioKeys;

	static override styles = css`
		#container {
			display: flex;
			background-color: white;
			height: 80px;
		}

		tone-keyboard-octave {
			flex-grow: 1;
		}
	`;

	constructor() {
		super();
		this._computerKeyboard = new AudioKeys({ polyphony: Infinity });
		this._computerKeyboard.down((e) => this._noteon(e.note));
		this._computerKeyboard.up((e) => this._noteoff(e.note));
	}

	private _getNoteByTouchId(id: number): ToneKeyboardNote | undefined {
		for (const octave of Array.from(this._octaves)) {
			const note = octave.getNoteByTouchId(id);
			if (note) {
				return note;
			}
		}
	}

	private _getOctave(midi: number): ToneKeyboardOctave | undefined {
		const octaveNumber = Math.floor(midi / 12);
		return Array.from(this._octaves).find((o) => o.octave === octaveNumber);
	}

	private _touchmove(event: TouchEvent) {
		Array.from(event.changedTouches).forEach((e) => {
			const activeNote = this._getNoteByTouchId(e.identifier);
			const element = this.shadowRoot.elementFromPoint(
				e.clientX,
				e.clientY
			);
			if (element && element.shadowRoot) {
				const note = element.shadowRoot.elementFromPoint(
					e.clientX,
					e.clientY
				) as ToneKeyboardNote | undefined;
				if (note && note.note && activeNote.note !== note.note) {
					activeNote.active = false;
					activeNote.touchId = -1;
					note.active = true;
					note.touchId = e.identifier;
				}
			}
		});
	}

	private _touchend(event: TouchEvent) {
		Array.from(event.changedTouches).forEach((e) => {
			const activeNote = this._getNoteByTouchId(e.identifier);
			if (activeNote && activeNote.active) {
				activeNote.active = false;
				activeNote.touchId = -1;
			}
		});
	}

	private _noteon(midi: number) {
		this._getOctave(midi)?.noteon(midi);
	}

	private _noteoff(midi: number) {
		this._getOctave(midi)?.noteoff(midi);
	}

	protected override render() {
		const octaves = Array.from(
			{ length: this.octaves },
			(_, i) => i + this.rootOctave
		);
		return html`
			<div
				id="container"
				@touchmove=${this._touchmove}
				@touchend=${this._touchend}
			>
				${octaves.map(
					(o) => html`
						<tone-keyboard-octave
							octave=${o}
						></tone-keyboard-octave>
					`
				)}
			</div>
		`;
	}
}
