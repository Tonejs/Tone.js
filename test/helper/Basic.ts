import { expect } from "chai";
import { Tone } from "../../Tone/core/Tone";
import { AudioProcessor } from "../../Tone/node/AudioProcessor";

export const testAudioContext = new OfflineAudioContext(1, 1, 11025);

export function BasicTests(Constr, ...args: any[]) {

	context("Basic", () => {

		it("can be created and disposed", () => {
			const instance = new Constr(...args);
			instance.dispose();
		});

		it("extends Tone", () => {
			const instance = new Constr(...args);
			expect(instance).to.be.an.instanceof(Tone);
			instance.dispose();
		});

		it("can specify the AudioContext", () => {
			const instance = new Constr(Object.assign({
				context: testAudioContext,
			}, ...args));
			if (instance instanceof AudioProcessor) {
				expect(instance.context).to.equal(testAudioContext);
				// also check all of it's attributes to see if they also have the right context
				for (const member in instance) {
					if (instance[member] instanceof AudioProcessor) {
						expect(instance[member].context).to.equal(testAudioContext);
					}
				}
			}
			instance.dispose();
		});

	});

}
