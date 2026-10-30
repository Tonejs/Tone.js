import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { live } from "lit/directives/live.js";

import { ToneValue } from "./value";

@customElement("tone-number")
export class ToneNumberValue extends ToneValue<number> {
	@property({ type: Number })
	value = 0;

	private _alt = false;
	private _shift = false;
	private _dragging = false;
	private _dragstartValue: number;

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
			this.dispatchValue(
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
		const value = parseFloat((e.target as HTMLInputElement).value);
		if (isFinite(value)) {
			this.dispatchValue(value);
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
			this.dispatchValue(this.value + direction * this._stepMultiplier());
		}
	}

	private _dragstart() {
		this._dragging = true;
		this._dragstartValue = this.value;
		window.addEventListener(
			"mouseup",
			() => {
				if (this._dragstartValue !== this.value) {
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
					class="focus-outline"
					@mousedown=${this._dragstart}
					@keydown=${this._onkeydown}
					@change=${this._onchange}
					id="number"
					type="text"
					.value=${live(String(this._beautifyValue(this.value)))}
				/>
			</div>
		`;
	}
}
