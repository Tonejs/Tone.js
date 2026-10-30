import { customElement } from "lit/decorators.js";
import { Waveform } from "tone";

import { AnimationController } from "./animation";
import { createVis, VisBase } from "./vis-base";

@customElement("tone-waveform-vis")
export class ToneWaveformVis extends VisBase<Waveform> {
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
 * Draw the waveform of the signal going into the Waveform
 */
export function waveform(tone: Waveform): ToneWaveformVis {
	return createVis("tone-waveform-vis", tone);
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-waveform-vis": ToneWaveformVis;
	}
}
