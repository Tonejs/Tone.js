define(["helper/Basic", "Tone/source/BufferSource", "helper/Offline2", "Tone/core/Buffer", "helper/Meter"], 
	function (BasicTests, BufferSource, Offline, Buffer, Meter) {

	if (window.__karma__){
		Buffer.baseUrl = "/base/test/";
	}

	describe("BufferSource", function(){

		var buffer = new Buffer();

		beforeEach(function(done){
			buffer.load("./audio/sine.wav", function(){
				done();
			});
		});

		//run the common tests
		BasicTests(BufferSource, buffer);

		context("Constructor", function(){

			it ("can be constructed with a Tone.Buffer", function(done){
				var source = new BufferSource(buffer);
				expect(source.buffer).to.equal(buffer.get());
				source.dispose();
				done();
			});

			it ("can be constructed with an AudioBuffer", function(done){
				var source = new BufferSource(buffer.get());
				expect(source.buffer).to.equal(buffer.get());
				source.dispose();
				done();
			});

			it("can be created with an options object", function(){
				var source = new BufferSource({
					"buffer" : buffer,
					"loop" : true
				});
				expect(source.loop).to.equal(true);
				source.dispose();
			});
		});

		context("Starts and Stops", function(){

			it ("can be constructed with a Tone.Buffer", function(done){
				var source = new BufferSource(buffer);
				expect(source.buffer).to.equal(buffer.get());
				source.dispose();
				done();
			});

			it ("can be constructed with an AudioBuffer", function(done){
				var source = new BufferSource(buffer.get());
				expect(source.buffer).to.equal(buffer.get());
				source.dispose();
				done();
			});

			it("can be created with an options object", function(){
				var source = new BufferSource({
					"buffer" : buffer,
					"loop" : true
				});
				expect(source.loop).to.equal(true);
				source.dispose();
			});
		});

		context("Looping", function(){

			beforeEach(function(done){
				buffer.load("./audio/short_sine.wav", function(){
					done();
				});
			});

			it("can be set to loop", function(){
				var player = new BufferSource();
				player.loop = true;
				expect(player.loop).to.be.true;
				player.dispose();
			});

			it("loops the audio", function(done){
				var player;
				var meter = new Meter(buffer.duration * 2);
				meter.before(function(dest){
					player = new BufferSource(buffer);
					player.loop = true;
					player.connect(dest);
					player.start(0);
				});
				meter.test(function(sample, time){
					if (time > 0.1){
						expect(sample).to.be.above(0);
					}
				});
				meter.after(function(){
					player.dispose();
					done();
				});
				meter.run();
			});

		});

		context("Get/Set", function(){

			it("can be set with an options object", function(){
				var player = new BufferSource();
				expect(player.loop).to.be.false;
				player.set({
					"loop" : true,
					"loopStart" : 0.4
				});
				expect(player.loop).to.be.true;
				expect(player.loopStart).to.equal(0.4);
				player.dispose();
			});


			it("can get/set the playbackRate", function(){
				var player = new BufferSource();
				player.playbackRate.value = 0.5;
				expect(player.playbackRate.value).to.equal(0.5);
				player.dispose();
			});

		});

		context("Start/Stop Scheduling", function(){

			beforeEach(function(done){
				buffer.load("./audio/sine.wav", function(){
					done();
				});
			});

			it("can be started with an offset", function(done){
				Offline(function(output, test, after){
					var audioBuffer = buffer.get().getChannelData(0);
					var testSample = audioBuffer[Math.floor(0.1 * buffer.context.sampleRate)];

					var player = new BufferSource(buffer).connect(output);
					player.start(0, 0.1);
					
					test(function(sample, time){
						if (time === 0){
							expect(sample).to.equal(testSample);
						}
					});

					after(function(){
						player.dispose();
						done();
					});
				}, 1);
			});

			it("can be play for a specific duration", function(done){
				var player;
				var meter = new Meter(0.4);
				meter.before(function(dest){
					player = new BufferSource(buffer);
					player.connect(dest);
					player.start(0).stop(0.1);
				});
				meter.test(function(sample, time){
					if (sample === 0){
						expect(time).to.at.least(0.1);
						expect(player.state).to.equal("stopped");
					}
				});
				meter.after(function(){
					player.dispose();
					done();
				});
				meter.run();
			});

			it("can be play for a specific duration passed in the 'start' method", function(done){
				var player;
				var meter = new Meter(0.4);
				meter.before(function(dest){
					player = new BufferSource(buffer);
					player.connect(dest);
					player.start(0, 0, 0.1);
				});
				meter.test(function(sample, time){
					if (sample < 0.001){
						expect(time).to.at.least(0.1);
						expect(player.state).to.equal("stopped");
					}
				});
				meter.after(function(){
					player.dispose();
					done();
				});
				meter.run();
			});

			/*it("reports itself as stopped after a single iterations of the buffer", function(done){
				Offline(function(output, test, after){
					var player = new BufferSource(buffer).toMaster();
					var duration = buffer.duration;
					player.start(0);

					test(function(sample, time){
						if (time > 0 && buffer < duration){
							expect(player.state).to.equal("started");
						}
					});
					after(function(){
						expect(player.state).to.equal("stopped");
						player.dispose();
						done();
					});
				}, 0.6);
			});*/

			it("schedules the onended callback", function(done){

				var player = new BufferSource(buffer).noGC();
				player.start().stop("+0.1");

				var wasCalled = false;
				player.onended = function(plyr){
					console.log("here");
					expect(plyr).to.equal(player);
					wasCalled = true;
				};
				setTimeout(function(){
					expect(player.state).to.equal("started");
				}, 50);
				setTimeout(function(){
					expect(wasCalled).to.be.true;
					expect(player.state).to.equal("stopped");
					player.dispose();
					done();
				}, 300);
				/*Offline(function(output, test, after){
					var player = new BufferSource(buffer).connect(output);
					player.start(0);

					var wasCalled = false;
					player.onended = function(plyr){
						console.log("here");
						expect(plyr).to.equal(player);
						wasCalled = true;
					};
					after(function(){
						expect(wasCalled).to.be.true;
						player.dispose();
						done();
					});
				}, 1);*/
			});

			it("can be scheduled to stop", function(done){
				Offline(function(output, test, after){
					var player = new BufferSource(buffer).toMaster();
					player.start(0).stop(0.1);

					test(function(sample, time){
						if (time > 0.1){
							expect(sample).to.equal(0);
						}
					});

					after(function(){
						player.dispose();
						done();
					});
				}, 0.6);
			});

			it("can be scheduled to stop with a ramp", function(done){
				Offline(function(output, test, after){
					var player = new BufferSource(buffer).toMaster();
					player.start(0).stop(0.1, 0.1);

					test(function(sample, time){
						if (time > 0.2){
							expect(sample).to.equal(0);
						}
					});

					after(function(){
						player.dispose();
						done();
					});
				}, 0.5);
			});

			it("can be scheduled to start at a lower gain", function(done){
				Offline(function(output, test, after){
					var player = new BufferSource(buffer).toMaster();
					player.start(0, 0, undefined, 0.5);

					test(function(sample){
						expect(sample).to.be.lte(0.5);
					});

					after(function(){
						player.dispose();
						done();
					});
				}, 0.5);
			});

			it("can be scheduled to start with a ramp", function(done){
				Offline(function(output, test, after){
					var player = new BufferSource(buffer).toMaster();
					player.start(0, 0, undefined, 1, 0.1);

					test(function(sample, time){
						if (time < 0.1){
							expect(sample).to.be.lte(time * 10);
						}
					});

					after(function(){
						player.dispose();
						done();
					});
				}, 0.5);
			});
		});

	});
});