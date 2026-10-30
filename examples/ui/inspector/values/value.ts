import { css, CSSResultGroup, LitElement } from "lit";
import { property } from "lit/decorators.js";

import { contentFont, focusOutline } from "../../styles";

/**
 * Base class for the editors of a single value. Editors emit a "value"
 * event when changed, the owner decides what the value ends up being.
 */
export abstract class ToneValue<T> extends LitElement {
	@property({ type: String })
	name: string;

	abstract value: T;

	static override styles: CSSResultGroup = [
		focusOutline,
		css`
			#container {
				width: 100%;
				font-size: 14px;
				font-family: ${contentFont};
			}
			label {
				padding-left: 6px;
			}
			input {
				font-family: inherit;
				font-size: inherit;
				-webkit-appearance: none;
				appearance: none;
				border: 0px;
				text-align: right;
				float: right;
				background-color: transparent;
			}
		`,
	];

	protected dispatchValue(value: T) {
		this.value = value;
		this.dispatchEvent(new CustomEvent("value", { detail: value }));
	}
}
