import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { start } from "tone";

import { Bindable } from "../bind";
import { focusOutline } from "../styles";

export const buttonHeight = css`30px`;

@customElement("tone-button")
export class ToneButton extends LitElement implements Bindable<() => void> {
	@property({ type: Boolean })
	pressed = false;

	@property({ type: Boolean })
	disabled = false;

	static override styles = [
		focusOutline,
		css`
			:host {
				display: block;
			}
			button {
				display: block;
				width: 100%;
				cursor: pointer;
				appearance: none;
				-webkit-appearance: none;
				height: ${buttonHeight};
				box-shadow:
					0 1px 3px rgba(0, 0, 0, 0.12),
					0 1px 2px rgba(0, 0, 0, 0.24);
				transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
				border: none;
				font-size: 1em;
				overflow: hidden;
				background-color: #ddd;
			}
			button:hover {
				background-color: #f0f;
				box-shadow:
					0 3px 6px rgba(255, 0, 255, 0.16),
					0 3px 6px rgba(255, 0, 255, 0.23);
				color: white;
			}
			button:active {
				background-color: #f0f;
				color: white;
			}
			button:disabled {
				opacity: 0.5;
				pointer-events: none;
				color: #777;
			}
			::slotted(*) {
				pointer-events: none;
			}
		`,
	];

	/**
	 * Invoke the callback when the button is clicked
	 */
	bind(callback: () => void) {
		this.addEventListener("click", () => {
			if (!this.disabled) {
				callback();
			}
		});
	}

	protected override updated(changed: PropertyValues<this>) {
		if (changed.has("pressed")) {
			this.dispatchEvent(
				new CustomEvent(this.pressed ? "down" : "up", {
					composed: true,
				})
			);
		}
	}

	private _mousedown(e: MouseEvent | TouchEvent) {
		start();
		if (e.type === "touchstart") {
			e.preventDefault();
		}
		this.pressed = true;
	}

	private _release() {
		this.pressed = false;
	}

	private _keydown(e: KeyboardEvent) {
		start();
		if (e.key === " " || e.key === "Enter") {
			this.pressed = true;
		}
	}

	private _keyup(e: KeyboardEvent) {
		if (e.key === " " || e.key === "Enter") {
			this.pressed = false;
		}
	}

	protected override render() {
		return html`
			<button
				class="focus-outline"
				?disabled=${this.disabled}
				@keydown=${this._keydown}
				@keyup=${this._keyup}
				@mousedown=${this._mousedown}
				@touchstart=${this._mousedown}
				@mouseup=${this._release}
				@touchend=${this._release}
				aria-label="Trigger"
				aria-pressed=${this.pressed ? "true" : "false"}
			>
				<slot></slot>
			</button>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-button": ToneButton;
	}
}
