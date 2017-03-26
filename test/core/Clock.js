define(["Test", "Tone/core/Clock", "helper/Offline"], 
	function (Test, Clock, Offline) {

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
				}, 10).start();
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
					"frequency" : 2
				});
				var gotValues = clock.get();
				expect(gotValues.frequency).to.equal(2);
				clock.dispose();
			});
		});

		context("State", function(){

			it ("correctly returns the scheduled play state", function(){
				return Offline(function(){
					var clock = new Clock();
					expect(clock.state).to.equal("stopped");
					clock.start(0).stop(0.2);
					expect(clock.state).to.equal("started");

					return function(sample, time){
						Test.whenBetween(time, 0, 0.2, function(){
							expect(clock.state).to.equal("started");
						});

						Test.whenBetween(time, 0.2, Infinity, function(){
							expect(clock.state).to.equal("stopped");
						});
					};
				}, 0.3);
			});

			it("can start, pause, and stop", function(){
				return Offline(function(){
					var clock = new Clock();
					expect(clock.state).to.equal("stopped");
					clock.start(0).pause(0.2).stop(0.4);
					expect(clock.state).to.equal("started");

					return function(sample, time){
						Test.whenBetween(time, 0, 0.2, function(){
							expect(clock.state).to.equal("started");
						});

						Test.whenBetween(time, 0.2, 0.4, function(){
							expect(clock.state).to.equal("paused");
						});

						Test.whenBetween(time, 0.4, Infinity, function(){
							expect(clock.state).to.equal("stopped");
						});
					};

				}, 0.5);
			});

			it("can schedule multiple start and stops", function(){
				return Offline(function(){
					var clock = new Clock();
					expect(clock.state).to.equal("stopped");
					clock.start(0).pause(0.1).stop(0.2).start(0.3).stop(0.4);
					expect(clock.state).to.equal("started");

					return function(sample, time){
						Test.whenBetween(time, 0.1, 0.2, function(){
							expect(clock.state).to.equal("paused");
						});
						Test.whenBetween(time, 0.2, 0.3, function(){
							expect(clock.state).to.equal("stopped");
						});
						Test.whenBetween(time, 0.3, 0.4, function(){
							expect(clock.state).to.equal("started");
						});
					};
				}, 0.5);
			});
		});

		context("Scheduling", function(){

			it ("passes a time to the callback", function(done){
				var clock = new Clock(function(time){
					expect(time).to.be.a.number;
					clock.dispose();
					done();
				}, 10).start();
			});

			it ("invokes the callback with a time great than now", function(done){
				var clock = new Clock(function(time){
					clock.dispose();
					expect(time).to.be.greaterThan(now);
					done();
				}, 10);
				var now = clock.now();
				var startTime = now + 0.1;
				clock.start(startTime);
			});

			it ("invokes the first callback at the given start time", function(done){
				var clock = new Clock(function(time){
					clock.dispose();
					expect(time).to.equal(startTime);
					done();
				}, 10);
				var startTime = clock.now() + 0.1;
				clock.start(startTime);
			});

			it ("can be scheduled to stop in the future", function(){
				var invokations = 0;
				return Offline(function(){
					new Clock(function(){
						invokations++;
					}, 0.5).start(0);
				}, 0.6).then(function(){
					expect(invokations).to.equal(1);
				});
			});

			it ("invokes the right number of callbacks given the duration", function(){
				var invokations = 0;
				return Offline(function(){
					new Clock(function(){
						invokations++;
					}, 10).start(0).stop(0.49);
				}, 0.6).then(function(){
					expect(invokations).to.equal(5);
				});
			});


			it ("can schedule the frequency of the clock", function(){
				var invokations = 0;
				return Offline(function(){
					var clock = new Clock(function(){
						invokations++;
					}, 2);
					clock.start(0).stop(1.1);
					clock.frequency.setValueAtTime(4, 0.5);
				}, 2).then(function(){
					expect(invokations).to.equal(4);
				});
			});
		});

		context("Ticks", function(){

			it ("has 0 ticks when first created", function(){
				var clock = new Clock();
				expect(clock.ticks).to.equal(0);
				clock.dispose();
			});

			it ("increments 1 tick per callback", function(){
				var ticks = 0;
				var clock;
				return Offline(function(){
					clock = new Clock(function(){
						ticks++;
					}, 0.05).start();
				}, 0.6).then(function(){
					expect(ticks).to.equal(clock.ticks);
				});
			});

			it ("resets ticks on stop", function(){
				return Offline(function(){
					var clock = new Clock(function(){}, 20).start(0).stop(0.1);
					return function(time){
						Test.whenBetween(time, 0, 0.09, function(){
							expect(clock.ticks).to.be.greaterThan(0);
						});
						Test.whenBetween(time, 0.1, Infinity, function(){
							expect(clock.ticks).to.equal(0);
						});
					};
				}, 0.2);
			});

			it ("does not reset ticks on pause but stops incrementing", function(){
				return Offline(function(){
					var clock = new Clock(function(){}, 20).start(0).pause(0.1);
					var pausedTicks = 0;
					return function(time){
						Test.whenBetween(time, 0, 0.1, function(){
							expect(clock.ticks).to.be.greaterThan(0);
							pausedTicks = clock.ticks;
						});
						Test.whenBetween(time, 0.1, Infinity, function(){
							expect(clock.ticks).to.equal(pausedTicks);
						});
					};
				}, 0.2);
			});

			it ("starts incrementing where it left off after pause", function(){

				return Offline(function(){
					var clock = new Clock(function(){}, 20).start(0).pause(0.1).start(0.2);

					var pausedTicks = 0;
					var tested = false;
					return function(time){
						Test.whenBetween(time, 0, 0.1, function(){
							expect(clock.ticks).to.be.greaterThan(0);
							pausedTicks = clock.ticks;
						});
						Test.whenBetween(time, 0.1, 0.19, function(){
							expect(clock.ticks).to.equal(pausedTicks);
						});
						Test.whenBetween(time, 0.2, Infinity, function(){
							if (!tested){
								tested = true;
								expect(clock.ticks).to.equal(pausedTicks + 1);
							}
						});
					};
				}, 0.3);
			});

			it ("can start with a tick offset", function(){
				return Offline(function(){
					var tested = false;
					var clock = new Clock(function(){
						if (!tested){
							tested = true;
							expect(clock.ticks).to.equal(4);
						}
					}, 10);
					expect(clock.ticks).to.equal(0);
					clock.start(0, 4);
				});
			});
		});

		context("Events", function(){

			it ("triggers the start event on start", function(){
				return Offline(function(){
					var clock = new Clock(function(){}, 20);
					var startTime = 0.3;
					clock.on("start", function(time, offset){
						expect(time).to.be.closeTo(startTime, 0.05);
						expect(offset).to.equal(0);
					});
					clock.start(startTime);
				}, 0.4);
			});
			
			it ("triggers the start event with an offset", function(done){
				return Offline(function(){
					var clock = new Clock(function(){}, 20);
					var startTime = 0.3;
					clock.on("start", function(time, offset){
						expect(time).to.be.closeTo(startTime, 0.05);
						expect(offset).to.equal(2);
						clock.dispose();
						done();
					});
					clock.start(startTime, 2);
				}, 0.4);
			});

			it ("triggers stop event", function(){
				return Offline(function(){
					var clock = new Clock(function(){}, 20);
					var stopTime = 0.3;
					clock.on("stop", function(time){
						expect(time).to.be.closeTo(stopTime, 0.05);
					});
					clock.start().stop(stopTime);
				});
			});

			it ("triggers pause stop event", function(){
				return Offline(function(){
					var clock = new Clock(function(){}, 20);
					clock.on("pause", function(time){
						expect(time).to.be.closeTo(0.1, 0.05);
					}).on("stop", function(time){
						expect(time).to.be.closeTo(0.2, 0.05);
					});
					clock.start().pause(0.1).stop(0.2);
				});
			});
		});

	});
});