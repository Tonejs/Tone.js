import Test from "helper/Test";
import Context from "Tone/core/Context";
import Tone from "Tone/core/Tone";
import Offline from "helper/Offline";
import Supports from "helper/Supports";

describe("Context", function(){

	if (!Supports.AUDIO_CONTEXT_CLOSE_RESOLVES){
		return;
	}

	context("AudioContext", function(){

		it("extends the AudioContext methods", function(){
			var ctx = new Context();
			expect(ctx).to.have.property("createGain");
			expect(ctx.createGain()).to.be.instanceOf(GainNode);
			expect(ctx).to.have.property("createOscillator");
			expect(ctx.createOscillator()).to.be.instanceOf(OscillatorNode);
			expect(ctx).to.have.property("createDelay");
			expect(ctx.createDelay()).to.be.instanceOf(DelayNode);
			expect(ctx).to.have.property("createConstantSource");
			return ctx.dispose();
		});

		it("clock is running", function(done){
			var interval = setInterval(function(){
				if (Tone.context.currentTime > 0.5){
					clearInterval(interval);
					done();
				}
			}, 20);
		});

		it("can be created an disposed", function(){
			var ctx = new Context();
			return ctx.dispose().then(function(){
				Test.wasDisposed(ctx);
			});
		});

		it("has a rawContext", function(){
			var ctx = new Context();
			expect(ctx.rawContext).is.instanceOf(window.AudioContext);
			return ctx.dispose();
		});

		it("'dispose' returns a promise which resolves", function(){
			var ctx = new Context();
			var promise = ctx.dispose();
			expect(promise).to.have.property("then");
			return promise;
		});

		it("can be constructed with an options object", function(){
			var ctx = new Context({
				"lookAhead" : 0.2,
				"latencyHint" : "fastest",
				"clockSource" : "timeout"
			});
			expect(ctx.lookAhead).to.equal(0.2);
			expect(ctx.latencyHint).to.equal("fastest");
			expect(ctx.clockSource).to.equal("timeout");
			return ctx.dispose();
		});
	});

	if (Supports.ONLINE_TESTING){

		context("clockSource", function(){

			var ctx;
			beforeEach(function(){
				ctx = new Context();
				return ctx.resume();
			});

			afterEach(function(){
				return ctx.dispose();
			});

			it("defaults to 'worker'", function(){
				expect(ctx.clockSource).to.equal("worker");
			});

			it("provides callback", function(done){
				expect(ctx.clockSource).to.equal("worker");
				ctx.setTimeout(function(){
					done();
				}, 0.1);
			});

			it("can be set to 'timeout'", function(done){
				ctx.clockSource = "timeout";
				expect(ctx.clockSource).to.equal("timeout");
				ctx.setTimeout(function(){
					done();
				}, 0.1);
			});

			it("can be set to 'offline'", function(done){
				ctx.clockSource = "offline";
				expect(ctx.clockSource).to.equal("offline");
				//provides no callback
				ctx.setTimeout(function(){
					throw new Error("shouldn't be called");
				}, 0.1);
				setTimeout(function(){
					done();
				}, 200);
			});
		});
	}
	context("setTimeout", function(){

		if (Supports.ONLINE_TESTING){
				
			var ctx;
			beforeEach(function(){
				ctx = new Context();
				return ctx.resume();
			});

			afterEach(function(){
				return ctx.dispose();
			});

			it("can set a timeout", function(done){
				ctx.setTimeout(function(){
					done();
				}, 0.1);
			});

			it("returns an id", function(){
				expect(ctx.setTimeout(function(){}, 0.1)).to.be.a("number");
				//try clearing a random ID, shouldn't cause any errors
				ctx.clearTimeout(-2);
			});

			it("timeout is not invoked when cancelled", function(done){
				var id = ctx.setTimeout(function(){
					throw new Error("shouldn't be invoked");
				}, 0.01);
				ctx.clearTimeout(id);
				ctx.setTimeout(function(){
					done();
				}, 0.02);
			});

			it("order is maintained", function(done){
				var wasInvoked = false;
				ctx.setTimeout(function(){
					expect(wasInvoked).to.be.true;
					done();
				}, 0.02);
				ctx.setTimeout(function(){
					wasInvoked = true;
				}, 0.01);
			});
		}

		it("is invoked in the offline context", function(){
			return Offline(function(Transport){
				Transport.context.setTimeout(function(){
					expect(Tone.now()).to.be.closeTo(0.01, 0.005);
				}, 0.01);
			}, 0.05);
		});
	});

	context("Tone", function(){

		it("has a context", function(){
			expect(Tone.context).to.exist;
			expect(Tone.context).to.be.instanceOf(Context);
		});

		it("can set a new context", function(){
			var originalContext = Tone.context;
			Tone.context = new Context();
			return Tone.context.dispose().then(function(){
				Tone.context = originalContext;
			});
		});

		it("has a consistent context after offline rendering", function(){
			var initialContext = Tone.context;
			var initialTransport = Tone.Transport;
			return Offline(function(){}).then(function(){
				expect(Tone.context).to.equal(initialContext);
				expect(Tone.Transport).to.equal(initialTransport);
			});
		});

		it("invokes the resume promise", function(){
			return Tone.context.resume();
		});

		it("invokes init when a new context is set", function(done){
			this.timeout(200);
			var initFn = function(context){
				expect(Tone.context).to.equal(context);
				Context.off("init", initFn);
				done();
			};
			Context.on("init", initFn);
			Tone.context = new Context();
		});

		it("invokes close when a context is disposed", function(done){
			this.timeout(200);
			var closeFn = function(context){
				expect(context).to.be.instanceOf(Context);
				Context.off("close", closeFn);
				//set a new context
				Tone.context = new Context();
				done();
			};
			Context.on("close", closeFn);
			Tone.context.dispose();
		});

	});

	context("get/set", function(){

		var ctx;
		beforeEach(function(){
			ctx = new Context();
			return ctx.resume();
		});

		afterEach(function(){
			return ctx.dispose();
		});

		it("can set the lookAhead", function(){
			ctx.lookAhead = 0.05;
			expect(ctx.lookAhead).to.equal(0.05);
		});

		it("can set the updateInterval", function(){
			ctx.updateInterval = 0.05;
			expect(ctx.updateInterval).to.equal(0.05);
		});

		it("can set the latencyHint", function(){
			ctx.latencyHint = "fastest";
			expect(ctx.latencyHint).to.equal("fastest");
			expect(ctx.lookAhead).to.be.closeTo(0.01, 0.05);
			expect(ctx.updateInterval).to.be.closeTo(0.01, 0.05);
			// test all other latency hints
			var latencyHints = ["interactive", "playback", "balanced", 0.2];
			latencyHints.forEach(function(hint){
				ctx.latencyHint = hint;
				expect(ctx.latencyHint).to.equal(hint);
			});
		});

		it("gets a constant signal", function(){
			var bufferSrc = ctx.getConstant(1);
			expect(bufferSrc).is.instanceOf(AudioBufferSourceNode);
			var buffer = bufferSrc.buffer.getChannelData(0);
			for (var i = 0; i < buffer.length; i++){
				expect(buffer[i]).to.equal(1);
			}
		});

		it("multiple calls return the same buffer source", function(){
			var bufferA = ctx.getConstant(2);
			var bufferB = ctx.getConstant(2);
			expect(bufferA).to.equal(bufferB);
		});

	});
});

