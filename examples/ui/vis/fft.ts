import { customElement } from "lit/decorators.js";
import { FFT } from "tone";

import { AnimationController } from "./animation";
import { createVis, VisBase } from "./vis-base";

@customElement("tone-fft-vis")
export class ToneFFTVis extends VisBase<FFT> {
	protected override height = 40;

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
export function fft(tone: FFT): ToneFFTVis {
	return createVis("tone-fft-vis", tone);
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-fft-vis": ToneFFTVis;
	}
}
