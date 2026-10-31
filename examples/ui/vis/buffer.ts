import { customElement } from "lit/decorators.js";
import { ToneAudioBuffer, ToneAudioNode } from "tone";

import { VisBase } from "./vis-base";

type ToneAudioNodeWithBuffer = ToneAudioNode & {
	buffer: ToneAudioBuffer;
};

@customElement("tone-buffer-vis")
export class ToneBufferVis extends VisBase<ToneAudioNodeWithBuffer> {
	protected override async generate() {
		const buffer = this.tone.buffer;
		if (!buffer.loaded) {
			// chain so the buffer's own onload, e.g. a Player's, still runs
			await new Promise<void>((done) => {
				const onload = buffer.onload;
				buffer.onload = (loaded) => {
					onload.call(buffer, loaded);
					done();
				};
			});
		}
		this.draw(buffer.getChannelData(0));
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"tone-buffer-vis": ToneBufferVis;
	}
}
