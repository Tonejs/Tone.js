import { expect } from "chai";
import { Offline } from "test/helper/Offline";
import { getContext } from "../Global";
import { ListenerClass } from "./Listener";

describe("Listener", () => {

	it("creates itself on the context", () => {
		expect(getContext().listener).instanceOf(ListenerClass);
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
});
