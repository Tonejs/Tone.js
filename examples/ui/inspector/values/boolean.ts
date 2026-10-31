import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { live } from "lit/directives/live.js";

import { ToneValue } from "./value";

@customElement("tone-boolean")
export class ToneBooleanValue extends ToneValue<boolean> {
	@property({ type: Boolean })
	value = false;

	static override styles = [
		ToneValue.styles,
		css`
			input {
				flex: none;
				margin: 0px;
				padding: 0px;
				box-sizing: border-box;
				border: 1px solid #888;
				background-color: white;
				width: 12px;
				min-width: 0px;
				height: 12px;
				cursor: pointer;
			}
			input:checked {
				background-color: #444;
				box-shadow: inset 0 0 0 2px white;
			}
		`,
	];

	private _oninput(e: Event) {
		this.dispatchValue((e.target as HTMLInputElement).checked);
	}

	protected override render() {
		return html`
			<div id="container">
				<label for="check">${this.name}</label>
				<input
					class="focus-outline"
					@input=${this._oninput}
					id="check"
					type="checkbox"
					.checked=${live(this.value)}
				/>
			</div>
		`;
	}
}
