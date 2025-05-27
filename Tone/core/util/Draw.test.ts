import { expect } from "chai";

import { DrawClass } from "./Draw.js";

describe("Draw", () => {
	it("can schedule a callback at a AudioContext time", (done) => {
		const draw = new DrawClass();
		const scheduledTime = draw.now() + 0.2;
		draw.schedule(() => {
			done();
			expect(draw.context.currentTime).to.be.closeTo(scheduledTime, 0.05);
			draw.dispose();
		}, scheduledTime);
	});

	it("can schedule multiple callbacks", (done) => {
		const draw = new DrawClass();
		let callbackCount = 0;
		const firstEvent = draw.now() + 0.1;
		draw.schedule(() => {
			callbackCount++;
			expect(draw.context.currentTime).to.be.closeTo(firstEvent, 0.05);
		}, firstEvent);

		const thirdEvent = draw.now() + 0.3;
		draw.schedule(() => {
			callbackCount++;
			expect(draw.context.currentTime).to.be.closeTo(thirdEvent, 0.05);
			expect(callbackCount).to.equal(3);
			done();
			draw.dispose();
		}, thirdEvent);

		const secondEvent = draw.now() + 0.2;
		draw.schedule(() => {
			callbackCount++;
			expect(draw.context.currentTime).to.be.closeTo(secondEvent, 0.05);
		}, secondEvent);
	});

	it("can cancel scheduled events", (done) => {
		const draw = new DrawClass();
		let callbackCount = 0;
		draw.schedule(() => {
			callbackCount++;
		}, draw.now() + 0.1);

		draw.schedule(() => {
			throw new Error("should not call this method");
		}, draw.now() + 0.2);

		draw.schedule(() => {
			throw new Error("should not call this method");
		}, draw.now() + 0.25);

		// cancel the second and third events
		draw.cancel(draw.now() + 0.15);

		// schedule another one after
		draw.schedule(() => {
			callbackCount++;
			expect(callbackCount).to.equal(2);
			done();
			draw.dispose();
		}, draw.now() + 0.3);
	});
});
