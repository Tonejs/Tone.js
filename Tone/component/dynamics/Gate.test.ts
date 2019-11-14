import { Gate } from "./Gate";
import { BasicTests } from "test/helper/Basic";
import { Offline } from "test/helper/Offline";
import { Signal } from "Tone/signal/Signal";
import { Oscillator } from "Tone/source/oscillator/Oscillator";
import { CompareToFile } from "test/helper/CompareToFile";
import { expect } from "chai";

describe("Gate", () => {

	BasicTests(Gate);

	it("matches a file", () => {
		return CompareToFile(() => {
			const gate = new Gate(-10, 0.1).toDestination();
			const osc = new Oscillator().connect(gate);
			osc.start(0);
			osc.volume.value = -100;
			osc.volume.exponentialRampToValueAtTime(0, 0.5);
		}, "gate.wav", 0.18);
	});

	context("Signal Gating", () => {

		it("handles getter/setter as Object", () => {
			const gate = new Gate();
			const values = {
				smoothing: 0.2,
				threshold: -20
			};
			gate.set(values);
			expect(gate.get().smoothing).to.be.closeTo(0.2, 0.001);
			expect(gate.get().threshold).to.be.closeTo(-20, 0.1);
			gate.dispose();
		});

		it("can be constructed with an object", () => {
			const gate = new Gate({
				smoothing: 0.3,
				threshold: -5
			});
			expect(gate.smoothing).to.be.closeTo(0.3, 0.001);
			expect(gate.threshold).to.be.closeTo(-5, 0.1);
			gate.dispose();
		});

		it("gates the incoming signal when below the threshold", () => {
			return Offline(() => {
				const gate = new Gate(-9);
				const sig = new Signal(-12, "decibels");
				sig.connect(gate);
				gate.toDestination();
			}).then((buffer) => {
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("passes the incoming signal when above the threshold", () => {
			it("gates the incoming signal when below the threshold", () => {
				return Offline(() => {
					const gate = new Gate(-11);
					const sig = new Signal(-10, "decibels");
					sig.connect(gate);
					gate.toDestination();
				}).then((buffer) => {
					expect(buffer.min()).to.be.above(0);
				});
			});
		});
	});
});

