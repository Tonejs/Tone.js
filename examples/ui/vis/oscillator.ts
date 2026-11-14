import { customElement } from "lit/decorators.js";
import { Oscillator } from "tone";

import { VisBase } from "./vis-base";

@customElement("tone-oscillator-vis")
export class ToneOscillatorVis extends VisBase<Oscillator> {
	protected override async generate() {
		this.draw(await this.tone.asArray(600));
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-oscillator-vis": ToneOscillatorVis;
	}
}
