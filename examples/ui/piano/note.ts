import { css, html, LitElement, nothing, PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { Midi } from "tone";

@customElement("tone-keyboard-note")
export class ToneKeyboardNote extends LitElement {
	@property({ type: Number })
	note: number;

	@property({ type: String })
	color = "#eee";

	@property({ type: Boolean })
	active = false;

	@property({ type: Number })
	touchId = -1;

	@query("button")
	private _button: HTMLButtonElement;

	static override styles = css`
		:host {
			display: block;
		}

		#container {
			width: 100%;
			height: 100%;
			display: block;
		}
		#container:not([show]) {
			opacity: 0;
			margin: 2px;
			pointer-events: none;
		}

		button {
			appearance: none;
			width: 100%;
			height: 100%;
			border: 2px solid white;
			box-sizing: border-box;
			padding: 0;
			outline: none;
			transition: background-color 0.2s;
			color: transparent;
			font-size: 0px;
			border-radius: 2px;
		}
		/* overrides the key color of the inline style */
		button[active] {
			background-color: #666 !important;
			transition-duration: 0s;
		}
		button:focus {
			border-color: #666;
		}
	`;

	protected override updated(changed: PropertyValues<this>) {
		if (changed.has("active") && changed.get("active") !== undefined) {
			const eventName = this.active ? "noteon" : "noteoff";
			if (!this.active) {
				this.touchId = -1;
			}
			this.dispatchEvent(
				new CustomEvent(eventName, {
					detail: {
						name: this._fromMidi(this.note),
						midi: this.note,
						velocity: this.active ? 1 : 0,
					},
					composed: true,
					bubbles: true,
				})
			);
		}
	}

	private _fromMidi(midi: number): string {
		return Midi(midi).toNote();
	}

	private _mouseover(e: MouseEvent) {
		if (e.buttons) {
			this.active = true;
			this._button.focus();
		}
	}

	private _keydown(e: KeyboardEvent) {
		if (!e.repeat && (e.key === " " || e.key === "Enter")) {
			this.active = true;
		}
	}

	private _keyup(e: KeyboardEvent) {
		if (e.key === " " || e.key === "Enter") {
			this.active = false;
		}
	}

	private _touchstart(e: TouchEvent) {
		e.preventDefault();
		this.touchId = e.touches[0].identifier;
		this.active = true;
	}

	private _press() {
		this.active = true;
	}

	private _release() {
		this.active = false;
	}

	protected override render() {
		const show = this.note !== 0;
		const buttonStyle = { backgroundColor: this.color };
		return html`
			<div id="container" ?show=${show}>
				${show
					? html`<button
							?active=${this.active}
							@mouseover=${this._mouseover}
							@mouseleave=${this._release}
							@mousedown=${this._press}
							@touchstart=${this._touchstart}
							@touchend=${this._release}
							@mouseup=${this._release}
							@keydown=${this._keydown}
							@keyup=${this._keyup}
							style=${styleMap(buttonStyle)}
						>
							${this._fromMidi(this.note).replace("#", "♯")}
						</button>`
					: nothing}
			</div>
		`;
	}
}
