import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { loaded, ToneAudioBuffer } from "tone";

@customElement("tone-loader")
export class ToneLoader extends LitElement {
	@property({ type: Boolean })
	loading = false;

	@state()
	private _dots = 0;

	static override styles = css`
		#container {
			position: fixed;
			width: 100%;
			height: 100%;
			background-color: rgba(55, 55, 55, 0.5);
			z-index: 10000000;
			top: 0px;
			left: 0px;
			right: 0px;
			bottom: 0px;
			pointer-events: none;
			transition: opacity 0.2s;
			opacity: 0;
		}
		#container[loading] {
			opacity: 1;
		}

		#text {
			position: absolute;
			top: 50%;
			left: 50%;
			color: white;
			font-size: 2em;
			width: 100px;
			transform: translate(-50%, -50%);
		}
	`;

	protected override firstUpdated() {
		window.addEventListener(
			"load",
			() => {
				this.loading = ToneAudioBuffer.downloads.length > 0;
				if (this.loading) {
					loaded().then(() => {
						this.loading = false;
					});
					this._dotLoop();
				}
			},
			{ once: true }
		);
	}

	private _dotLoop() {
		if (this.loading) {
			this._dots = (this._dots + 1) % 4;
			setTimeout(() => this._dotLoop(), 500);
		}
	}

	protected override render() {
		return html`
			<div id="container" ?loading=${this.loading}>
				<div id="text">loading${".".repeat(this._dots)}</div>
			</div>
		`;
	}
}
