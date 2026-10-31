import { css, CSSResultGroup, LitElement } from "lit";
import { property } from "lit/decorators.js";

import { focusOutline, font, monoFont } from "../../styles";

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
				font-family: ${font};
				display: flex;
				align-items: center;
			}
			/* the values all start at the same point */
			label {
				padding-left: 6px;
				flex: 0 0 60%;
				box-sizing: border-box;
				min-width: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			input {
				font-family: ${monoFont};
				/* Geist Mono is larger than Hanken Grotesk at the same size, this matches their x-heights */
				font-size: 0.93em;
				-webkit-appearance: none;
				appearance: none;
				border: 0px;
				text-align: left;
				background-color: transparent;
				padding: 0px 2px;
				width: 6em;
				min-width: 2ch;
				max-width: 40%;
			}
			/* only as wide as the value, where field-sizing is supported */
			@supports (field-sizing: content) {
				input {
					field-sizing: content;
					width: auto;
				}
			}
		`,
	];

	protected dispatchValue(value: T) {
		this.value = value;
		this.dispatchEvent(new CustomEvent("value", { detail: value }));
	}
}
