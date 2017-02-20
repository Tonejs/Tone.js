define(["helper/Basic", "Tone/source/BufferSource", "helper/Offline", "Tone/core/Buffer", "helper/Meter"], 
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

			it("loops the audio", function(){
				return Offline(function(){
					var player = new BufferSource(buffer);
					player.loop = true;
					player.toMaster();
					player.start(0);
				}, buffer.duration * 2).then(function(buff){
					buff.getRMS().forEach(function(val){
						expect(val).to.be.above(0);
					});
				});
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

			it("can play for a specific duration", function(){
				return Meter(function(){
					var player = new BufferSource(buffer);
					player.toMaster();
					player.start(0).stop(0.1);

					return function(time){
						if (time > 0.1){
							expect(player.state).to.equal("stopped");
						}
					};
				}, 0.4).then(function(buffer){
					buffer.forEach(function(level, time){
						if (time >= 0 && time < 0.1){
							expect(level).to.be.greaterThan(0);
						} else if (time > 0.1){
							expect(level).to.equal(0);
						}
					});
				});
			});

			it("can play for a specific duration passed in the 'start' method", function(){
				return Meter(function(){
					var player = new BufferSource(buffer);
					player.toMaster();
					player.start(0, 0, 0.1);

					return function(time){
						if (time > 0.1){
							expect(player.state).to.equal("stopped");
						}
					};
				}, 0.4).then(function(buffer){
					buffer.forEach(function(level, time){
						if (time >= 0 && time < 0.1){
							expect(level).to.be.greaterThan(0);
						} else if (time > 0.1){
							expect(level).to.equal(0);
						}
					});
				});
			});

			it("reports the right state", function(){
				return Offline(function(){
					var player = new BufferSource(buffer).toMaster();
					player.start(0.2).stop(0.4);

					return function(time){
						if (time >= 0.2 && time < 0.4){
							expect(player.state).to.equal("started");
						} else {
							expect(player.state).to.equal("stopped");
						}
					};
				}, 0.5);
			});

			it("schedules the onended callback", function(done){

				var player = new BufferSource(buffer);
				player.start().stop("+0.1");

				var wasCalled = false;
				player.onended = function(plyr){
					expect(plyr).to.equal(player);
					wasCalled = true;
				};
				setTimeout(function(){
					expect(wasCalled).to.be.true;
					expect(player.state).to.equal("stopped");
					player.dispose();
					done();
				}, 300);
			});

			it("can be scheduled to stop", function(){
				return Meter(function(){
					var player = new BufferSource(buffer).toMaster();
					player.start(0).stop(0.1);
				}, 0.6).then(function(rms){
					rms.forEach(function(level, time){
						if (time > 0.01 && time < 0.1){
							expect(level).to.be.gt(0);
						} else if (time > 0.11){
							expect(level).to.equal(0);
						}
					});
				});
			});

			it("can be scheduled to stop with a ramp", function(){
				return Meter(function(){
					var player = new BufferSource(buffer).toMaster();
					player.start(0).stop(0.1, 0.1);
				}, 0.6).then(function(rms){
					rms.forEach(function(level, time){
						if (time > 0.01 && time < 0.2){
							expect(level).to.be.gt(0);
						} else if (time > 0.21){
							expect(level).to.equal(0);
						}
					});
				});
			});

			it("can be scheduled to start at a lower gain", function(){
				return Offline(function(){
					var player = new BufferSource(buffer).toMaster();
					player.start(0, 0, undefined, 0.5);
				}, 0.5).then(function(buffer){
					buffer.forEach(function(sample){
						expect(sample).to.be.lte(0.5);
					});
				});
			});

			it("can be scheduled to start with a ramp", function(){
				return Offline(function(){
					var player = new BufferSource(buffer).toMaster();
					player.start(0, 0, undefined, 1, 0.1);
				}, 0.5).then(function(buffer){
					buffer.forEach(function(sample, time){
						if (time < 0.1){
							expect(sample).to.be.lte(time * 10);
						}
					});
				});
			});
		});

	});
});