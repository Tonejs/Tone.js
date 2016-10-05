define(["Test", "Tone/source/Source", "Tone/core/Transport", "helper/Offline2", "Tone/core/Tone"], 
function (Test, Source, Transport, OfflineTest, Tone) {

	describe("Source", function(){

		it("can be created and disposed", function(){
			var source = new Source();
			source.dispose();
			Test.wasDisposed(source);
		});

		it("can be started and stopped", function(){
			var source = new Source();
			source.start(0);
			source.stop(1);
			source.dispose();
		});

		it("can be constructed with an options object", function(){
			var source = new Source({
				"volume" : -20,
			});
			expect(source.volume.value).to.be.closeTo(-20, 0.1);
			source.dispose();
		});

		it("can be muted in the constructor options", function(){
			var source = new Source({
				"mute" : true
			});
			expect(source.mute).to.be.true;
			source.dispose();
		});

		it("can set the volume", function(){
			var source = new Source();
			source.volume.value = -8;
			expect(source.volume.value).to.be.closeTo(-8, 0.1);
			source.dispose();
		});

		it("can mute and unmute the source", function(){
			var source = new Source();
			source.volume.value = -8;
			source.mute = true;
			expect(source.mute).to.be.true;
			expect(source.volume.value).to.equal(-Infinity);
			source.mute = false;
			//returns the volume to what it was
			expect(source.volume.value).to.be.closeTo(-8, 0.1);
			source.dispose();
		});

		it("can get and set values with an object", function(){
			var source = new Source();
			source.set("volume", -10);
			expect(source.get().volume).to.be.closeTo(-10, 0.1);
			source.dispose();
		});

		it("is initally stopped", function(){
			var source = new Source();
			expect(source.state).to.equal("stopped");
			source.dispose();
		});

		it("cannot be scheduled to stop/start twice in a row", function(){
			var source = new Source();
			source.start(0).start(1);
			source.stop(2).stop(3);
			source.dispose();
		});

		it("has an output", function(){
			var source = new Source();
			source.connect(Test);
			source.dispose();
		});

		it("can be scheduled with multiple starts/stops", function(){
			var source = new Source();
			source.start(0).stop(0.5).start(0.75).stop(1).start(1.25).stop(1.5);
			expect(source._state.getStateAtTime(0)).to.equal("started");
			expect(source._state.getStateAtTime(0.5)).to.equal("stopped");
			expect(source._state.getStateAtTime(0.8)).to.equal("started");
			expect(source._state.getStateAtTime(1)).to.equal("stopped");
			expect(source._state.getStateAtTime(1.25)).to.equal("started");
			expect(source._state.getStateAtTime(1.6)).to.equal("stopped");
			source.dispose();
		});

		it ("correctly returns the scheduled play state", function(done){
			OfflineTest(function(output, testFn, tearDown){
				var source = new Source();
				expect(source.state).to.equal("stopped");
				source.start(0).stop(0.5);

				testFn(function(sample, time){
					if (time >= 0 && time < 0.5){
						expect(source.state).to.equal("started");
					} else if (time > 0.5){
						expect(source.state).to.equal("stopped");
					}
				});

				tearDown(function(){
					source.dispose();
					done();
				});
			}, 0.6);
		});

		context("sync", function(){

			it ("can sync its start to the Transport", function(){
				var source = new Source();
				source.sync().start(0);
				expect(source.state).to.equal("stopped");
				Tone.Transport.start();
				expect(source.state).to.equal("started");
				source.dispose();
				Tone.Transport.stop();
			});


			it ("can unsync after it was synced", function(){
				var source = new Source();
				source.sync().start(0);
				source.unsync();
				Tone.Transport.start();
				expect(source.state).to.equal("stopped");
			});

			it ("can sync its stop to the Transport", function(done){
				OfflineTest(function(output, testFn, tearDown){
					var source = new Source();
					source.sync().start(0);
					expect(source.state).to.equal("stopped");
					Tone.Transport.start().stop(0.4);
					expect(source.state).to.equal("started");

					testFn(function(sample, time){
						if (time > 0.4){
							expect(source.state).to.equal("stopped");
						}
					});

					tearDown(function(){
						source.dispose();
						done();
					});
				}, 0.5);
			});

			it ("can schedule multiple starts/stops", function(done){
				OfflineTest(function(output, testFn, tearDown){
					var source = new Source();
					source.sync().start(0.1).stop(0.2).start(0.3);
					Tone.Transport.start(0).stop(0.4);
					expect(source.state).to.equal("stopped");

					testFn(function(sample, time){
						if (time > 0.1 && time < 0.19){
							expect(source.state).to.equal("started");
						} else if (time > 0.2 && time < 0.29){
							expect(source.state).to.equal("stopped");
						} else if (time > 0.3 && time < 0.39){
							expect(source.state).to.equal("started");
						} else if (time > 0.4){
							expect(source.state).to.equal("stopped");
						}
					});

					tearDown(function(){
						source.dispose();
						done();
					});
				}, 0.6);
			});

			it ("has correct offset when the transport is started with an offset", function(done){
				OfflineTest(function(output, testFn, tearDown){
					var source = new Source();
					source.sync().start(0.3).stop(0.4);
					Tone.Transport.start(0, 0.1);
					expect(source.state).to.equal("stopped");

					testFn(function(sample, time){
						if (time > 0.21 && time < 0.29){
							expect(source.state).to.equal("started");
						} else if (time > 0.3){
							expect(source.state).to.equal("stopped");
						}
					});

					tearDown(function(){
						source.dispose();
						done();
					});
				}, 0.5);
			});

			it ("can start with an offset after the start time of the source", function(){
				var source = new Source();
				source.sync().start(0);
				Tone.Transport.start(0, 0.1);
				expect(source.state).to.equal("started");
				source.dispose();
			});

			it ("can sync its start to the Tone.Transport after a delay", function(done){
				OfflineTest(function(output, testFn, tearDown){
					var source = new Source();
					source.sync().start(0.3);
					Tone.Transport.start(0).stop(0.4);
					expect(source.state).to.equal("stopped");

					testFn(function(sample, time){
						if (time > 0.3 && time < 0.39){
							expect(source.state).to.equal("started");
						} else if (time > 0.4){
							expect(source.state).to.equal("stopped");
						}
					});

					tearDown(function(){
						source.dispose();
						done();
					});
				}, 0.6);
			});

			it ("correct state when the Transport position is changed", function(done){
				OfflineTest(function(output, testFn, tearDown){
					var source = new Source();
					source.sync().start(0.3).stop(0.4);
					Tone.Transport.start(0).stop(0.4);
					expect(source.state).to.equal("stopped");
					Tone.Transport.seconds = 0.305;
					expect(source.state).to.equal("started");
					Tone.Transport.seconds = 0.405;
					expect(source.state).to.equal("stopped");

					tearDown(function(){
						source.dispose();
						done();
					});
				}, 0.1);
			});

			it ("gives the correct offset on time on start/stop events", function(done){
				OfflineTest(function(output, testFn, tearDown){
					var source = new Source();
					source._start = function(time, offset){
						expect(time).to.be.closeTo(0.4, 0.05);
						expect(offset).to.be.closeTo(0.1, 0.05);
					};

					source._stop = function(time){
						expect(time).to.be.closeTo(0.5, 0.05);
					};

					source.sync().start(0.2, 0.1).stop(0.3);
					Tone.Transport.start(0.2);

					tearDown(function(){
						source.dispose();
						done();
					});
				}, 0.7);
			});

			it ("gives the correct offset on time on start/stop events invoked with an Transport offset", function(done){
				OfflineTest(function(output, testFn, tearDown){
					var source = new Source();
					source._start = function(time, offset){
						expect(time).to.be.closeTo(0.3, 0.05);
						expect(offset).to.be.closeTo(0.1, 0.05);
					};

					source._stop = function(time){
						expect(time).to.be.closeTo(0.4, 0.05);
					};

					source.sync().start(0.2, 0.1).stop(0.3);

					Tone.Transport.start(0.2, 0.1);

					tearDown(function(){
						source.dispose();
						done();
					});
				}, 0.7);
			});

			it ("gives the correct offset on time on start/stop events invoked with an Transport offset that's in the middle of the event", function(done){
				OfflineTest(function(output, testFn, tearDown){
					var source = new Source();
					source._start = function(time, offset){
						expect(time).to.be.closeTo(0.2, 0.05);
						expect(offset).to.be.closeTo(0.15, 0.05);
					};

					source._stop = function(time){
						expect(time).to.be.closeTo(0.25, 0.05);
					};

					source.sync().start(0.2, 0.1).stop(0.3);

					Tone.Transport.start(0.2, 0.25);

					tearDown(function(){
						source.dispose();
						done();
					});
				}, 0.7);
			});

			it ("gives the correct duration when invoked with an Transport offset that's in the middle of the event", function(done){
				OfflineTest(function(output, testFn, tearDown){
					var source = new Source();
					source._start = function(time, offset, duration){
						expect(time).to.be.closeTo(0, 0.05);
						expect(offset).to.be.closeTo(0.2, 0.05);
						expect(duration).to.be.closeTo(0.3, 0.05);
					};

					source._stop = function(time){
						expect(time).to.be.closeTo(0.1, 0.05);
					};

					source.sync().start(0.2, 0.1, 0.4).stop(0.4);

					Tone.Transport.start(0, 0.3);

					tearDown(function(){
						source.dispose();
						done();
					});
				}, 0.7);
			});

			it ("stops at the right time when Transport.stop is invoked before the scheduled stop", function(done){
				OfflineTest(function(output, testFn, tearDown){
					var source = new Source();

					source._stop = function(time){
						expect(time).to.be.closeTo(0.3, 0.05);
					};

					source.sync().start(0.2).stop(0.4);

					Tone.Transport.start(0).stop(0.3);

					tearDown(function(){
						source.dispose();
						done();
					});
				}, 0.7);
			});

			it ("invokes the right methods and offsets when the transport is seeked", function(done){
				OfflineTest(function(output, testFn, tearDown){
					var source = new Source();

					var seeked = false;

					source._start = function(time, offset){
						if(seeked){
							expect(time).to.be.closeTo(0.1, 0.05);
							expect(offset).to.be.closeTo(0.15, 0.05);
						} else {
							expect(time).to.be.closeTo(0, 0.05);
							expect(offset).to.be.closeTo(0.1, 0.05);
						}
					};

					source._stop = function(time){
						//invokes the stop and restarts it
						expect(time).to.be.closeTo(0.1, 0.05);
					};

					source.sync().start(0.2);

					Tone.Transport.start(0, 0.3);

					testFn(function(samples, time){
						if (time === 0.1){
							seeked = true;
							Tone.Transport.seconds = 0.35;
						}
					});

					tearDown(function(){
						source.dispose();
						done();
					});
				}, 0.7);
			});
		});
	});
});