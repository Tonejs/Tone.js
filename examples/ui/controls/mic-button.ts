import "@material/web/icon/icon.js";
import "./button";

import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import { UserMedia } from "tone";

import { Bindable } from "../bind";
import { icons } from "../styles";

@customElement("tone-mic-button")
export class ToneMicButton extends LitElement implements Bindable<UserMedia> {
	@state()
	private _open = false;

	@state()
	private _supported = false;

	static override styles = [
		icons,
		css`
			:host {
				display: block;
			}
			md-icon {
				margin-top: 4px;
			}
		`,
	];

	/**
	 * Open and close the microphone with the button
	 */
	bind(mic: UserMedia) {
		this._supported = UserMedia.supported;
		this.addEventListener("open", () => mic.open());
		this.addEventListener("close", () => mic.close());
	}

	protected override updated(changed: PropertyValues) {
		if (changed.has("_open") && changed.get("_open") !== undefined) {
			this.dispatchEvent(new CustomEvent(this._open ? "open" : "close"));
		}
	}

	private _clicked() {
		this._open = !this._open;
	}

	protected override render() {
		return html`
			<tone-button
				?disabled=${!this._supported}
				@click=${this._clicked}
				title=${this._open ? "Stop" : "Start"}
				aria-label=${this._open ? "Stop" : "Start"}
			>
				<md-icon>${!this._open ? "mic" : "mic_off"}</md-icon>
			</tone-button>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-mic-button": ToneMicButton;
	}
}
