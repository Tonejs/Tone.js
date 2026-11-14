import { expect } from "chai";

import { BasicTests } from "../../../test/helper/Basic.js";
import { Offline } from "../../../test/helper/Offline.js";
import { PassAudio } from "../../../test/helper/PassAudio.js";
import { Abs } from "../../signal/Abs.js";
import { Signal } from "../../signal/Signal.js";
import { Oscillator } from "../../source/oscillator/Oscillator.js";
import { DCFilter } from "./DCFilter.js";

describe("DCFilter", () => {
	BasicTests(DCFilter);

	context("Filtering", () => {
		it("passes the incoming signal through", () => {
			return PassAudio((input) => {
				const filter = new DCFilter().toDestination();
				input.connect(filter);
			});
		});

		it("removes DC offset from a constant signal", async () => {
			const buffer = await Offline(() => {
				const filter = new DCFilter().toDestination();
				const sig = new Signal(1).connect(filter);
				sig.setValueAtTime(1, 0);
			}, 0.2);
			expect(buffer.getValueAtTime(0)).to.be.closeTo(1, 0.01);
			expect(buffer.getValueAtTime(0.1)).to.be.closeTo(0, 0.001);
			expect(buffer.getValueAtTime(0.19)).to.be.closeTo(0, 0.001);
		});

		it("centers an offset signal around zero", async () => {
			const buffer = await Offline(() => {
				const filter = new DCFilter().toDestination();
				const abs = new Abs();
				const osc = new Oscillator(440);
				osc.chain(abs, filter);
				osc.start(0);
			}, 0.2);
			expect(buffer.min()).to.be.lessThan(-0.3);
			expect(buffer.max()).to.be.greaterThan(0.3);
		});
	});
});
