define(["Test", "Tone/core/Clock", "helper/Offline2"], function (Test, Clock, Offline) {

	describe("Clock", function(){

		it ("can be created and disposed", function(){
			var clock = new Clock();
			clock.dispose();
			Test.wasDisposed(clock);
		});

		context("Get/Set values", function(){

			it ("can get and set the frequency", function(){
				var clock = new Clock(function(){}, 2);
				expect(clock.frequency.value).to.equal(2);
				clock.frequency.value = 0.2;
				expect(clock.frequency.value).to.be.closeTo(0.2, 0.001);
				clock.dispose();
			});

			it ("invokes the callback when started", function(done){
				var clock = new Clock(function(){
					clock.dispose();
					done();
				}, 1).start();
			});

			it ("can be constructed with an options object", function(done){
				var clock = new Clock({
					"callback" : function(){
						clock.dispose();
						done();
					},
					"frequency" : 8
				}).start();
				expect(clock.frequency.value).to.equal(8);
			});

			it ("can get and set it's values with the set/get", function(){
				var clock = new Clock();
				clock.set({
					"frequency" : 2,
					"lookAhead" : 0.1
				});
				var gotValues = clock.get();
				expect(gotValues.frequency).to.equal(2);
				expect(gotValues.lookAhead).to.equal(0.1);
				clock.dispose();
			});

		});

		context("State", function(){

			it ("correctly returns the scheduled play state", function(done){
				Offline(function(output, testFn, tearDown){
					var clock = new Clock();
					expect(clock.state).to.equal("stopped");
					clock.start().stop(0.5);
					expect(clock.state).to.equal("started");

					tearDown(function(){
						expect(clock.state).to.equal("stopped");
						clock.dispose();
						done();
					});
				}, 0.6);
			});

			it("can start, pause, and stop", function(done){
				Offline(function(output, testFn, tearDown){
					var clock = new Clock();
					expect(clock.state).to.equal("stopped");
					clock.start().pause(0.2).stop(0.4);
					expect(clock.state).to.equal("started");

					testFn(function(sample, time){
						if (time >= 0.2 && time < 0.4){
							expect(clock.state).to.equal("paused");
						} else if (time >= 0.4){
							expect(clock.state).to.equal("stopped");
						}
					});

					tearDown(function(){
						clock.dispose();
						done();
					});
				}, 0.6);
			});

			it("can schedule multiple start and stops", function(done){
				Offline(function(output, testFn, tearDown){
					var clock = new Clock();
					expect(clock.state).to.equal("stopped");
					clock.start().pause(0.2).stop(0.4).start(0.6).stop(0.8);
					expect(clock.state).to.equal("started");

					testFn(function(sample, time){
						if (time >= 0.2 && time < 0.4){
							expect(clock.state).to.equal("paused");
						} else if (time >= 0.4 && time < 0.6){
							expect(clock.state).to.equal("stopped");
						} else if (time >= 0.6 && time < 0.8){
							expect(clock.state).to.equal("started");
						} else if (time >= 0.8){
							expect(clock.state).to.equal("stopped");
						}
					});

					tearDown(function(){
						clock.dispose();
						done();
					});
				}, 0.9);
			});
		});

		context("Scheduling", function(){

			it ("passes a time to the callback", function(done){
				var clock = new Clock(function(time){
					expect(time).to.be.a.number;
					clock.dispose();
					done();
				}, 1).start();
			});

			it ("invokes the callback with a time great than now", function(done){
				var clock = new Clock(function(time){
					clock.dispose();
					expect(time).to.be.greaterThan(now);
					done();
				}, 1);
				var now = clock.now();
				var startTime = now + 0.1;
				clock.start(startTime);
			});

			it ("invokes the callback with a time equal to the lookAhead time", function(done){
				var clock = new Clock(function(time){
					clock.dispose();
					expect(time - now).to.be.closeTo(clock.lookAhead, 0.01);
					done();
				}, 1);
				clock.lookAhead = 0.1;
				var now = clock.now();
				var startTime = now + 0.1;
				clock.start(startTime);
			});

			it ("invokes the first callback at the given start time", function(done){
				var clock = new Clock(function(time){
					clock.dispose();
					expect(time).to.equal(startTime);
					done();
				}, 1);
				var startTime = clock.now() + 0.1;
				clock.start(startTime);
			});

			it ("can be scheduled to stop in the future", function(done){
				Offline(function(output, testFn, tearDown){
					var invokations = 0;
					var clock = new Clock(function(){
						invokations++;
					}, 0.5).start(0);

					tearDown(function(){
						expect(invokations).to.equal(1);
						clock.dispose();
						done();
					});
				}, 0.6);
			});

			it ("invokes the right number of callbacks given the duration", function(done){
				Offline(function(output, testFn, tearDown){
					var invokations = 0;
					var clock = new Clock(function(){
						invokations++;
					}, 10).start(0);

					tearDown(function(){
						expect(invokations).to.equal(5);
						clock.dispose();
						done();
					});
				}, 0.45);
			});

			it ("can schedule the frequency of the clock", function(done){
				Offline(function(output, testFn, tearDown){
					var invokations = 0;
					var clock = new Clock(function(){
						invokations++;
					}, 2);
					clock.start(0).stop(1.1);
					clock.frequency.setValueAtTime(4, 0.5);

					tearDown(function(){
						expect(invokations).to.equal(4);
						clock.dispose();
						done();
					});
				}, 2);
			});

		});

		context("Ticks", function(){

			it ("has 0 ticks when first created", function(){
				var clock = new Clock();
				expect(clock.ticks).to.equal(0);
				clock.dispose();
			});

			it ("increments 1 tick per callback", function(done){
				Offline(function(output, testFn, tearDown){
					var ticks = 0;
					var clock = new Clock(function(){
						ticks++;
					}, 0.05).start();

					tearDown(function(){
						expect(ticks).to.equal(clock.ticks);
						clock.dispose();
						done();
					});
				}, 0.6);
			});

			it ("resets ticks on stop", function(done){
				Offline(function(output, testFn, tearDown){
					var clock = new Clock(function(){}, 0.05).start().stop(0.5);

					testFn(function(sample, time){
						if (time > 0.05 && time < 0.5){
							expect(clock.ticks).to.be.above(0);
						}
					});

					tearDown(function(){
						expect(clock.ticks).to.equal(0);
						clock.dispose();
						done();
					});
				}, 0.6);
			});

			it ("does not reset ticks on pause but stops incrementing", function(done){

				Offline(function(output, testFn, tearDown){
					var clock = new Clock(function(){}, 0.05).start().pause(0.3);

					var pausedTicks = 0;
					testFn(function(sample, time){
						if (time > 0.05 && time < 0.3){
							expect(clock.ticks).to.be.above(0);
							pausedTicks = clock.ticks;
						} else if (time >= 0.3){
							expect(pausedTicks).to.equal(pausedTicks);
						}
					});

					tearDown(function(){
						clock.dispose();
						done();
					});
				}, 0.6);
			});

			it ("can start with a tick offset", function(done){
				var clock = new Clock(function(){
					expect(clock.ticks).to.equal(4);
					clock.dispose();
					done();
				}, 0.5);
				expect(clock.ticks).to.equal(0);
				clock.start(undefined, 4);
			});
		});

	});
});