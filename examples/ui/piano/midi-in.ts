import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import WebMidi, { InputEventNoteoff, InputEventNoteon } from "webmidi";

@customElement("tone-midi-in")
export class ToneMidiIn extends LitElement {
	@state()
	private _connected = false;

	@state()
	private _flashing = false;

	private _flashTimeout: ReturnType<typeof setTimeout>;

	static override styles = css`
		:host {
			display: block;
		}

		#container {
			display: block;
			margin-bottom: 10px;
			position: relative;
		}
		label {
			margin-right: 5px;
			font-size: 0.7em;
		}

		select,
		label {
			display: inline-block;
		}

		#light {
			width: 10px;
			height: 10px;
			background-color: white;
			display: inline-block;
		}
		#light.connected {
			background-color: #aaa;
		}

		#light.connected.flash {
			background-color: black !important;
		}
	`;

	constructor() {
		super();
		WebMidi.enable((err) => {
			if (!err) {
				WebMidi.addListener("connected", (e) => {
					if (e.port.type === "input") {
						this.requestUpdate();
					}
				});
				WebMidi.addListener("disconnected", () => {
					this.requestUpdate();
				});
			}
		});
	}

	private _flash() {
		clearTimeout(this._flashTimeout);
		this._flashing = true;
		this._flashTimeout = setTimeout(() => (this._flashing = false), 100);
	}

	private _dispatchNote(
		eventName: "noteon" | "noteoff",
		e: InputEventNoteon | InputEventNoteoff
	) {
		this._flash();
		this.dispatchEvent(
			new CustomEvent(eventName, {
				detail: {
					name: `${e.note.name}${e.note.octave}`,
					midi: e.note.number,
					velocity: e.velocity,
				},
				composed: true,
				bubbles: true,
			})
		);
	}

	private _connectMidi(event: Event) {
		const id = (event.target as HTMLSelectElement).value;
		this._connected = id !== "none";
		if (!this._connected) {
			return;
		}
		const input = WebMidi.getInputById(id);
		if (input) {
			input.addListener("noteon", "all", (e) =>
				this._dispatchNote("noteon", e)
			);
			input.addListener("noteoff", "all", (e) =>
				this._dispatchNote("noteoff", e)
			);
			input.addListener("controlchange", "all", () => this._flash());
		}
	}

	protected override render() {
		if (!WebMidi.supported) {
			return nothing;
		}
		const lightClasses = {
			connected: this._connected,
			flash: this._flashing,
		};
		return html`
			<div id="container">
				<div id="light" class=${classMap(lightClasses)}></div>
				<label>MIDI IN:</label>
				<select @change=${this._connectMidi}>
					<option value="none">none</option>
					${WebMidi.inputs.map(
						(input) => html`
							<option value=${input.id}>${input.name}</option>
						`
					)}
				</select>
			</div>
		`;
	}
}
