import { customElement } from "lit/decorators.js";
import { Filter } from "tone";

import { VisBase } from "./vis-base";

@customElement("tone-filter-vis")
export class ToneFilterVis extends VisBase<Filter> {
	protected override generate() {
		this.draw(this.tone.getFrequencyResponse(this.width));
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-filter-vis": ToneFilterVis;
	}
}
