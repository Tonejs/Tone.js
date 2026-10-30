import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { Envelope } from "tone";

import { VisBase } from "./vis-base";

@customElement("tone-envelope-vis")
export class ToneEnvelopeVis extends VisBase<Envelope> {
	static override styles = [
		VisBase.styles,
		css`
			#timeline {
				margin-top: -10px;
				font-size: 10px;
				font-family: monospace;
				position: relative;
				height: 20px;
			}
			#timeline span {
				position: absolute;
			}
		`,
	];

	protected override async generate() {
		this.draw(await this.tone.asArray(this.width));
	}

	private _timeTicks(): { x: number; time: string }[] {
		const times = [];
		if (this.tone) {
			const tickCount = 4;
			// add the timing to the bottom
			const totalDuration =
				1.1 *
				(this.tone.toSeconds(this.tone.attack) +
					this.tone.toSeconds(this.tone.decay) +
					this.tone.toSeconds(this.tone.release));
			const subdivision = Math.pow(
				2,
				Math.ceil(Math.log2(totalDuration / tickCount))
			);
			const rounding =
				(subdivision.toString().split(".")[1] &&
					subdivision.toString().split(".")[1].length) ||
				0;

			for (
				let time = 0;
				time < totalDuration * 0.9;
				time += subdivision
			) {
				times.push({
					x: time / totalDuration,
					time: time.toFixed(rounding),
				});
			}
		}
		return times;
	}

	protected override render() {
		return html`
			${super.render()}
			<div id="timeline">
				${this._timeTicks().map(
					({ x, time }) => html`
						<span
							style=${styleMap({
								left: `${(x * 100).toFixed(2)}%`,
							})}
						>
							${time}s
						</span>
					`
				)}
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-envelope-vis": ToneEnvelopeVis;
	}
}
