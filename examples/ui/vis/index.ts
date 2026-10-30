import "./buffer";
import "./compressor";
import "./envelope";
import "./filter";
import "./oscillator";

import { html, nothing, TemplateResult } from "lit";
import { Filter, ToneAudioNode } from "tone";

/**
 * Render the visualization which matches the type of node, if there is one.
 * The values are passed in so the curve is redrawn when they change.
 */
export function renderVis(
	tone: ToneAudioNode,
	values: object
): TemplateResult | typeof nothing {
	const name = tone.toString();
	if (name.includes("Envelope")) {
		return html`<tone-envelope-vis
			.tone=${tone}
			.values=${values}
		></tone-envelope-vis>`;
	} else if (name.includes("Oscillator")) {
		return html`<tone-oscillator-vis
			.tone=${tone}
			.values=${values}
		></tone-oscillator-vis>`;
	} else if (name === "Compressor") {
		return html`<tone-compressor-vis
			.tone=${tone}
			.values=${values}
		></tone-compressor-vis>`;
	} else if (
		(name === "Filter" || name === "OnePoleFilter") &&
		// the response is meaningless when the frequency is driven by a signal
		!(tone instanceof Filter && tone.frequency.overridden)
	) {
		return html`<tone-filter-vis
			.tone=${tone}
			.values=${values}
		></tone-filter-vis>`;
	} else if (Reflect.has(tone, "buffer")) {
		return html`<tone-buffer-vis
			.tone=${tone}
			.values=${values}
		></tone-buffer-vis>`;
	}
	return nothing;
}
