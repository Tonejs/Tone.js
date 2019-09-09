import { expect } from "chai";
import { BasicTests } from "test/helper/Basic";
import { Noise } from "Tone/source/Noise";
import { FFT } from "./FFT";

describe("FFT", () => {

	BasicTests(FFT);

	it("can get and set properties", () => {
		const fft = new FFT();
		fft.set({
			size : 128,
			smoothing: 0.4,
		});
		const values = fft.get();
		expect(values.size).to.equal(128);
		expect(values.smoothing).to.equal(0.4);
		fft.dispose();
	});

	it("can correctly set the size", () => {
		const fft = new FFT(512);
		expect(fft.size).to.equal(512);
		fft.size = 1024;
		expect(fft.size).to.equal(1024);
		fft.dispose();
	});

	it("can set the smoothing", () => {
		const fft = new FFT(512);
		fft.smoothing = 0.2;
		expect(fft.smoothing).to.equal(0.2);
		fft.dispose();
	});

	it("can run waveform analysis", (done) => {
		const noise = new Noise();
		const fft = new FFT(256);
		noise.connect(fft);
		noise.start();

		setTimeout(() => {
			const analysis = fft.getValue();
			expect(analysis.length).to.equal(256);
			analysis.forEach(value => {
				expect(value).is.within(-Infinity, 0);
			});
			fft.dispose();
			noise.dispose();
			done();
		}, 300);
	});
});
