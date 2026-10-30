import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

import { Bindable } from "../bind";

export interface SliderPadPosition {
	x: number;
	y: number;
}

/**
 * Callbacks for pressing, dragging and releasing the puck
 */
export interface SliderPadTarget {
	down?(position: SliderPadPosition): void;
	move?(position: SliderPadPosition): void;
	up?(position: SliderPadPosition): void;
}

@customElement("tone-slider-pad")
export class ToneSliderPad
	extends LitElement
	implements Bindable<SliderPadTarget>
{
	@property({ type: Number })
	xPosition = 0.5;

	@property({ type: Number })
	yPosition = 0.5;

	@property({ type: Boolean })
	pressed = false;

	@query(".square")
	private _container: HTMLDivElement;

	static override styles = css`
		:host {
			display: block;
			width: 100%;
		}
		.square {
			position: relative;
			width: 60%;
			margin: 20px auto;
			background-color: rgba(170, 170, 170, 0.5);
			border-radius: 10px;
			overflow: hidden;
			cursor: pointer;
			aspect-ratio: 1;
		}
		.square:hover {
			background-color: rgba(30, 223, 62, 0.3);
		}
		#puck {
			position: absolute;
			transform: translate(-50%, -50%);
			transition:
				width 0.2s,
				height 0.2s;
			background-color: black;
			width: 30px;
			height: 30px;
			border-radius: 50%;
			pointer-events: none;
		}
		.square:hover #puck {
			background-color: #3833ed;
			width: 40px;
			height: 40px;
		}
	`;

	bind(target: SliderPadTarget) {
		for (const name of ["down", "move", "up"] as const) {
			if (target[name]) {
				this.addEventListener(
					name,
					(e: CustomEvent<SliderPadPosition>) =>
						target[name](e.detail)
				);
			}
		}
	}

	protected override updated(changed: PropertyValues<this>) {
		if (changed.has("pressed") && changed.get("pressed") !== undefined) {
			this._dispatch(this.pressed ? "down" : "up");
		}
	}

	private _dispatch(name: "down" | "move" | "up") {
		this.dispatchEvent(
			new CustomEvent<SliderPadPosition>(name, {
				composed: true,
				detail: {
					x: this.xPosition,
					y: this.yPosition,
				},
			})
		);
	}

	private _updatePosition(e: MouseEvent) {
		this.xPosition = this._clamp(e.offsetX / this._container.offsetWidth);
		this.yPosition = this._clamp(e.offsetY / this._container.offsetHeight);
		this._dispatch("move");
	}

	private _mousemove(e: MouseEvent) {
		if (e.buttons) {
			this._updatePosition(e);
		}
	}

	private _mousedown(e: MouseEvent) {
		this._updatePosition(e);
		this.pressed = true;
	}

	private _mouseup(e: MouseEvent) {
		this._updatePosition(e);
		this.pressed = false;
	}

	private _mouseleave() {
		this.pressed = false;
	}

	private _clamp(value: number) {
		return Math.min(Math.max(value, 0), 1);
	}

	protected override render() {
		const puckStyle = {
			left: `${(this.xPosition * 100).toFixed(2)}%`,
			top: `${(this.yPosition * 100).toFixed(2)}%`,
		};
		return html`
			<div
				class="square"
				@mousemove=${this._mousemove}
				@mousedown=${this._mousedown}
				@mouseup=${this._mouseup}
				@mouseleave=${this._mouseleave}
			>
				<div id="puck" style=${styleMap(puckStyle)}></div>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-slider-pad": ToneSliderPad;
	}
}
