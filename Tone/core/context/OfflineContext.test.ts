import { expect } from "chai";
import { OfflineContext } from "./OfflineContext";

context("OfflineContext", () => {

	it("can be created an disposed", () => {
		const ctx = new OfflineContext(1, 0.1, 44100);
		ctx.dispose();
	});

	it("is setup with 0 lookAhead and offline clockSource", () => {
		const ctx = new OfflineContext(1, 0.1, 44100);
		expect(ctx.lookAhead).to.equal(0);
		expect(ctx.clockSource).to.equal("offline");
		return ctx.dispose();
	});

	it("now = currentTime", () => {
		const ctx = new OfflineContext(1, 0.1, 44100);
		expect(ctx.currentTime).to.equal(ctx.now());
		return ctx.dispose();
	});

	it("can render audio", () => {
		const ctx = new OfflineContext(1, 0.2, 44100);
		const osc = ctx.createOscillator();
		osc.connect(ctx.destination);
		osc.start(0.1);
		return ctx.render().then(buffer => {
			expect(buffer).to.be.instanceOf(AudioBuffer);
			const array = buffer.getChannelData(0);
			for (let i = 0; i < array.length; i++) {
				if (array[i] !== 0) {
					expect(i / array.length).to.be.closeTo(0.5, 0.01);
					break;
				}
			}
		});
	});
});
