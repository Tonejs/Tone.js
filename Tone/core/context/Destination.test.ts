import { expect } from "chai";
import { warns } from "test/helper/Basic";
import { Offline } from "test/helper/Offline";
import { PassAudio } from "test/helper/PassAudio";
import { Oscillator } from "Tone/source/oscillator/Oscillator";
import { getContext } from "../Global";
import { Destination } from "./Destination";

describe("Destination", () => {

	it("creates itself on the context", () => {
		expect(getContext().destination).instanceOf(Destination);
	});

	it("can be muted and unmuted", () => {
		return Offline(context => {
			context.destination.mute = false;
			expect(context.destination.mute).to.equal(false);
			context.destination.mute = true;
			expect(context.destination.mute).to.equal(true);
		});
	});

	it("passes audio through", () => {
		return PassAudio(input => {
			input.toDestination();
		});
	});

	it("passes no audio when muted", () => {
		return Offline((context) => {
			new Oscillator().toDestination().start(0);
			context.destination.mute = true;
		}).then(buffer => {
			expect(buffer.isSilent()).to.equal(true);
		});
	});

	it("has a master volume control", () => {
		return Offline((context) => {
			context.destination.volume.value = -20;
			expect(context.destination.volume.value).to.be.closeTo(-20, 0.1);
		});
	});

	it("warns when toMaster is called", () => {
		warns(() => {
			const osc = new Oscillator().toMaster();
			osc.dispose();
		});
	});

	it("can pass audio through chained nodes", () => {
		return PassAudio(input => {
			const gain = input.context.createGain();
			input.connect(gain);
			input.context.destination.chain(gain);
		});
	});
});
