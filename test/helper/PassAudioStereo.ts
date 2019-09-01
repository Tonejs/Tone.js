import { expect } from "chai";
import { Merge } from "../../Tone/component/channel/Merge";
import { Signal } from "../../Tone/signal/Signal";
import { Offline } from "./Offline";

export function PassAudioStereo(before: (merge: Merge) => void): Promise<void> {
	const duration = 0.2;
	return Offline(() => {
		const merge = new Merge();
		const sigL = new Signal<number>(0);
		sigL.connect(merge, 0, 0);
		const sigR = new Signal<number>(0);
		sigR.connect(merge, 0, 1);
		before(merge);
		sigL.setValueAtTime(1, duration / 2);
		sigR.setValueAtTime(1, duration / 2);
	}, duration, 2).then(buffer => {
		let silent = true;
		// @ts-ignore -- seems to be an issue with @tone/plot/TestAudioBuffer::forEach callback function args definition
		buffer.forEach((l: number, r: number, time: number) => {
			if (time >= duration / 2 && l !== 0 && r !== 0) {
				silent = false;
				return;
			} else if (time < duration / 2){
				expect(l).to.be.closeTo(0, 0.001);
				expect(r).to.be.closeTo(0, 0.001);
			}
		});
		if (silent) {
			throw new Error("node outputs silence");
		}
	});
}
