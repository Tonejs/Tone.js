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
				margin: 0px;
				box-sizing: border-box;
				border: 2px solid #ddd;
				background-color: #ddd;
				width: 16px;
				height: 16px;
			}
			input:checked {
				background-color: black;
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
