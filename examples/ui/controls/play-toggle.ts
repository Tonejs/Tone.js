import "@material/web/icon/icon.js";
import "./button";

import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { Bindable, Startable } from "../bind";
import { icons } from "../styles";
import { buttonHeight } from "./button";

@customElement("tone-play-toggle")
export class TonePlayToggle extends LitElement implements Bindable<Startable> {
	@state()
	private _started = false;

	@property({ type: Boolean })
	disabled = false;

	static override styles = [
		icons,
		css`
			:host {
				display: block;
			}
			md-icon {
				--md-icon-size: ${buttonHeight};
				transition: color 0.1s;
			}
			tone-button:hover md-icon {
				color: white;
			}
		`,
	];

	/**
	 * Start and stop the target with the toggle
	 */
	bind(target: Startable) {
		this.addEventListener("start", () => target.start());
		this.addEventListener("stop", () => target.stop());
	}

	private _clicked(e: MouseEvent) {
		if (this.disabled) {
			return;
		}
		this._started = !this._started;
		e.stopPropagation();
		this.dispatchEvent(
			new CustomEvent(this._started ? "start" : "stop", {
				composed: true,
			})
		);
	}

	protected override render() {
		return html`
			<tone-button
				?disabled=${this.disabled}
				@click=${this._clicked}
				title=${this._started ? "Stop" : "Start"}
				aria-label=${this._started ? "Stop" : "Start"}
			>
				<md-icon>${!this._started ? "play_arrow" : "stop"}</md-icon>
			</tone-button>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-play-toggle": TonePlayToggle;
	}
}
