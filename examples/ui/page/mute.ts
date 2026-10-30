import "@material/web/icon/icon.js";

import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { getContext, getDestination, start } from "tone";

import { icons } from "../styles";

@customElement("tone-mute")
export class ToneMuteButton extends LitElement {
	@state()
	private _muted = false;

	@state()
	private _suspended = getContext().state === "suspended";

	static override styles = [
		icons,
		css`
			:host {
				display: flex;
			}

			button {
				appearance: none;
				border: none;
				background-color: transparent;
				padding: 4px;
				display: flex;
			}
			md-icon {
				cursor: pointer;
				color: black;
			}
			md-icon.muted {
				color: #ff4800;
			}
		`,
	];

	override connectedCallback() {
		super.connectedCallback();
		getContext().on("statechange", this._onStateChange);
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		getContext().off("statechange", this._onStateChange);
	}

	protected override updated(changed: PropertyValues) {
		if (changed.has("_muted")) {
			getDestination().mute = this._muted;
		}
	}

	private _onStateChange = () => {
		this._suspended = getContext().state === "suspended";
	};

	private async _clicked() {
		if (this._suspended) {
			await start();
		} else {
			this._muted = !this._muted;
		}
	}

	protected override render() {
		const silent = this._muted || this._suspended;
		return html`
			<button aria-label="mute" @click=${this._clicked}>
				<md-icon class=${classMap({ muted: silent })}>
					${silent ? "volume_off" : "volume_up"}
				</md-icon>
			</button>
		`;
	}
}
