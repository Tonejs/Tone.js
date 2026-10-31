import { css, CSSResultGroup, html, LitElement, PropertyValues } from "lit";
import { property, query } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { ToneAudioNode } from "tone";

import { defaultParent } from "../bind";

/**
 * Base class for visualizations which draw a curve of a Tone.js node
 */
export abstract class VisBase<
	T extends ToneAudioNode = ToneAudioNode,
> extends LitElement {
	@property({ attribute: false })
	tone: T;

	/**
	 * The values of the node, the curve is regenerated when these change
	 */
	@property({
		attribute: false,
		hasChanged: (a, b) => JSON.stringify(a) !== JSON.stringify(b),
	})
	values: object;

	/**
	 * The height of the canvas in pixels
	 */
	protected height = 100;

	@query("canvas")
	protected canvas: HTMLCanvasElement;

	/**
	 * The resolution of the curve
	 */
	protected width = 310;

	protected normalizeCurve = true;

	private _timeout: ReturnType<typeof setTimeout>;

	static override styles: CSSResultGroup = css`
		#container {
			margin-top: 5px;
		}

		canvas {
			background-color: #aaa;
			width: 100%;
			border-radius: 4px;
		}
	`;

	/**
	 * Generate and draw the curve, visualizations which
	 * animate draw every frame instead
	 */
	protected generate(): Promise<void> | void {
		// nothing to generate
	}

	protected scale(
		v: number,
		inMin: number,
		inMax: number,
		outMin: number,
		outMax: number
	): number {
		return ((v - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
	}

	protected draw(values: Float32Array) {
		const canvas = this.canvas;
		if (!canvas) {
			return;
		}
		const context = canvas.getContext("2d");
		canvas.height = this.height;
		canvas.width = this.width;
		const width = canvas.width;
		const height = canvas.height;
		context.clearRect(0, 0, width, height);
		const maxValuesLength = 2048;
		if (values.length > maxValuesLength) {
			const resampled = new Float32Array(maxValuesLength);
			// down sample to maxValuesLength values
			for (let i = 0; i < maxValuesLength; i++) {
				resampled[i] =
					values[Math.floor((i / maxValuesLength) * values.length)];
			}
			values = resampled;
		}
		const max = this.normalizeCurve ? Math.max(0.001, ...values) * 1.1 : 1;
		const min = this.normalizeCurve ? Math.min(-0.001, ...values) * 1.1 : 0;

		const lineWidth = 3;
		context.lineWidth = lineWidth;
		context.beginPath();
		for (let i = 0; i < values.length; i++) {
			const v = values[i];
			const x = this.scale(
				i,
				0,
				values.length,
				lineWidth,
				width - lineWidth
			);
			const y = this.scale(v, max, min, 0, height - lineWidth);
			if (i === 0) {
				context.moveTo(x, y);
			} else {
				context.lineTo(x, y);
			}
		}
		context.lineCap = "round";
		context.strokeStyle = "white";
		context.stroke();
	}

	protected override updated(changed: PropertyValues<this>) {
		if (this.tone && (changed.has("tone") || changed.has("values"))) {
			// debounce, some curves are rendered offline
			clearTimeout(this._timeout);
			this._timeout = setTimeout(() => this.generate(), 50);
		}
	}

	protected override render() {
		return html`
			<div id="container">
				<canvas
					style=${styleMap({ height: `${this.height}px` })}
				></canvas>
			</div>
		`;
	}
}

/**
 * Create a visualization element for the node on the example page
 */
export function createVis<K extends keyof HTMLElementTagNameMap>(
	tagName: K,
	tone: ToneAudioNode
): HTMLElementTagNameMap[K] {
	const element = document.createElement(
		tagName
	) as HTMLElementTagNameMap[K] & VisBase;
	element.tone = tone;
	defaultParent().appendChild(element);
	return element;
}
