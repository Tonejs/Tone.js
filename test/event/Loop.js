define(["helper/Basic", "Tone/event/Loop", "Tone/core/Tone", 
	"Tone/core/Transport", "helper/Offline2"], function (Basic, Loop, Tone, Transport, Offline) {

	describe("Loop", function(){

		Basic(Loop);

		function resetTransport(done){
			Tone.Transport.cancel(0);
			Tone.Transport.off("start stop pause loop");
			Tone.Transport.stop();
			Tone.Transport.loop = false;
			Tone.Transport.bpm.value = 120;
			Tone.Transport.timeSignature = [4, 4];
			setTimeout(done, 200);
		}

		context("Constructor", function(){

			afterEach(resetTransport);

			it ("takes a callback and an interval", function(){
				var callback = function(){};
				var loop = new Loop(callback, "8n");
				expect(loop.callback).to.equal(callback);
				expect(loop.interval).to.equal("8n");
				loop.dispose();
			});

			it ("can be constructed with no arguments", function(){
				var loop = new Loop();
				expect(loop.iterations).to.equal(Infinity);
				loop.dispose();
			});

			it ("can pass in arguments in options object", function(){
				var callback = function(){};
				var loop = new Loop({
					"callback" : callback,
					"iterations" : 4,
					"probability" : 0.3,
					"interval" : "8t"
				});
				expect(loop.callback).to.equal(callback);
				expect(loop.interval).to.equal("8t");
				expect(loop.iterations).to.equal(4);
				expect(loop.probability).to.equal(0.3);
				loop.dispose();
			});
		});

		context("Get/Set", function(){

			afterEach(resetTransport);

			it ("can set values with object", function(){
				var callback = function(){};
				var loop = new Loop();
				loop.set({
					"callback" : callback,
					"iterations" : 8
				});
				expect(loop.callback).to.equal(callback);
				expect(loop.iterations).to.equal(8);
				loop.dispose();
			});

			it ("can set get a the values as an object", function(){
				var callback = function(){};
				var loop = new Loop({
					"callback" : callback,
					"iterations" : 4,
					"probability" : 0.3
				});
				var values = loop.get();
				expect(values.iterations).to.equal(4);
				expect(values.probability).to.equal(0.3);
				loop.dispose();
			});
		});


		context("Callback", function(){

			afterEach(resetTransport);

			it ("does not invoke get invoked until started", function(done){

				Offline(function(dest, test, after){

					var loop = new Loop(function(){
						throw new Error("shouldn't call this callback");
					}, "8n");

					Tone.Transport.start();

					after(function(){
						loop.dispose();
						done();
					});

				}, 0.3);
			});

			it ("is invoked after it's started", function(done){
				var loop = new Loop(function(){
					loop.dispose();
					done();
				}, "8n").start(0);
				Tone.Transport.start();
			});

			it ("passes in the scheduled time to the callback", function(done){
				var now = Tone.Transport.now();
				var loop = new Loop(function(time){
					expect(time).to.be.a.number;
					expect(time - now).to.be.closeTo(0.3, 0.01);
					loop.dispose();
					done();
				});
				Tone.Transport.start();
				loop.start(0.3);
			});

			it ("can mute the callback", function(done){
				Offline(function(output, test, after){

					var loop = new Loop(function(){
						throw new Error("shouldn't call this callback");
					}, "4n").start();

					loop.mute = true;

					expect(loop.mute).to.be.true;

					Tone.Transport.start();

					after(function(){
						loop.dispose();
						done();
					});
				}, 0.4);
			});

			it ("can trigger with some probability", function(done){

				Offline(function(output, test, after){
					var loop = new Loop(function(){
						throw new Error("shouldn't call this callback");
					}, "4n").start();
					loop.probability = 0;
					expect(loop.probability).to.equal(0);
					Tone.Transport.start();
					after(function(){
						loop.dispose();
						done();
					});
				}, 0.4);
			});
		});

		context("Scheduling", function(){

			afterEach(resetTransport);

			it ("can be started and stopped multiple times", function(done){
				Offline(function(output, test, after){

					var loop = new Loop().start().stop(0.2).start(0.4);

					Tone.Transport.start(0);

					test(function(sample, time){
						if (time > 0.01 && time < 0.18){
							expect(loop.state).to.equal("started");	
						} else if (time > 0.2 && time < 0.38){
							expect(loop.state).to.equal("stopped");
						} else if (time > 0.4){
							expect(loop.state).to.equal("started");
						}
					});

					after(function(){
						loop.dispose();
						done();
					});

				}, 0.6);
			});

			it ("restarts when transport is restarted", function(done){
				var loop = new Loop().start(0).stop(0.4);
				setTimeout(function(){
					expect(loop.state).to.equal("started");
				}, 100);
				setTimeout(function(){
					expect(loop.state).to.equal("stopped");
					Tone.Transport.stop();
					setTimeout(function(){
						Tone.Transport.start();
						setTimeout(function(){
							expect(Tone.Transport.state).to.equal("started");
							expect(loop.state).to.equal("started");
							loop.dispose();
							done();
						}, 100);
					}, 100);
				}, 500);
				Tone.Transport.start();
			});


			it ("can be cancelled", function(done){
				var loop = new Loop().start(0);
				setTimeout(function(){
					expect(loop.state).to.equal("started");
					Tone.Transport.stop();
					loop.cancel();
					setTimeout(function(){
						Tone.Transport.start();
						setTimeout(function(){
							expect(loop.state).to.equal("stopped");
							loop.dispose();
							done();
						}, 100);
					}, 100);
				}, 100);
				Tone.Transport.start();
			});

		});

		context("Looping", function(){

			afterEach(resetTransport);

			it ("loops", function(done){

				Offline(function(output, test, after){

					var callCount = 0;
					var loop = new Loop({
						"interval" : 0.1,
						"callback" : function(){
							callCount++;
						}
					}).start(0);
					Tone.Transport.start();

					after(function(){
						expect(callCount).to.above(6);
						loop.dispose();	
						done();
					});

				}, 0.8);
			});

			it ("loops for the specified interval", function(done){
				var lastCall;
				var loop = new Loop({
					"interval" : "8n",
					"callback" : function(time){
						if (lastCall){
							expect(time - lastCall).to.be.closeTo(0.25, 0.01);
						}
						lastCall = time;
					}
				}).start(0);
				Tone.Transport.start();

				setTimeout(function(){
					loop.dispose();	
					done();
				}, 700);
			});

			it ("can loop a specific number of iterations", function(done){

				Offline(function(output, test, after){

					var callCount = 0;
					var loop = new Loop({
						"interval" : 0.1,
						"iterations" : 2,
						"callback" : function(){
							callCount++;
						}
					}).start(0);
					Tone.Transport.start();

					after(function(){
						expect(callCount).to.equal(2);
						expect(loop.state).to.equal("stopped");
						loop.dispose();	
						done();
					});
				}, 0.4);
			});

			it ("reports the progress of the loop", function(done){

				Offline(function(output, test, after){

					var loop = new Loop({
						"interval" : 1,
					}).start(0);

					Tone.Transport.start();

					after(function(){
						expect(loop.progress).to.be.closeTo(0.8, 0.05);
						loop.dispose();	
						done();
					});
				}, 0.8);

			});

		});

		context("playbackRate", function(){

			afterEach(resetTransport);

			it ("can adjust the playbackRate", function(done){

				Offline(function(output, test, after){

					var lastCall;
					
					var loop = new Loop({
						"playbackRate" : 2,
						"interval" : 0.5,
						"callback" : function(time){
							if (lastCall){
								expect(time - lastCall).to.be.closeTo(0.25, 0.01);
							}
							lastCall = time;
						}
					}).start(0);

					Tone.Transport.start();

					after(function(){
						loop.dispose();	
						done();
					});

				}, 0.7);
				
			});

		});

	});
});