import { customElement } from "lit/decorators.js";
import { FFT } from "tone";

import { defaultParent } from "../bind";
import { AnimationController } from "./animation";
import { createVis, VisBase } from "./vis-base";

@customElement("tone-fft-vis")
export class ToneFFTVis extends VisBase<FFT> {
	override height = 40;

	constructor() {
		super();
		new AnimationController(this, () => {
			if (this.tone) {
				this.draw(this.tone.getValue());
			}
		});
	}
}

/**
 * Draw the frequency spectrum of the FFT
 */
export function fft(
	tone: FFT,
	options: { height?: number } = {},
	parent: HTMLElement = defaultParent()
): ToneFFTVis {
	return createVis("tone-fft-vis", tone, options, parent);
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-fft-vis": ToneFFTVis;
	}
}
