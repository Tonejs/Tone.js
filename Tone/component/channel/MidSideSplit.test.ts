import { MidSideSplit } from "./MidSideSplit";
import { MidSideMerge } from "./MidSideMerge";
import { BasicTests } from "test/helper/Basic";
import { Signal } from "Tone/signal/Signal";
import { Offline } from "test/helper/Offline";
import { Merge } from "./Merge";
import { connectFrom, connectTo } from "test/helper/Connect";
import { expect } from "chai";

describe("MidSideSplit", () => {

	BasicTests(MidSideSplit);

	context("Splitting", () => {

		it("handles inputs and outputs", () => {
			const split = new MidSideSplit();
			connectFrom().connect(split);
			split.mid.connect(connectTo());
			split.side.connect(connectTo());
			split.dispose();
		});

		it("mid is if both L and R are the same", () => {
			return Offline(() => {
				const split = new MidSideSplit();
				split.mid.toDestination();
				const merge = new Merge().connect(split);
				new Signal(0.5).connect(merge, 0, 0);
				new Signal(0.5).connect(merge, 0, 1);
			}).then((buffer) => {
				expect(buffer.min()).to.be.closeTo(0.707, 0.01);
				expect(buffer.max()).to.be.closeTo(0.707, 0.01);
			});
		});

		it("side is 0 if both L and R are the same", () => {
			return Offline(() => {
				const split = new MidSideSplit();
				split.side.toDestination();
				const merge = new Merge().connect(split);
				new Signal(0.5).connect(merge, 0, 0);
				new Signal(0.5).connect(merge, 0, 1);
			}).then((buffer) => {
				expect(buffer.min()).to.be.closeTo(0, 0.01);
				expect(buffer.max()).to.be.closeTo(0, 0.01);
			});
		});

		it("mid is 0 if both L and R opposites", () => {
			return Offline(() => {
				const split = new MidSideSplit();
				split.mid.toDestination();
				const merge = new Merge().connect(split);
				new Signal(-1).connect(merge, 0, 0);
				new Signal(1).connect(merge, 0, 1);
			}).then((buffer) => {
				expect(buffer.min()).to.be.closeTo(0, 0.01);
				expect(buffer.max()).to.be.closeTo(0, 0.01);
			});
		});

		it("can decompose and reconstruct a signal", () => {
			return Offline(() => {
				const midSideMerge = new MidSideMerge().toDestination();
				const split = new MidSideSplit();
				split.mid.connect(midSideMerge.mid);
				split.side.connect(midSideMerge.side);
				const merge = new Merge().connect(split);
				new Signal(0.2).connect(merge, 0, 0);
				new Signal(0.4).connect(merge, 0, 1);
			}, 0.1, 2).then((buffer) => {
				buffer.toArray()[0].forEach(l => expect(l).to.be.closeTo(0.2, 0.01));
				buffer.toArray()[1].forEach(r => expect(r).to.be.closeTo(0.4, 0.01));
			});
		});
	});
});

