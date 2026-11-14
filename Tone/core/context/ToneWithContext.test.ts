import { expect } from "chai";

import { Offline } from "../../../test/helper/Offline.js";
import { getContext } from "../Global.js";
import { Gain } from "./Gain.js";
import { ToneWithContext } from "./ToneWithContext.js";

/** Exposes {@link ToneWithContext._onContextRunning} for tests without `as any`. */
class GainWithContextRunning extends Gain {
	public triggerOnContextRunning(callback: () => void): void {
		this._onContextRunning(callback);
	}
}

describe("ToneWithContext", () => {
	context("get", () => {
		it("returns an object with all the default properties", () => {
			const gain = new Gain();
			const values = gain.get();
			expect(values).to.be.an("object");
			expect(values).to.have.property("gain");
			gain.dispose();
		});

		it("reflects the current value of properties", () => {
			const gain = new Gain(0.3);
			const values = gain.get();
			expect(values.gain).to.be.closeTo(0.3, 0.001);
			gain.dispose();
		});
	});

	context("set", () => {
		it("sets properties with an object", () => {
			const gain = new Gain();
			gain.set({ gain: 0.5 });
			expect(gain.gain.value).to.be.closeTo(0.5, 0.001);
			gain.dispose();
		});

		it("returns the instance for chaining", () => {
			const gain = new Gain();
			const returned = gain.set({ gain: 0.5 });
			expect(returned).to.equal(gain);
			gain.dispose();
		});

		it("does not set a value if it is the same", () => {
			const gain = new Gain(0.7);
			gain.set({ gain: 0.7 });
			expect(gain.gain.value).to.be.closeTo(0.7, 0.001);
			gain.dispose();
		});
	});

	context("getDefaults", () => {
		it("returns defaults with a context", () => {
			const defaults = ToneWithContext.getDefaults();
			expect(defaults).to.have.property("context");
			expect(defaults.context).to.equal(getContext());
		});
	});

	context("_onContextRunning", () => {
		it("invokes the callback immediately for an offline context", () => {
			return Offline(() => {
				let callbackInvoked = false;
				const gain = new GainWithContextRunning();
				gain.triggerOnContextRunning(() => {
					callbackInvoked = true;
				});
				expect(callbackInvoked).to.equal(true);
				gain.dispose();
			});
		});

		it("cleans up the listener on dispose", () => {
			return Offline(() => {
				const gain = new GainWithContextRunning();
				gain.triggerOnContextRunning(() => {
					// no-op
				});
				// Should not throw when disposing
				gain.dispose();
			});
		});
	});
});
