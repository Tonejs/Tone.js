import { expect } from "chai";
import { Offline } from "test/helper/Offline";
import { ONLINE_TESTING } from "test/helper/Supports";
import { Transport } from "../clock/Transport";
import { Tone } from "../Tone";
import { getAudioContext } from "./AudioContext";
import { Context } from "./Context";

describe("Context", () => {

// 	if (!Supports.AUDIO_CONTEXT_CLOSE_RESOLVES) {
// 		return;
// 	}

	context("AudioContext", () => {

		it("extends the AudioContext methods", () => {
			const ctx = new Context(getAudioContext());
			expect(ctx).to.have.property("createGain");
			expect(ctx.createGain()).to.be.instanceOf(GainNode);
			expect(ctx).to.have.property("createOscillator");
			expect(ctx.createOscillator()).to.be.instanceOf(OscillatorNode);
			expect(ctx).to.have.property("createDelay");
			expect(ctx.createDelay()).to.be.instanceOf(DelayNode);
			expect(ctx).to.have.property("createConstantSource");
			ctx.dispose();
		});

		if (ONLINE_TESTING) {
			it("clock is running", done => {
				const interval = setInterval(() => {
					if (Tone.context.currentTime > 0.5) {
						clearInterval(interval);
						done();
					}
				}, 20);
			});
		}

		it("has a rawContext", () => {
			const ctx = new Context(getAudioContext());
			expect(ctx.rawContext).is.instanceOf(AudioContext);
			return ctx.dispose();
		});

		it("can be constructed with an options object", () => {
			const ctx = new Context({
				clockSource: "timeout",
				latencyHint: "fastest",
				lookAhead: 0.2,
			});
			expect(ctx.lookAhead).to.equal(0.2);
			expect(ctx.latencyHint).to.equal("fastest");
			expect(ctx.clockSource).to.equal("timeout");
			return ctx.dispose();
		});
	});

	context("state", () => {

		it ("can suspend and resume the state", async () => {
			const ac = new AudioContext();
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
			const ac = new AudioContext();
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
			return context.close();
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
				return ctx.dispose();
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
				return ctx.dispose();
			});

			it("can set a timeout", done => {
				ctx.setTimeout(() => {
					done();
				}, 0.1);
			});

			it("returns an id", () => {
				// tslint:disable-next-line
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
				const transport = new Transport({context});
				transport.context.setTimeout(() => {
					expect(transport.now()).to.be.closeTo(0.01, 0.005);
				}, 0.01);
			}, 0.05);
		});
	});

// 	context("Tone", () => {

// 		it("has a context", () => {
// 			expect(Tone.context).to.exist;
// 			expect(Tone.context).to.be.instanceOf(Context);
// 		});

// 		it("can set a new context", () => {
// 			const originalContext = Tone.context;
// 			Tone.context = new Context();
// 			return Tone.context.dispose().then(() => {
// 				Tone.context = originalContext;
// 			});
// 		});

// 		it("has a consistent context after offline rendering", () => {
// 			const initialContext = Tone.context;
// 			const initialTransport = Tone.Transport;
// 			return Offline(() => { }).then(() => {
// 				expect(Tone.context).to.equal(initialContext);
// 				expect(Tone.Transport).to.equal(initialTransport);
// 			});
// 		});

// 		it("invokes the resume promise", () => {
// 			return Tone.context.resume();
// 		});

// 		it("invokes init when a new context is set", done => {
// 			this.timeout(200);
// 			const initFn = function(context) {
// 				expect(Tone.context).to.equal(context);
// 				Context.off("init", initFn);
// 				done();
// 			};
// 			Context.on("init", initFn);
// 			Tone.context = new Context();
// 		});

// 		it("invokes close when a context is disposed", done => {
// 			this.timeout(200);
// 			const closeFn = function(context) {
// 				expect(context).to.be.instanceOf(Context);
// 				Context.off("close", closeFn);
// 				// set a new context
// 				Tone.context = new Context();
// 				done();
// 			};
// 			Context.on("close", closeFn);
// 			Tone.context.dispose();
// 		});

// 	});

	context("get/set", () => {

		let ctx;
		beforeEach(() => {
			ctx = new Context();
			return ctx.resume();
		});

		afterEach(() => {
			return ctx.dispose();
		});

		it("can set the lookAhead", () => {
			ctx.lookAhead = 0.05;
			expect(ctx.lookAhead).to.equal(0.05);
		});

		it("can set the updateInterval", () => {
			ctx.updateInterval = 0.05;
			expect(ctx.updateInterval).to.equal(0.05);
		});

		it("can set the latencyHint", () => {
			ctx.latencyHint = "fastest";
			expect(ctx.latencyHint).to.equal("fastest");
			expect(ctx.lookAhead).to.be.closeTo(0.01, 0.05);
			expect(ctx.updateInterval).to.be.closeTo(0.01, 0.05);
			// test all other latency hints
			const latencyHints = ["interactive", "playback", "balanced", 0.2];
			latencyHints.forEach(hint => {
				ctx.latencyHint = hint;
				expect(ctx.latencyHint).to.equal(hint);
			});
		});

		it("gets a constant signal", () => {
			const bufferSrc = ctx.getConstant(1);
			expect(bufferSrc).is.instanceOf(AudioBufferSourceNode);
			const buffer = bufferSrc.buffer.getChannelData(0);
			buffer.forEach(sample => expect(sample).to.equal(1));
		});

		it("multiple calls return the same buffer source", () => {
			const bufferA = ctx.getConstant(2);
			const bufferB = ctx.getConstant(2);
			expect(bufferA).to.equal(bufferB);
		});

	});
});
