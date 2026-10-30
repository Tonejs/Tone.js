import "@material/web/slider/slider.js";

import type { MdSlider } from "@material/web/slider/slider.js";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { Bindable } from "../bind";

/**
 * A Param or Signal, or a callback which receives the slider value
 */
export type SliderTarget = { value: number } | ((value: number) => void);

@customElement("tone-slider")
export class ToneSlider extends LitElement implements Bindable<SliderTarget> {
	@property({ type: Number })
	min = 0;

	@property({ type: Number })
	max = 100;

	@property({ type: Number, reflect: true })
	value = 50;

	/**
	 * The slider increment. 0 means continuous.
	 */
	@property({ type: Number })
	step = 0;

	@property({ type: String })
	label = "";

	@property({ type: String })
	units = "";

	static override styles = css`
		:host {
			display: block;
			width: 100%;
		}
		#label {
			display: block;
			width: 100%;
		}
		.value {
			margin-left: 10px;
			font-weight: bold;
			float: right;
		}
		.units {
			font-weight: normal;
		}
		md-slider {
			display: block;
			/* md-slider pads its track by half the state layer size,
			pull it out so the track lines up with the label */
			margin-inline: calc(var(--md-slider-state-layer-size, 40px) / -2);
			--md-slider-active-track-color: black;
			--md-slider-handle-color: black;
			--md-slider-focus-handle-color: black;
			--md-slider-hover-handle-color: black;
			--md-slider-pressed-handle-color: black;
			--md-slider-hover-state-layer-color: black;
			--md-slider-pressed-state-layer-color: black;
			--md-slider-inactive-track-color: rgba(0, 0, 0, 0.26);
			--md-slider-active-track-height: 2px;
			--md-slider-inactive-track-height: 2px;
			--md-slider-handle-width: 12px;
			--md-slider-handle-height: 12px;
		}
	`;

	/**
	 * Set the target's value when the slider moves. A Param or Signal
	 * target also sets the slider's starting value.
	 */
	bind(target: SliderTarget) {
		if (typeof target === "function") {
			this.addEventListener("input", () => target(this.value));
		} else {
			this.value = target.value;
			this.addEventListener("input", () => (target.value = this.value));
		}
	}

	/**
	 * The input event is composed, so it continues on to
	 * listeners on the host after the value is updated here.
	 */
	private _input(e: Event) {
		this.value = (e.target as MdSlider).value;
	}

	/**
	 * md-slider needs a numeric step, so approximate continuous
	 * movement with a fine subdivision of the range
	 */
	private _sliderStep(): number {
		return this.step || (this.max - this.min) / 1000;
	}

	private _beautifyValue(value: number): string {
		if (Number.isInteger(value)) {
			return value.toString();
		} else {
			return value.toFixed(2);
		}
	}

	protected override render() {
		return html`
			<div id="label">
				<label for="slider">${this.label}</label>
				<span class="value"
					>${this._beautifyValue(this.value)}
					<span class="units">${this.units}</span></span
				>
			</div>
			<md-slider
				id="slider"
				.min=${this.min}
				.max=${this.max}
				.step=${this._sliderStep()}
				.value=${this.value}
				@input=${this._input}
			></md-slider>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-slider": ToneSlider;
	}
}
