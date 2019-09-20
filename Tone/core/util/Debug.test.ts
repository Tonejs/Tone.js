import { expect } from "chai";
import { ToneOscillatorNode } from "../../source/oscillator/ToneOscillatorNode";
import { setLogger } from "./Debug";
import { theWindow } from "../context/AudioContext";

describe("Debug", () => {

	it("can log a class when that class is set to 'debug'", () => {
		const osc = new ToneOscillatorNode();
		osc.debug = true;
		let loggerInvoked = false;
		let warnInvoked = false;
		setLogger({
			log: () => loggerInvoked = true,
			warn: () => warnInvoked = true
		});
		osc.start();
		expect(loggerInvoked).to.be.true;
		expect(warnInvoked).to.be.false;
		osc.dispose();
		setLogger(console);
	});

	it("can log a class when the window is set with that class name", () => {
		// @ts-ignore
		theWindow.TONE_DEBUG_CLASS = "ToneOscillatorNode";
		const osc = new ToneOscillatorNode();
		let loggerInvoked = false;
		let warnInvoked = false;
		setLogger({
			log: () => loggerInvoked = true,
			warn: () => warnInvoked = true
		});
		osc.start();
		expect(loggerInvoked).to.be.true;
		expect(warnInvoked).to.be.false;
		setLogger(console);
		// @ts-ignore
		theWindow.TONE_DEBUG_CLASS = undefined;
		osc.dispose();
	});
});
