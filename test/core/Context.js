define(["Test", "Tone/core/Context", "Tone/core/Tone", "helper/Offline"], 
	function (Test, Context, Tone, Offline) {

	context("Context", function(){
		it ("extends the AudioContext methods", function(){
			var ctx = new Context();
			expect(ctx).to.have.property("createGain");
			expect(ctx.createGain()).to.be.instanceOf(GainNode);
			expect(ctx).to.have.property("createOscillator");
			expect(ctx.createOscillator()).to.be.instanceOf(OscillatorNode);
			expect(ctx).to.have.property("createDelay");
			expect(ctx.createDelay()).to.be.instanceOf(DelayNode);
			return ctx.close();
		});

		it ("clock is running", function(done){
			var interval = setInterval(function(){
				if (Tone.context.currentTime > 0.5){
					clearInterval(interval);
					done();
				}
			}, 20);
		});

		it ("can be created an disposed", function(){
			var ctx = new Context();
			ctx.dispose();
			Test.wasDisposed(ctx);
		});
	});

	context("Timeouts", function(){

		it ("can set a timeout", function(done){
			var ctx = new Context();
			ctx.setTimeout(function(){
				done();
				ctx.dispose();
			}, 0.1);
		});

		it ("returns an id", function(){
			var ctx = new Context();
			expect(ctx.setTimeout(function(){}, 0.1)).to.be.a("number");
			ctx.dispose();
		});

		it ("timeout is not invoked when cancelled", function(done){
			var ctx = new Context();
			var id = ctx.setTimeout(function(){
				throw new Error("shouldn't be invoked");
			}, 0.01);
			ctx.clearTimeout(id);
			ctx.setTimeout(function(){
				done();
				ctx.dispose();
			}, 0.02);
		});

		it ("order is maintained", function(done){
			var ctx = new Context();
			var wasInvoked = false;
			ctx.setTimeout(function(){
				expect(wasInvoked).to.be.true;
				done();
				ctx.dispose();
			}, 0.011);
			ctx.setTimeout(function(){
				wasInvoked = true;
			}, 0.01);
		});

		it ("is invoked in the offline context", function(){
			return Offline(function(Transport){
				Transport.context.setTimeout(function(){
					expect(Tone.now()).to.be.closeTo(0.01, 0.005);
				}, 0.01);
			}, 0.05);
		});
	});

	context("Tone", function(){
		it ("has a context", function(){
			expect(Tone.context).to.exist;
			expect(Tone.context).to.be.instanceOf(Context);
		});

		it ("can set a new context", function(){
			Tone.context.close();
			Tone.context = new Context();
		});

		it ("invokes init when a new context is set", function(done){
			this.timeout(200);
			var initFn = function(context){
				expect(Tone.context).to.equal(context);
				Context.off("init", initFn);
				done();
			};
			Context.on("init", initFn);
			Tone.context.close();
			Tone.context = new Context();
		});
	});

	context("get/set", function(){

		it ("can set the lookAhead", function(){
			var ctx = new Context();
			ctx.lookAhead = 0.05;
			expect(ctx.lookAhead).to.equal(0.05);
			return ctx.close();
		});

		it ("can set the updateInterval", function(){
			var ctx = new Context();
			ctx.updateInterval = 0.05;
			expect(ctx.updateInterval).to.equal(0.05);
			return ctx.close();
		});

		it ("can set the latencyHint", function(){
			var ctx = new Context();
			ctx.latencyHint = "fastest";
			expect(ctx.latencyHint).to.equal("fastest");
			expect(ctx.lookAhead).to.be.closeTo(0.01, 0.05);
			expect(ctx.updateInterval).to.be.closeTo(0.01, 0.05);
			return ctx.close();
		});

		it ("gets a constant signal", function(){
			var ctx = new Context();
			var bufferSrc = ctx.getConstant(1);
			expect(bufferSrc).is.instanceOf(AudioBufferSourceNode);
			var buffer = bufferSrc.buffer.getChannelData(0);
			for (var i = 0; i < buffer.length; i++){
				expect(buffer[i]).to.equal(1);
			}
			ctx.close();
		});

		it ("multiple calls return the same buffer source", function(){
			var ctx = new Context();
			var bufferA = ctx.getConstant(2);
			var bufferB = ctx.getConstant(2);
			expect(bufferA).to.equal(bufferB);
			ctx.close();
		});

	});

});