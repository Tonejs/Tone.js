import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

import { ToneValue } from "./value";

@customElement("tone-array")
export class ToneArrayValue extends ToneValue<number[]> {
	@property({ type: Array })
	value: number[] = [];

	static override styles = [
		ToneValue.styles,
		css`
			#container {
				display: flex;
			}
			label,
			#bars {
				flex: 1;
			}
			label[disabled] {
				color: lightgray;
			}
			#bars {
				display: flex;
				flex-direction: row;
			}
			.bar {
				flex: 1;
				height: 100%;
				position: relative;
				margin: 0px 1px;
			}
			.fill {
				pointer-events: none;
				background-color: black;
				position: absolute;
				bottom: 0px;
				left: 0px;
				width: 100%;
				height: 0px;
			}
		`,
	];

	private _scale(
		v: number,
		inMin: number,
		inMax: number,
		outMin: number,
		outMax: number
	): number {
		const normV = Math.pow((v - inMin) / (inMax - inMin), 0.25);
		return normV * (outMax - outMin) + outMin;
	}

	private _mousemove(index: number, e: MouseEvent) {
		if (e.buttons) {
			let normValue = e.offsetY / (e.target as HTMLElement).clientHeight;
			normValue = Math.min(Math.max(normValue, 0), 1);
			const value = [...this.value];
			value[index] = Math.pow(1 - normValue, 1 / 0.25);
			this.dispatchValue(value);
		}
	}

	protected override render() {
		const values = this.value.map(Math.abs);
		const min = Math.min(...values, 0);
		const max = Math.max(...values, 1);
		return html`
			<div id="container">
				<label ?disabled=${values.length === 0}>${this.name}</label>
				<span id="bars">
					${values.map(
						(v, i) => html`
							<span
								class="bar"
								@mousedown=${(e: MouseEvent) =>
									this._mousemove(i, e)}
								@mousemove=${(e: MouseEvent) =>
									this._mousemove(i, e)}
							>
								<span
									class="fill"
									style=${styleMap({
										height: `${this._scale(v, min, max, 0, 100)}%`,
									})}
								></span>
							</span>
						`
					)}
				</span>
			</div>
		`;
	}
}
