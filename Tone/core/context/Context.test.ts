import { expect } from "chai";
import { ConstantOutput } from "test/helper/ConstantOutput";
import { Offline } from "test/helper/Offline";
import { ONLINE_TESTING } from "test/helper/Supports";
import { Transport } from "../clock/Transport";
import { getContext } from "../Global";
import { createAudioContext } from "./AudioContext";
import { Context } from "./Context";
import { Destination } from "./Destination";
import { Listener } from "./Listener";
import { Draw } from "../util/Draw";
import { connect } from "./ToneAudioNode";

describe("Context", () => {

	it("creates and disposes the classes attached to the context", async () => {
		const ac = createAudioContext();
		const context = new Context(ac);
		const ctxDest = context.destination;
		const ctxDraw = context.draw;
		const ctxTransport = context.transport;
		const ctxListener = context.listener;
		expect(context.destination).is.instanceOf(Destination);
		expect(context.draw).is.instanceOf(Draw);
		expect(context.listener).is.instanceOf(Listener);
		await context.close();
		expect(ctxDest.disposed).to.be.true;
		expect(ctxDraw.disposed).to.be.true;
		expect(ctxTransport.disposed).to.be.true;
		expect(ctxListener.disposed).to.be.true;
		context.dispose();
	});

	context("AudioContext", () => {

		it("extends the AudioContext methods", () => {
			const ctx = new Context(createAudioContext());
			expect(ctx).to.have.property("createGain");
			expect(ctx.createGain()).to.have.property("gain");
			expect(ctx).to.have.property("createOscillator");
			expect(ctx.createOscillator()).to.be.have.property("frequency");
			expect(ctx).to.have.property("createDelay");
			expect(ctx.createDelay()).to.be.have.property("delayTime");
			expect(ctx).to.have.property("createConstantSource");
			ctx.dispose();
			return ctx.close();
		});

		if (ONLINE_TESTING) {
			it("clock is running", done => {
				const interval = setInterval(() => {
					if (getContext().currentTime > 0.5) {
						clearInterval(interval);
						done();
					}
				}, 20);
			});
		}

		it("has a rawContext", () => {
			const ctx = new Context(createAudioContext());
			expect(ctx.rawContext).has.property("destination");
			expect(ctx.rawContext).has.property("sampleRate");
			ctx.dispose();
			return ctx.close();
		});

		it("can be constructed with an options object", () => {
			const ctx = new Context({
				clockSource: "timeout",
				latencyHint: "playback",
				lookAhead: 0.2,
			});
			expect(ctx.lookAhead).to.equal(0.2);
			expect(ctx.latencyHint).to.equal("playback");
			expect(ctx.clockSource).to.equal("timeout");
			ctx.dispose();
			return ctx.close();
		});

		it("returns 'now' and 'immediate' time", () => {
			const ctx = new Context();
			expect(ctx.now()).to.be.a("number");
			expect(ctx.immediate()).to.be.a("number");
			ctx.dispose();
			return ctx.close();
		});
	});

	context("state", () => {

		it("can suspend and resume the state", async () => {
			const ac = createAudioContext();
			const context = new Context(ac);
			expect(context.rawContext).to.equal(ac);
			await ac.suspend();
			expect(context.state).to.equal("suspended");
			await context.resume();
			expect(context.state).to.equal("running");
			context.dispose();
			return context.close();
		});

		it("invokes the statechange event", async () => {
			const ac = createAudioContext();
			const context = new Context(ac);
			let triggerChange = false;
			context.on("statechange", state => {
				if (!triggerChange) {
					triggerChange = true;
					expect(state).to.equal("running");
				}
			});
			await context.resume();
			await new Promise(done => setTimeout(() => done(), 10));
			expect(triggerChange).to.equal(true);
			context.dispose();
			return ac.close();
		});
	});

	if (ONLINE_TESTING) {

		context("clockSource", () => {

			let ctx;
			beforeEach(() => {
				ctx = new Context();
				return ctx.resume();
			});

			afterEach(() => {
				ctx.dispose();
				return ctx.close();
			});

			it("defaults to 'worker'", () => {
				expect(ctx.clockSource).to.equal("worker");
			});

			it("provides callback", done => {
				expect(ctx.clockSource).to.equal("worker");
				ctx.setTimeout(() => {
					done();
				}, 0.1);
			});

			it("can be set to 'timeout'", done => {
				ctx.clockSource = "timeout";
				expect(ctx.clockSource).to.equal("timeout");
				ctx.setTimeout(() => {
					done();
				}, 0.1);
			});

			it("can be set to 'offline'", done => {
				ctx.clockSource = "offline";
				expect(ctx.clockSource).to.equal("offline");
				// provides no callback
				ctx.setTimeout(() => {
					throw new Error("shouldn't be called");
				}, 0.1);
				setTimeout(() => {
					done();
				}, 200);
			});
		});
	}
	context("setTimeout", () => {

		if (ONLINE_TESTING) {

			let ctx;
			beforeEach(() => {
				ctx = new Context();
				return ctx.resume();
			});

			afterEach(() => {
				ctx.dispose();
				return ctx.close();
			});

			it("can set a timeout", done => {
				ctx.setTimeout(() => {
					done();
				}, 0.1);
			});

			it("returns an id", () => {
				expect(ctx.setTimeout(() => { }, 0.1)).to.be.a("number");
				// try clearing a random ID, shouldn't cause any errors
				ctx.clearTimeout(-2);
			});

			it("timeout is not invoked when cancelled", done => {
				const id = ctx.setTimeout(() => {
					throw new Error("shouldn't be invoked");
				}, 0.01);
				ctx.clearTimeout(id);
				ctx.setTimeout(() => {
					done();
				}, 0.02);
			});

			it("order is maintained", done => {
				let wasInvoked = false;
				ctx.setTimeout(() => {
					expect(wasInvoked).to.equal(true);
					done();
				}, 0.02);
				ctx.setTimeout(() => {
					wasInvoked = true;
				}, 0.01);
			});
		}

		it("is invoked in the offline context", () => {
			return Offline(context => {
				const transport = new Transport({ context });
				transport.context.setTimeout(() => {
					expect(transport.now()).to.be.closeTo(0.01, 0.005);
				}, 0.01);
			}, 0.05);
		});
	});

	context("setInterval", () => {

		if (ONLINE_TESTING) {

			let ctx;
			beforeEach(() => {
				ctx = new Context();
				return ctx.resume();
			});

			afterEach(() => {
				ctx.dispose();
				return ctx.close();
			});

			it("can set an interval", done => {
				ctx.setInterval(() => {
					done();
				}, 0.1);
			});

			it("returns an id", () => {
				expect(ctx.setInterval(() => { }, 0.1)).to.be.a("number");
				// try clearing a random ID, shouldn't cause any errors
				ctx.clearInterval(-2);
			});

			it("timeout is not invoked when cancelled", done => {
				const id = ctx.setInterval(() => {
					throw new Error("shouldn't be invoked");
				}, 0.01);
				ctx.clearInterval(id);
				ctx.setInterval(() => {
					done();
				}, 0.02);
			});

			it("order is maintained", done => {
				let wasInvoked = false;
				ctx.setInterval(() => {
					expect(wasInvoked).to.equal(true);
					done();
				}, 0.02);
				ctx.setInterval(() => {
					wasInvoked = true;
				}, 0.01);
			});
		}

		it("is invoked in the offline context", () => {
			let invocationCount = 0;
			return Offline(context => {
				context.setInterval(() => {
					invocationCount++;
				}, 0.01);
			}, 0.051).then(() => {
				expect(invocationCount).to.equal(4);
			});
		});

		it("is invoked in with the right interval", () => {
			let numberOfInvocations = 0;
			return Offline(context => {
				let intervalTime = context.now();
				context.setInterval(() => {
					expect(context.now() - intervalTime).to.be.closeTo(0.01, 0.005);
					intervalTime = context.now();
					numberOfInvocations++;
				}, 0.01);
			}, 0.051).then(() => {
				expect(numberOfInvocations).to.equal(4);
			});
		});
	});

	context("get/set", () => {

		let ctx;
		beforeEach(() => {
			ctx = new Context();
			return ctx.resume();
		});

		afterEach(() => {
			ctx.dispose();
			return ctx.close();
		});

		it("can set the lookAhead", () => {
			ctx.lookAhead = 0.05;
			expect(ctx.lookAhead).to.equal(0.05);
		});

		it("can set the updateInterval", () => {
			ctx.updateInterval = 0.05;
			expect(ctx.updateInterval).to.equal(0.05);
		});

		it("gets a constant signal", () => {
			return ConstantOutput(context => {
				const bufferSrc = context.getConstant(1);
				connect(bufferSrc, context.destination);
			}, 1);
		});

		it("multiple calls return the same buffer source", () => {
			const bufferA = ctx.getConstant(2);
			const bufferB = ctx.getConstant(2);
			expect(bufferA).to.equal(bufferB);
		});

	});
});
