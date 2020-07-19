import { expect } from "chai";
import { BasicTests, warns } from "test/helper/Basic";
import { PassAudio } from "test/helper/PassAudio";
import { ONLINE_TESTING } from "test/helper/Supports";
import { Signal } from "Tone/signal/Signal";
import { DCMeter } from "./DCMeter";

describe("DCMeter", () => {

	BasicTests(DCMeter);

	context("DCMetering", () => {

		it("passes the audio through", () => {
			return PassAudio((input) => {
				const meter = new DCMeter().toDestination();
				input.connect(meter);
			});
		});

		if (ONLINE_TESTING) {
			it("can get the rms level of the incoming signal", (done) => {
				const meter = new DCMeter();
				const osc = new Signal(2).connect(meter);
				setTimeout(() => {
					expect(meter.getValue()).to.be.closeTo(2, 0.1);
					meter.dispose();
					osc.dispose();
					done();
				}, 400);
			});
		}
	});
});
