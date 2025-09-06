import { expect } from "chai";

import { TransportInstance } from "./core/clock/Transport.js";
import { Context } from "./core/context/Context.js";
import { DestinationInstance } from "./core/context/Destination.js";
import { DrawInstance } from "./core/util/Draw.js";
import * as Tone from "./index.js";

describe("Tone", () => {
	it("has 'now' and 'immediate' methods", () => {
		expect(Tone.now).to.be.a("function");
		expect(Tone.now()).to.be.a("number");
		expect(Tone.immediate).to.be.a("function");
		expect(Tone.immediate()).to.be.a("number");
	});

	it("exports the global singletons", () => {
		expect(Tone.Destination).to.be.an.instanceOf(DestinationInstance);
		expect(Tone.Draw).to.be.an.instanceOf(DrawInstance);
		expect(Tone.Transport).to.be.an.instanceOf(TransportInstance);
		expect(Tone.context).to.be.an.instanceOf(Context);
	});

	it("exports the global singleton getters", () => {
		expect(Tone.getDestination()).to.be.an.instanceOf(DestinationInstance);
		expect(Tone.getDraw()).to.be.an.instanceOf(DrawInstance);
		expect(Tone.getTransport()).to.be.an.instanceOf(TransportInstance);
	});

	it("can start the global context", () => {
		return Tone.start();
	});

	it("resolves the promise when everything is loaded", () => {
		return Tone.loaded();
	});

	it("can set the global context from a raw online context", async () => {
		const ctx = new AudioContext();
		const origContext = Tone.getContext();
		Tone.setContext(ctx);
		expect(Tone.getContext().rawContext).to.equal(ctx);
		await ctx.close();
		Tone.setContext(origContext);
	});

	it("can set the global context from a raw offline context", async () => {
		const ctx = new OfflineAudioContext(2, 44100, 44100);
		const origContext = Tone.getContext();
		Tone.setContext(ctx);
		expect(Tone.getContext().rawContext).to.equal(ctx);
		Tone.setContext(origContext);
	});
});
