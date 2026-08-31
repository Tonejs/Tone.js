import { expect } from "chai";

import { Offline } from "../../../test/helper/Offline.js";
import { getContext } from "../Global.js";
import { AnyAudioContext } from "./AudioContext.js";
import { DummyContext } from "./DummyContext.js";
import { ListenerInstance } from "./Listener.js";

describe("Listener", () => {
	it("creates itself on the context", () => {
		expect(getContext().listener).instanceOf(ListenerInstance);
	});

	it("can get and set values as an object", () => {
		// can get and set some values
		Offline(({ listener }) => {
			expect(listener.get()).to.have.property("positionX");
			expect(listener.get()).to.have.property("positionY");
			expect(listener.get()).to.have.property("positionZ");
			expect(listener.get()).to.have.property("forwardZ");
			expect(listener.get()).to.have.property("upY");
		});
	});

	it("can be constructed on a context whose native AudioListener has no position/forward/up AudioParams (e.g. Firefox)", () => {
		// Firefox implements no positionX/Y/Z, forwardX/Y/Z, or upX/Y/Z
		// AudioParams on AudioListener (see MDN browser-compat-data). Wrapping
		// them eagerly used to throw "param must be an AudioParam" as soon as
		// a consumer passed such a context into Tone.setContext().
		class NoListenerParamsContext extends DummyContext {
			get rawContext(): AnyAudioContext {
				return { listener: {} } as AnyAudioContext;
			}
		}

		expect(
			() =>
				new ListenerInstance({ context: new NoListenerParamsContext() })
		).to.not.throw();
	});
});
