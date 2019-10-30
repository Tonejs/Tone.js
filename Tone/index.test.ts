import * as Tone from "./index";
import { expect } from "chai";
import { Destination } from "./core/context/Destination";
import { Context } from "./core/context/Context";
import { Transport } from "./core/clock/Transport";
import { Draw } from "./core/util/Draw";

describe("Tone", () => {
	
	it("has 'now' and 'immediate' methods", () => {
		expect(Tone.now).to.be.a("function");
		expect(Tone.now()).to.be.a("number");
		expect(Tone.immediate).to.be.a("function");
		expect(Tone.immediate()).to.be.a("number");
	});

	it("exports the global singletons", () => {
		expect(Tone.Destination).to.be.an.instanceOf(Destination);
		expect(Tone.Draw).to.be.an.instanceOf(Draw);
		expect(Tone.Transport).to.be.an.instanceOf(Transport);
		expect(Tone.context).to.be.an.instanceOf(Context);
	});
});
