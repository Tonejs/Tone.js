import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { live } from "lit/directives/live.js";

import { ToneValue } from "./value";

@customElement("tone-string")
export class ToneStringValue extends ToneValue<string> {
	@property({ type: String })
	value = "";

	private _onchange(e: Event) {
		this.dispatchValue((e.target as HTMLInputElement).value);
	}

	protected override render() {
		return html`
			<div id="container">
				<label for="string">${this.name}</label>
				<input
					class="focus-outline"
					@change=${this._onchange}
					id="string"
					type="text"
					.value=${live(this.value)}
				/>
			</div>
		`;
	}
}
