import { expect } from "chai";
import { OfflineContext } from "Tone/core/context/OfflineContext";
import { ToneWithContext } from "Tone/core/context/ToneWithContext";
import { Tone } from "Tone/core/Tone";

export const testAudioContext = new OfflineContext(1, 1, 11025);
testAudioContext.initialize();

// tslint:disable-next-line
export function BasicTests(Constr, ...args: any[]): void {

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
			if (instance instanceof ToneWithContext) {
				expect(instance.context).to.equal(testAudioContext);
				// also check all of it's attributes to see if they also have the right context
				for (const member in instance) {
					if (instance[member] instanceof ToneWithContext) {
						expect(instance[member].context, `member: ${member}`).to.equal(testAudioContext);
					}
				}
			}
			instance.dispose();
		});

	});

}
