import { expect } from "chai";
import { Offline } from "./Offline.js";
import { Monophonic } from "../../Tone/instrument/Monophonic.js";

export function MonophonicTest(Constr, note, constrArg?): void {
	context("Monophonic Tests", () => {
		it("has an onsilence callback which is invoked after the release has finished", () => {
			let wasInvoked = false;
			return Offline(() => {
				const instance = new Constr(constrArg);
				instance.toDestination();
				instance.triggerAttackRelease(note, 0.1, 0);
				instance.onsilence = () => (wasInvoked = true);
			}, 2).then(() => {
				expect(wasInvoked).to.equal(true);
			});
		});

		it("invokes onsilence callback when the sustain is set to 0", () => {
			let wasInvoked = false;
			return Offline(() => {
				const instance = new Constr(constrArg);
				instance.toDestination();
				if (instance.envelope) {
					instance.envelope.sustain = 0;
				} else if (instance.voice0) {
					// DuoSynth is a special case
					instance.voice0.envelope.sustain = 0;
					instance.voice1.envelope.sustain = 0;
				}
				instance.triggerAttack(note, 0);
				instance.onsilence = () => (wasInvoked = true);
			}, 2).then(() => {
				expect(wasInvoked).to.equal(true);
			});
		});

		it("can pass in the detune into the constructor", () => {
			const instance = new Constr({
				detune: -100,
			});
			expect(instance.detune.value).to.be.closeTo(-100, 0.1);
			instance.dispose();
		});
	});
}
