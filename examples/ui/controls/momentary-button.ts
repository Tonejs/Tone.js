import "./button";

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { Bindable, Startable, Triggerable } from "../bind";

@customElement("tone-momentary-button")
export class ToneMomentaryButton
	extends LitElement
	implements Bindable<Startable | Triggerable>
{
	@property({ type: Boolean })
	triggered = false;

	static override styles = css`
		:host {
			display: block;
		}
		tone-button {
			position: relative;
		}
		#ring {
			width: 18px;
			height: 18px;
			position: absolute;
			border-radius: 50%;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			border: 2px solid black;
			box-sizing: border-box;
			transition: all 0.1s;
		}
		#circle {
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%) scale(1.1);
			width: 100%;
			height: 100%;
			border-radius: 50%;
			transition: all 0.1s;
			background-color: black;
		}
		tone-button[triggered] #ring {
			width: 25px;
			height: 25px;
		}
		tone-button[triggered] #circle {
			width: 0px;
			height: 0px;
		}
		tone-button:hover #ring {
			border-color: white;
		}
		tone-button:hover #circle {
			background-color: white;
		}
	`;

	/**
	 * Start the target while the button is held down and stop it on release.
	 * Envelopes are attacked and released instead.
	 */
	bind(target: Startable | Triggerable) {
		if ("start" in target) {
			this.addEventListener("down", () => target.start());
			this.addEventListener("up", () => target.stop());
		} else {
			this.addEventListener("down", () => target.triggerAttack());
			this.addEventListener("up", () => target.triggerRelease());
		}
	}

	protected override render() {
		return html`
			<tone-button
				?triggered=${this.triggered}
				@down=${() => (this.triggered = true)}
				@up=${() => (this.triggered = false)}
			>
				<div id="ring">
					<div id="circle"></div>
				</div>
			</tone-button>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-momentary-button": ToneMomentaryButton;
	}
}
