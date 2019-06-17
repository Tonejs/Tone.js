import { expect } from "chai";
import { noOp } from "../util/Interface";
import { Offline } from "./Offline";
import { ToneAudioBuffer } from "./ToneAudioBuffer";
// import Transport from "Tone/core/Transport";
// import Oscillator from "Tone/source/Oscillator";
// import Tone from "Tone/core/Tone";
// import AudioBuffer from "Tone/core/Buffer";
// import BufferTest from "helper/BufferTest";

describe("Offline", () => {

	it("accepts a callback and a duration", () => {
		Offline(noOp, 0.01);
	});

	it("returns a promise", () => {
		expect(Offline(noOp, 0.01)).to.have.property("then");
	});

	it("generates a buffer", (done) => {
		Offline(noOp, 0.01).then((buffer) => {
			expect(buffer).to.be.instanceOf(ToneAudioBuffer);
			done();
		});
	});

	it("silent by default", (done) => {
		Offline(noOp, 0.01, 1).then((buffer) => {
			const isSilent = buffer.toArray().every(sample => sample === 0);
			expect(isSilent).to.equal(true);
			done();
		});
	});

	// it("records the master output", () => {
	// 	return Offline(() => {
	// 		new Oscillator().toMaster().start();
	// 	}, 0.01).then((buffer) => {
	// 		BufferTest(buffer);
	// 		expect(buffer.isSilent()).to.be.false;
	// 	});
	// });

	// it("returning a promise defers the rendering till the promise resolves", () => {
	// 	var wasInvoked = false;
	// 	return Offline(() => {
	// 		new Oscillator().toMaster().start();
	// 		return new Promise((done) => {
	// 			setTimeout(done, 100);
	// 		}).then(() => {
	// 			wasInvoked = true;
	// 		});
	// 	}, 0.01).then((buffer) => {
	// 		BufferTest(buffer);
	// 		expect(wasInvoked).to.be.true;
	// 		expect(buffer.isSilent()).to.be.false;
	// 	});
	// });

	// it("can schedule specific timing outputs", () => {
	// 	return Offline(() => {
	// 		new Oscillator().toMaster().start(0.05);
	// 	}, 0.1).then((buffer) => {
	// 		BufferTest(buffer);
	// 		expect(buffer.getFirstSoundTime()).to.be.closeTo(0.05, 0.0001);
	// 	});
	// });

	// it("can schedule Transport events", () => {
	// 	return Offline(function (Transport) {
	// 		var osc = new Oscillator().toMaster();
	// 		Transport.schedule(function (time) {
	// 			osc.start(time);
	// 		}, 0.05);
	// 		Transport.start(0);
	// 	}, 0.1).then((buffer) => {
	// 		BufferTest(buffer);
	// 		expect(buffer.getFirstSoundTime()).to.be.closeTo(0.05, 0.001);
	// 	});
	// });
});
