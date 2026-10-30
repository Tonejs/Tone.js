import Color from "color";
import { css, html, PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { Meter } from "tone";

import { defaultParent } from "../bind";
import { AnimationController } from "./animation";
import { createVis, VisBase } from "./vis-base";

@customElement("tone-meter-vis")
export class ToneMeterVis extends VisBase<Meter> {
	override height = 40;

	@state()
	private _meterLevels: number[] = [];

	static override styles = css`
		#container {
			display: flex;
			align-items: flex-end;
			border: 2px outset #ddd;
			border-color: transparent transparent #ddd;
		}
		.level {
			flex: 1;
			background-color: #aaa;
			margin: 2px;
			min-height: 2px;
			border-top-left-radius: 2px;
			border-top-right-radius: 2px;
		}
	`;

	constructor() {
		super();
		new AnimationController(this, () => {
			if (this.tone) {
				const values = this.tone.getValue();
				this._meterLevels = Array.isArray(values) ? values : [values];
			}
		});
	}

	protected override willUpdate(changed: PropertyValues<this>) {
		if (changed.has("tone") && this.tone) {
			this.tone.normalRange = true;
		}
	}

	private _levelColor(val: number): string {
		return Color("#aaa")
			.mix(Color("rgb(209, 196, 15)"), Math.pow(val, 0.5))
			.hex();
	}

	protected override render() {
		return html`
			<div
				id="container"
				style=${styleMap({ height: `${this.height}px` })}
			>
				${this._meterLevels.map(
					(val) => html`
						<div
							class="level"
							style=${styleMap({
								height: `${(Math.pow(val, 0.2) * 100).toFixed(2)}%`,
								backgroundColor: this._levelColor(val),
							})}
						></div>
					`
				)}
			</div>
		`;
	}
}

/**
 * Draw the level of each channel going into the Meter
 */
export function meter(
	tone: Meter,
	options: { height?: number } = {},
	parent: HTMLElement = defaultParent()
): ToneMeterVis {
	return createVis("tone-meter-vis", tone, options, parent);
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-meter-vis": ToneMeterVis;
	}
}
