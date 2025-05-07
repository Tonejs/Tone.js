import * as Tone from "./index.js";
import { expect } from "chai";
import { DestinationClass } from "./core/context/Destination.js";
import { TransportClass } from "./core/clock/Transport.js";
import { DrawClass } from "./core/util/Draw.js";
import { ListenerClass } from "./core/context/Listener.js";

describe("Exports", () => {
	it("has 'now' and 'immediate' methods", () => {
		expect(Tone.now).to.be.a("function");
		expect(Tone.now()).to.be.a("number");
		expect(Tone.immediate).to.be.a("function");
		expect(Tone.immediate()).to.be.a("number");
	});

	it("exports the global singleton getters", () => {
		expect(Tone.getDestination()).to.be.an.instanceOf(DestinationClass);
		expect(Tone.getDraw()).to.be.an.instanceOf(DrawClass);
		expect(Tone.getTransport()).to.be.an.instanceOf(TransportClass);
		expect(Tone.getListener()).to.be.an.instanceOf(ListenerClass);
	});
});
