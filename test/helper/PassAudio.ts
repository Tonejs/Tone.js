import { expect } from "chai";
import { Offline } from "./Offline";
import { ToneAudioNode } from "../../Tone/core/context/ToneAudioNode";
import { Signal } from "../../Tone/signal/Signal";

/**
 * Make sure that the audio passes from input node
 * to the destination node
 */
export function PassAudio(
	callback: (input: ToneAudioNode) => void,
	passes = true
): Promise<void> {
	const duration = 0.2;
	return Offline(() => {
		const sig = new Signal(0);
		callback(sig);
		sig.setValueAtTime(1, duration / 2);
	}, 0.2, 1).then(buffer => {
		expect(buffer.getValueAtTime(0)).to.be.closeTo(0, 0.001);
		expect(buffer.getValueAtTime(duration / 2 - 0.01)).to.be.closeTo(0, 0.001);
		if (passes) {
			expect(buffer.getValueAtTime(duration / 2 + 0.01)).to.not.equal(0);
			expect(buffer.getValueAtTime(duration - 0.01)).to.not.equal(0);
		} else {
			expect(buffer.getValueAtTime(duration / 2 + 0.01)).to.be.closeTo(0, 0.001);
			expect(buffer.getValueAtTime(duration - 0.01)).to.be.closeTo(0, 0.001);
		}
	});
}
