import { expect } from "chai";

import { BasicTests } from "../../../test/helper/Basic.js";
import { Offline } from "../../../test/helper/Offline.js";
import { PassAudio } from "../../../test/helper/PassAudio.js";
import { Oscillator } from "../../source/oscillator/Oscillator.js";
import { Filter, FilterRollOff } from "./Filter.js";

describe("Filter", () => {
	BasicTests(Filter);

	context("Filtering", () => {
		it("can be constructed with a arguments", () => {
			const filter = new Filter(200, "highpass");
			expect(filter.frequency.value).to.be.closeTo(200, 0.001);
			expect(filter.type).to.equal("highpass");
			filter.dispose();
		});

		it("can be constructed with an object", () => {
			const filter = new Filter({
				frequency: 340,
				type: "bandpass",
			});
			expect(filter.frequency.value).to.be.closeTo(340, 0.001);
			expect(filter.type).to.equal("bandpass");
			filter.dispose();
		});

		it("can set/get values as an Object", () => {
			const filter = new Filter();
			const values = {
				Q: 2,
				frequency: 440,
				gain: -6,
				rolloff: -24 as FilterRollOff,
				type: "highpass" as BiquadFilterType,
			};
			filter.set(values);
			expect(filter.get()).to.include.keys([
				"type",
				"frequency",
				"rolloff",
				"Q",
				"gain",
			]);
			expect(filter.type).to.equal(values.type);
			expect(filter.frequency.value).to.equal(values.frequency);
			expect(filter.rolloff).to.equal(values.rolloff);
			expect(filter.Q.value).to.equal(values.Q);
			expect(filter.gain.value).to.be.closeTo(values.gain, 0.04);
			filter.dispose();
		});

		it("can get the frequency response curve", () => {
			const filter = new Filter();
			const curve = filter.getFrequencyResponse(32);
			expect(curve.length).to.equal(32);
			expect(curve[0]).be.closeTo(1, 0.01);
			expect(curve[5]).be.closeTo(0.5, 0.1);
			expect(curve[15]).be.closeTo(0, 0.01);
			expect(curve[31]).be.closeTo(0, 0.01);
			filter.dispose();
		});

		it("passes the incoming signal through", () => {
			return PassAudio((input) => {
				const filter = new Filter().toDestination();
				input.connect(filter);
			});
		});

		it("only accepts filter values -12, -24, -48 and -96", () => {
			const filter = new Filter();
			filter.rolloff = -12;
			expect(filter.rolloff).to.equal(-12);
			// @ts-ignore
			filter.rolloff = "-24";
			expect(filter.rolloff).to.equal(-24);
			filter.rolloff = -48;
			expect(filter.rolloff).to.equal(-48);
			filter.rolloff = -96;
			expect(filter.rolloff).to.equal(-96);
			expect(() => {
				// @ts-ignore
				filter.rolloff = -95;
			}).to.throw(Error);
			filter.dispose();
		});

		it("can set the basic filter types", () => {
			const filter = new Filter();
			const types: BiquadFilterType[] = [
				"lowpass",
				"highpass",
				"bandpass",
				"lowshelf",
				"highshelf",
				"notch",
				"allpass",
				"peaking",
			];
			for (const type of types) {
				filter.type = type;
				expect(filter.type).to.equal(type);
			}
			expect(() => {
				// @ts-ignore
				filter.type = "nontype";
			}).to.throw(Error);
			filter.dispose();
		});

		it("attenuates the incoming signal", async () => {
			const buffer = await Offline(() => {
				const filter = new Filter(700, "lowpass").toDestination();
				filter.Q.value = 0;
				const osc = new Oscillator(880).connect(filter);
				osc.start(0);
			}, 0.2);
			expect(buffer.getRmsAtTime(0.05)).to.be.within(0.37, 0.53);
			expect(buffer.getRmsAtTime(0.1)).to.be.within(0.37, 0.53);
		});
	});
});
