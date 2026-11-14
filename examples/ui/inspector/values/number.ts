import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { live } from "lit/directives/live.js";

import { blue, green, orange, purple } from "../../styles";
import { DisplayUnit, isNotation } from "../units";
import { ToneValue } from "./value";

@customElement("tone-number")
export class ToneNumberValue extends ToneValue<number | string> {
	@property({ type: Number })
	value: number | string = 0;

	/**
	 * Shown after the value, which is displayed multiplied by its scale
	 */
	@property({ attribute: false })
	unit: DisplayUnit | undefined;

	private _alt = false;
	private _shift = false;
	private _dragging = false;
	private _dragstartValue: number;

	static override styles = [
		ToneValue.styles,
		css`
			/* a few kinds of values are colored, the rest are black */
			input.time {
				color: ${purple};
			}
			input.frequency {
				color: ${blue};
			}
			input.decibels {
				color: ${orange};
			}
			input.normalRange {
				color: ${green};
			}
			#unit {
				padding-left: 4px;
				color: #888;
				white-space: nowrap;
			}
		`,
	];

	private get _scale(): number {
		return this.unit?.scale ?? 1;
	}

	/**
	 * The value in the displayed unit
	 */
	private get _displayValue(): number {
		return Number(this.value) * this._scale;
	}

	/**
	 * Set the value from one in the displayed unit
	 */
	private _dispatchDisplayValue(value: number) {
		this.dispatchValue(value / this._scale);
	}

	override connectedCallback() {
		super.connectedCallback();
		window.addEventListener("mousemove", this._onWindowMousemove);
		window.addEventListener("keydown", this._onModifierKey);
		window.addEventListener("keyup", this._onModifierKey);
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventListener("mousemove", this._onWindowMousemove);
		window.removeEventListener("keydown", this._onModifierKey);
		window.removeEventListener("keyup", this._onModifierKey);
	}

	private _beautifyValue(val: number): number {
		const float = val.toString().split(".")[1];
		return parseFloat(val.toFixed(Math.min(float && float.length, 4)));
	}

	private _onWindowMousemove = (e: MouseEvent) => {
		if (this._dragging) {
			e.preventDefault();
			// find the relative change
			const box = this.getBoundingClientRect();
			const yDiff = box.top + (box.bottom - box.top) / 2 - e.clientY;
			this._dispatchDisplayValue(
				this._dragstartValue +
					Math.floor(yDiff / 10) * this._stepMultiplier()
			);
		}
	};

	private _onModifierKey = (e: KeyboardEvent) => {
		this._alt = e.altKey;
		this._shift = e.shiftKey;
	};

	private _stepMultiplier(): number {
		if (this._shift) {
			return this._alt ? 0.01 : 10;
		} else {
			return this._alt ? 0.1 : 1;
		}
	}

	private _onchange(e: Event) {
		const text = (e.target as HTMLInputElement).value.trim();
		const value = Number(text);
		if (text !== "" && isFinite(value)) {
			this._dispatchDisplayValue(value);
		} else if (this.unit && isNotation(this.unit.units, text)) {
			// e.g. "4n" for a time or "C4" for a frequency, which Tone converts
			this.dispatchValue(text);
		} else {
			this.requestUpdate();
		}
	}

	private _onkeydown(e: KeyboardEvent) {
		let direction = 0;
		if (e.key === "ArrowUp") {
			direction = 1;
		} else if (e.key === "ArrowDown") {
			direction = -1;
		}
		if (direction) {
			e.preventDefault();
			this._dispatchDisplayValue(
				this._displayValue + direction * this._stepMultiplier()
			);
		}
	}

	private _dragstart() {
		this._dragging = true;
		this._dragstartValue = this._displayValue;
		window.addEventListener(
			"mouseup",
			() => {
				if (this._dragstartValue !== this._displayValue) {
					this.dispatchValue(this.value);
				}
				this._dragging = false;
			},
			{ once: true }
		);
	}

	protected override render() {
		return html`
			<div id="container">
				<label for="number">${this.name}</label>
				<input
					class=${classMap({
						"focus-outline": true,
						[this.unit?.units ?? ""]: !!this.unit,
					})}
					@mousedown=${this._dragstart}
					@keydown=${this._onkeydown}
					@change=${this._onchange}
					id="number"
					type="text"
					.value=${live(
						String(this._beautifyValue(this._displayValue))
					)}
				/>
				<span id="unit">${this.unit?.suffix}</span>
			</div>
		`;
	}
}
