import { css, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { Compressor } from "tone";

import { AnimationController } from "./animation";
import { VisBase } from "./vis-base";

@customElement("tone-compressor-vis")
export class ToneCompressorVis extends VisBase<Compressor> {
	protected override normalizeCurve = false;

	/**
	 * Updated directly every animation frame rather than
	 * through render, which would retrigger generate
	 */
	@query("#reduction #fill")
	private _reductionFill: HTMLDivElement;

	static override styles = [
		VisBase.styles,
		css`
			#container {
				position: relative;
			}

			canvas {
				width: calc(100% - 50px);
			}

			#reduction {
				position: absolute;
				width: 20px;
				right: 0px;
				top: 0px;
			}

			#reduction #fill {
				background-color: black;
				width: 100%;
				height: 0%;
				top: 0px;
				left: 0px;
			}
		`,
	];

	constructor() {
		super();
		new AnimationController(this, () => {
			if (this.tone && this._reductionFill) {
				const reduction = this.scale(
					this.tone.reduction,
					0,
					-100,
					0,
					100
				);
				this._reductionFill.style.height = `${reduction.toFixed(1)}%`;
			}
		});
	}

	protected override generate() {
		const length = this.width;
		const kneeWidth = this.scale(this.tone.knee.value, 0, 100, 0, length);
		const threshIndex = this.scale(
			this.tone.threshold.value,
			-100,
			40,
			0,
			length
		);
		const retArray = new Float32Array(length);
		const ratio = this.tone.ratio.value;
		const kneeBegin = threshIndex - kneeWidth / 2;
		const kneeEnd = threshIndex + kneeWidth / 2;
		const kneeBeginNorm = this.scale(kneeBegin, 0, length, 0, 1);
		const threshNorm = this.scale(threshIndex, 0, length, 0, 1);
		const values = retArray.map((_, i) => {
			const linearVal = this.scale(i, 0, length, 0, 1);
			// apply the ratio
			if (i < kneeBegin) {
				// linear
				return linearVal;
			} else if (kneeBegin <= i && i <= kneeEnd) {
				// in the knee
				const over = this.scale(kneeEnd - threshIndex, 0, length, 0, 1);
				const compressedValue = threshNorm + over * (1 / ratio);
				return this.scale(
					i,
					kneeBegin,
					kneeEnd,
					kneeBeginNorm,
					compressedValue
				);
			} else {
				// compressing
				const over = this.scale(i - threshIndex, 0, length, 0, 1);
				const compressedValue = threshNorm + over * (1 / ratio);
				return compressedValue;
			}
		});
		this.draw(values);
	}

	protected override draw(values: Float32Array) {
		// draw the values
		super.draw(values);

		const canvas = this.canvas;
		const context = canvas.getContext("2d");
		context.setLineDash([2, 2]);
		context.lineWidth = 1;
		context.strokeStyle = "rgba(0, 0, 0, 0.25)";
		// draw the thresh and knee lines
		const threshX = this.scale(
			this.tone.threshold.value,
			-100,
			40,
			0,
			canvas.width
		);
		const threshY = this.scale(
			this.tone.threshold.value,
			-100,
			40,
			canvas.height,
			0
		);
		context.moveTo(threshX, 0);
		context.lineTo(threshX, canvas.height);
		context.stroke();
		context.moveTo(0, threshY);
		context.lineTo(canvas.width, threshY);
		context.stroke();
		context.setLineDash([]);
	}

	protected override render() {
		const heightStyle = styleMap({ height: `${this.height}px` });
		return html`
			<div id="container">
				<canvas style=${heightStyle}></canvas>
				<div id="reduction" style=${heightStyle}>
					<div id="fill"></div>
				</div>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-compressor-vis": ToneCompressorVis;
	}
}
