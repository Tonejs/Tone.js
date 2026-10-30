import "@material/web/icon/icon.js";
import "./button";

import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { UserMedia } from "tone";

import { Bindable } from "../bind";
import { icons } from "../styles";

@customElement("tone-mic-button")
export class ToneMicButton extends LitElement implements Bindable<UserMedia> {
	@property({ type: Boolean })
	open = false;

	@property({ type: Boolean })
	supported = false;

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
		this.supported = UserMedia.supported;
		this.addEventListener("open", () => mic.open());
		this.addEventListener("close", () => mic.close());
	}

	protected override updated(changed: PropertyValues<this>) {
		if (changed.has("open") && changed.get("open") !== undefined) {
			this.dispatchEvent(new CustomEvent(this.open ? "open" : "close"));
		}
	}

	private _clicked() {
		this.open = !this.open;
	}

	protected override render() {
		return html`
			<tone-button
				?disabled=${!this.supported}
				@click=${this._clicked}
				title=${this.open ? "Stop" : "Start"}
				aria-label=${this.open ? "Stop" : "Start"}
			>
				<md-icon>${!this.open ? "mic" : "mic_off"}</md-icon>
			</tone-button>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-mic-button": ToneMicButton;
	}
}
