import { css, html, PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { isArray, Meter } from "tone";

import { AnimationController } from "./animation";
import { createVis, VisBase } from "./vis-base";

@customElement("tone-meter-vis")
export class ToneMeterVis extends VisBase<Meter> {
	protected override height = 40;

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
				this._meterLevels = isArray(values) ? values : [values];
			}
		});
	}

	protected override willUpdate(changed: PropertyValues<this>) {
		if (changed.has("tone") && this.tone) {
			this.tone.normalRange = true;
		}
	}

	/**
	 * Gray which turns yellow as the level rises
	 */
	private _levelColor(val: number): string {
		const yellow = (Math.pow(val, 0.5) * 100).toFixed(1);
		return `color-mix(in srgb, #aaa, rgb(209, 196, 15) ${yellow}%)`;
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
export function meter(tone: Meter): ToneMeterVis {
	return createVis("tone-meter-vis", tone);
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-meter-vis": ToneMeterVis;
	}
}
