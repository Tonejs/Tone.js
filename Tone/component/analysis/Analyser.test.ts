import { expect } from "chai";
import sinon from "sinon";

import { BasicTests } from "../../../test/helper/Basic.js";
import { OfflineContext } from "../../core/context/OfflineContext.js";
import { Noise } from "../../source/Noise.js";
import { Analyser } from "./Analyser.js";

describe("Analyser", () => {
	BasicTests(Analyser);

	it("can get and set properties", () => {
		const anl = new Analyser();
		anl.set({
			size: 32,
			smoothing: 0.2,
		});
		const values = anl.get();
		expect(values.size).to.equal(32);
		expect(values.smoothing).to.equal(0.2);
		anl.dispose();
	});

	it("can correctly set the size", () => {
		const anl = new Analyser("fft", 512);
		expect(anl.size).to.equal(512);
		anl.size = 1024;
		expect(anl.size).to.equal(1024);
		anl.dispose();
	});

	it("can run fft analysis", () => {
		const anl = new Analyser("fft", 512);
		const analysis = anl.getValue();
		expect(analysis.length).to.equal(512);
		analysis.forEach((val) => {
			expect(val).is.lessThan(0);
		});
		anl.dispose();
	});

	it("can run waveform analysis", (done) => {
		const noise = new Noise();
		const anl = new Analyser("waveform", 256);
		noise.connect(anl);
		noise.start();

		setTimeout(() => {
			const analysis = anl.getValue();
			expect(analysis.length).to.equal(256);
			analysis.forEach((val) => {
				expect(val).is.within(-1, 1);
			});
			anl.dispose();
			noise.dispose();
			done();
		}, 300);
	});

	it("throws an error if an invalid type is set", () => {
		const anl = new Analyser("fft", 512);
		expect(() => {
			// @ts-ignore
			anl.type = "invalid";
		}).to.throw(Error);
		anl.dispose();
	});

	it("can do multichannel analysis", () => {
		const anl = new Analyser({
			type: "waveform",
			channels: 2,
			size: 512,
		});
		expect(anl.getValue().length).to.equal(2);
		expect(anl.getValue()[0].length).to.equal(512);
		anl.dispose();
	});

	context("Decibel range", () => {
		it("defaults to the AnalyserNode's range", () => {
			const anl = new Analyser();
			expect(anl.minDecibels).to.equal(-100);
			expect(anl.maxDecibels).to.equal(-30);
			anl.dispose();
		});

		it("sets the range on the AnalyserNode of each channel", () => {
			const context = new OfflineContext(2, 0.1, 44100);
			const createAnalyser = sinon.spy(context, "createAnalyser");
			const anl = new Analyser({
				context,
				channels: 2,
				minDecibels: -120,
				maxDecibels: -10,
			});
			const nodes = createAnalyser.returnValues;
			expect(nodes.length).to.equal(2);
			nodes.forEach((node) => {
				expect(node.minDecibels).to.equal(-120);
				expect(node.maxDecibels).to.equal(-10);
			});
			anl.minDecibels = -90;
			anl.maxDecibels = 0;
			expect(anl.minDecibels).to.equal(-90);
			expect(anl.maxDecibels).to.equal(0);
			nodes.forEach((node) => {
				expect(node.minDecibels).to.equal(-90);
				expect(node.maxDecibels).to.equal(0);
			});
			anl.dispose();
			context.dispose();
		});

		it("can be constructed with a range above or below the default", () => {
			const above = new Analyser({
				minDecibels: -20,
				maxDecibels: 0,
			});
			expect(above.minDecibels).to.equal(-20);
			expect(above.maxDecibels).to.equal(0);
			above.dispose();

			const below = new Analyser({
				minDecibels: -160,
				maxDecibels: -120,
			});
			expect(below.minDecibels).to.equal(-160);
			expect(below.maxDecibels).to.equal(-120);
			below.dispose();
		});

		it("can get and set the range as an object", () => {
			const anl = new Analyser();
			anl.set({
				minDecibels: -110,
				maxDecibels: -20,
			});
			const values = anl.get();
			expect(values.minDecibels).to.equal(-110);
			expect(values.maxDecibels).to.equal(-20);
			anl.dispose();
		});

		it("throws if minDecibels is not less than maxDecibels", () => {
			const anl = new Analyser();
			expect(() => {
				anl.minDecibels = -30;
			}).to.throw(Error);
			expect(() => {
				anl.maxDecibels = -100;
			}).to.throw(Error);
			expect(anl.minDecibels).to.equal(-100);
			expect(anl.maxDecibels).to.equal(-30);
			anl.dispose();
		});
	});
});
