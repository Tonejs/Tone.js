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