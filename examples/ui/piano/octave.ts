import "./note";

import { css, html, LitElement } from "lit";
import { customElement, property, queryAll } from "lit/decorators.js";

import { ToneKeyboardNote } from "./note";

@customElement("tone-keyboard-octave")
export class ToneKeyboardOctave extends LitElement {
	@property({ type: Number })
	octave = 1;

	@queryAll("tone-keyboard-note")
	private _notes: NodeListOf<ToneKeyboardNote>;

	static override styles = css`
		#container {
			display: block;
			position: relative;
			height: 100%;
			width: 100%;
		}
		tone-keyboard-note {
			order: 0;
			flex-grow: 1;
		}

		#white-notes {
			position: absolute;
			left: 0px;
			top: 0px;
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: row;
		}

		#black-notes {
			position: absolute;
			top: 0px;
			width: 100%;
			display: flex;
			flex-direction: row;
			height: 55%;
		}

		#black-notes tone-keyboard-note:first-child,
		#black-notes tone-keyboard-note:last-child {
			flex-grow: 0.5;
			pointer-events: none;
		}
	`;

	noteon(midi: number) {
		this._getNote(midi).active = true;
	}

	noteoff(midi: number) {
		this._getNote(midi).active = false;
	}

	getNoteByTouchId(id: number): ToneKeyboardNote | undefined {
		return Array.from(this._notes).find((n) => n.touchid === id && n.note);
	}

	private _getNote(midi: number): ToneKeyboardNote {
		return Array.from(this._notes).find((n) => n.note === midi);
	}

	protected override render() {
		const startNote = 12 * this.octave;
		const whiteNotes = [0, 2, 4, 5, 7, 9, 11].map((i) => i + startNote);
		const blackNotes = [0, 1, 3, 0, 6, 8, 10, 0].map((i) =>
			i ? i + startNote : 0
		);
		return html`
			<div id="container">
				<div id="white-notes">
					${whiteNotes.map(
						(note) => html`
							<tone-keyboard-note
								color="#aaa"
								note=${note}
							></tone-keyboard-note>
						`
					)}
				</div>
				<div id="black-notes">
					${blackNotes.map(
						(note) => html`
							<tone-keyboard-note
								color="black"
								note=${note}
							></tone-keyboard-note>
						`
					)}
				</div>
			</div>
		`;
	}
}
