import Test from "helper/Test";
import Clock from "Tone/core/Clock";
import Offline from "helper/Offline";
import Supports from "helper/Supports";
import Tone from "Tone/core/Tone";

describe("Clock", function(){

	it("can be created and disposed", function(){
		var clock = new Clock();
		clock.dispose();
		Test.wasDisposed(clock);
	});

	context("Get/Set values", function(){

		it("can get and set the frequency", function(){
			var clock = new Clock(function(){}, 2);
			expect(clock.frequency.value).to.equal(2);
			clock.frequency.value = 0.2;
			expect(clock.frequency.value).to.be.closeTo(0.2, 0.001);
			clock.dispose();
		});

		if (Supports.ONLINE_TESTING){

			it("invokes the callback when started", function(done){
				var clock = new Clock(function(){
					clock.dispose();
					done();
				}, 10).start();
			});

			it("can be constructed with an options object", function(done){
				var clock = new Clock({
					"callback" : function(){
						clock.dispose();
						done();
					},
					"frequency" : 8
				}).start();
				expect(clock.frequency.value).to.equal(8);
			});

		}

		it("can get and set it's values with the set/get", function(){
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

		it("correctly returns the scheduled play state", function(){
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
						expect(clock.ticks).to.be.greaterThan(0);
					});
					Test.whenBetween(time, 0.2, 0.3, function(){
						expect(clock.state).to.equal("stopped");
						expect(clock.ticks).to.equal(0);
					});
					Test.whenBetween(time, 0.3, 0.4, function(){
						expect(clock.state).to.equal("started");
						expect(clock.ticks).to.be.greaterThan(0);
					});
				};
			}, 0.5);
		});

		it("stop and immediately start", function(){
			return Offline(function(){
				var clock = new Clock();
				expect(clock.state).to.equal("stopped");
				clock.start(0).stop(0.1).start(0.1);
				expect(clock.state).to.equal("started");

				return function(sample, time){
					Test.whenBetween(time, 0, 0.1, function(){
						expect(clock.state).to.equal("started");
					});

					Test.whenBetween(time, 0.1, 0.5, function(){
						expect(clock.state).to.equal("started");
					});
				};

			}, 0.5);
		});
	});

	context("Scheduling", function(){

		if (Supports.ONLINE_TESTING){
				
			it("passes a time to the callback", function(done){
				var clock = new Clock(function(time){
					expect(time).to.be.a.number;
					clock.dispose();
					done();
				}, 10).start();
			});

			it("invokes the callback with a time great than now", function(done){
				var clock = new Clock(function(time){
					clock.dispose();
					expect(time).to.be.greaterThan(now);
					done();
				}, 10);
				var now = clock.now();
				var startTime = now + 0.1;
				clock.start(startTime);
			});

			it("invokes the first callback at the given start time", function(done){
				var clock = new Clock(function(time){
					clock.dispose();
					expect(time).to.be.closeTo(startTime, 0.01);
					done();
				}, 10);
				var startTime = clock.now() + 0.1;
				clock.start(startTime);
			});
		}

		it("can be scheduled to start in the future", function(){
			var invokations = 0;
			return Offline(function(){
				var clock = new Clock(function(time){
					invokations++;
				}, 2).start(0.1);
			}, 0.4).then(function(){
				expect(invokations).to.equal(1);
			});
		});

		it("invokes the right number of callbacks given the duration", function(){
			var invokations = 0;
			return Offline(function(){
				new Clock(function(time){
					invokations++;
				}, 10).start(0).stop(0.45);
			}, 0.6).then(function(){
				expect(invokations).to.equal(5);
			});
		});

		it("can schedule the frequency of the clock", function(){
			var invokations = 0;
			return Offline(function(){
				var clock = new Clock(function(time, ticks){
					invokations++;
				}, 2);
				clock.start(0).stop(1.01);
				clock.frequency.setValueAtTime(4, 0.5);
			}, 2).then(function(){
				expect(invokations).to.equal(4);
			});
		});

	});

	context("Seconds", function(){

		it("can set the current seconds", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 10);
				expect(clock.seconds).to.be.closeTo(0, 0.001);
				clock.seconds = 3;
				expect(clock.seconds).to.be.closeTo(3, 0.01);
				clock.dispose();
			});
		});

		it("can get the seconds", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 10);
				expect(clock.seconds).to.be.closeTo(0, 0.001);
				clock.start(0.05);
				return function(time){
					if (time > 0.05){
						expect(clock.seconds).to.be.closeTo(time - 0.05, 0.01);
					}
				};
			}, 0.1);
		});

		it("can get the seconds during a bpm ramp", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 10);
				expect(clock.seconds).to.be.closeTo(0, 0.001);
				clock.start(0.05);
				clock.frequency.linearRampTo(60, 0.5, 0.5);
				return function(time){
					if (time > 0.05){
						expect(clock.seconds).to.be.closeTo(time - 0.05, 0.01);
					}
				};
			}, 0.7);
		});

		it("can set seconds during a bpm ramp", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 10);
				expect(clock.seconds).to.be.closeTo(0, 0.001);
				clock.start(0.05);
				clock.frequency.linearRampTo(60, 0.5, 0.5);
				var changeSeconds = Test.atTime(0.4, function(){
					clock.seconds = 0;
				});
				return function(time){
					changeSeconds(time);
					if (time > 0.05 && time < 0.4){
						expect(clock.seconds).to.be.closeTo(time - 0.05, 0.01);
					} else if (time > 0.4){
						expect(clock.seconds).to.be.closeTo(time - 0.4, 0.01);
					}
				};
			}, 0.7);
		});
	});

	context("Ticks", function(){

		it("has 0 ticks when first created", function(){
			var clock = new Clock();
			expect(clock.ticks).to.equal(0);
			clock.dispose();
		});

		it("increments 1 tick per callback", function(){
			return Offline(function(){
				var ticks = 0;
				var clock = new Clock(function(){
					ticks++;
				}, 2).start();
				return Test.atTime(0.59, function(){
					expect(ticks).to.equal(clock.ticks);
				});
			}, 0.6).then(function(){
			});
		});

		it("resets ticks on stop", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 20).start(0).stop(0.1);
				return function(time){
					Test.whenBetween(time, 0.01, 0.09, function(){
						expect(clock.ticks).to.be.greaterThan(0);
					});
					Test.whenBetween(time, 0.1, Infinity, function(){
						expect(clock.ticks).to.equal(0);
					});
				};
			}, 0.2);
		});

		it("does not reset ticks on pause but stops incrementing", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 20).start(0).pause(0.1);
				var pausedTicks = 0;
				return function(time){
					Test.whenBetween(time, 0.01, 0.1, function(){
						expect(clock.ticks).to.be.greaterThan(0);
						pausedTicks = clock.ticks;
					});
					Test.whenBetween(time, 0.1, Infinity, function(){
						expect(clock.ticks).to.equal(pausedTicks);
					});
				};
			}, 0.2);
		});

		it("starts incrementing where it left off after pause", function(){

			return Offline(function(){
				var clock = new Clock(function(){}, 20).start(0).pause(0.1).start(0.2);

				var pausedTicks = 0;
				var tested = false;
				return function(time){
					Test.whenBetween(time, 0.01, 0.1, function(){
						expect(clock.ticks).to.be.greaterThan(0);
						pausedTicks = clock.ticks;
					});
					Test.whenBetween(time, 0.1, 0.19, function(){
						expect(clock.ticks).to.equal(pausedTicks);
					});
					Test.whenBetween(time, 0.21, Infinity, function(){
						if (!tested){
							tested = true;
							expect(clock.ticks).to.equal(pausedTicks + 1);
						}
					});
				};
			}, 0.3);
		});

		it("can start with a tick offset", function(){
			return Offline(function(){
				var tested = false;
				var clock = new Clock(function(time, ticks){
					if (!tested){
						tested = true;
						expect(ticks).to.equal(4);
					}
				}, 10);
				expect(clock.ticks).to.equal(0);
				clock.start(0, 4);
			});
		});

	});

	context("Events", function(){

		it("triggers the start event on start", function(done){
			Offline(function(){
				var clock = new Clock(function(){}, 20);
				var startTime = 0.3;
				clock.on("start", function(time, offset){
					expect(time).to.be.closeTo(startTime, 0.05);
					expect(offset).to.equal(0);
					done();
				});
				clock.start(startTime);
			}, 0.4);
		});

		it("triggers the start event with an offset", function(done){
			Offline(function(){
				var clock = new Clock(function(){}, 20);
				var startTime = 0.3;
				clock.on("start", function(time, offset){
					expect(time).to.be.closeTo(startTime, 0.05);
					expect(offset).to.equal(2);
					done();
				});
				clock.start(startTime, 2);
			}, 0.4);
		});

		it("triggers stop event", function(done){
			Offline(function(){
				var clock = new Clock(function(){}, 20);
				var stopTime = 0.3;
				clock.on("stop", function(time){
					expect(time).to.be.closeTo(stopTime, 0.05);
					done();
				});
				clock.start().stop(stopTime);
			}, 0.4);
		});

		it("triggers pause stop event", function(done){
			Offline(function(){
				var clock = new Clock(function(){}, 20);
				clock.on("pause", function(time){
					expect(time).to.be.closeTo(0.1, 0.05);
				}).on("stop", function(time){
					expect(time).to.be.closeTo(0.2, 0.05);
					done();
				});
				clock.start().pause(0.1).stop(0.2);
			}, 0.4);
		});

		it("triggers events even in close proximity", function(done){
			Offline(function(){
				var clock = new Clock(function(){}, 20);
				var invokedStartEvent = false;
				clock.on("start", function(){
					invokedStartEvent = true;
				});
				clock.on("stop", function(){
					expect(invokedStartEvent).to.be.true;
					done();
				});
				clock.start(0.09999).stop(0.1);
			}, 0.4);
		});
	});

	context("[get/set]Ticks", function(){

		it("always reports 0 if not started", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 20);
				expect(clock.getTicksAtTime(0)).to.equal(0);
				expect(clock.getTicksAtTime(1)).to.equal(0);
				expect(clock.getTicksAtTime(2)).to.equal(0);
				clock.dispose();
			});
		});

		it("can get ticks in the future", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 20);
				clock.start(1);
				expect(clock.getTicksAtTime(1)).to.be.closeTo(0, 0.01);
				expect(clock.getTicksAtTime(1.5)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(2)).to.be.closeTo(20, 0.01);
				clock.dispose();
			});
		});

		it("pauses on last ticks", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 20);
				clock.start(0).pause(1);
				expect(clock.getTicksAtTime(0.5)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(1)).to.be.closeTo(20, 0.01);
				expect(clock.getTicksAtTime(2)).to.be.closeTo(20, 0.01);
				expect(clock.getTicksAtTime(3)).to.be.closeTo(20, 0.01);
				clock.dispose();
			});
		});

		it("resumes from paused position", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 20);
				clock.start(0).pause(1).start(2);
				expect(clock.getTicksAtTime(0.5)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(1)).to.be.closeTo(20, 0.01);
				expect(clock.getTicksAtTime(2)).to.be.closeTo(20, 0.01);
				expect(clock.getTicksAtTime(3)).to.be.closeTo(40, 0.01);
				expect(clock.getTicksAtTime(3.5)).to.be.closeTo(50, 0.01);
				clock.dispose();
			});
		});

		it("can get tick position after multiple pauses", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 10);
				clock.start(0).pause(1).start(2).pause(3).start(4);
				expect(clock.getTicksAtTime(0.5)).to.be.closeTo(5, 0.01);
				expect(clock.getTicksAtTime(1)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(2)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(3)).to.be.closeTo(20, 0.01);
				expect(clock.getTicksAtTime(4)).to.be.closeTo(20, 0.01);
				expect(clock.getTicksAtTime(5)).to.be.closeTo(30, 0.01);
				clock.dispose();
			});
		});

		it("can get tick position after multiple pauses and tempo scheduling", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 10);
				clock.frequency.setValueAtTime(100, 3.5);
				clock.start(0).pause(1).start(2).pause(3).start(4);
				expect(clock.getTicksAtTime(0.5)).to.be.closeTo(5, 0.01);
				expect(clock.getTicksAtTime(1)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(2)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(3)).to.be.closeTo(20, 0.01);
				expect(clock.getTicksAtTime(4)).to.be.closeTo(20, 0.01);
				expect(clock.getTicksAtTime(5)).to.be.closeTo(120, 0.01);
				clock.dispose();
			});
		});

		it("can get tick position after multiple pauses and setting ticks", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 10);
				clock.start(0).pause(1).start(2).pause(3).start(4);
				clock.setTicksAtTime(10, 2.5);
				expect(clock.getTicksAtTime(0.5)).to.be.closeTo(5, 0.01);
				expect(clock.getTicksAtTime(1)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(2)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(3)).to.be.closeTo(15, 0.01);
				expect(clock.getTicksAtTime(4)).to.be.closeTo(15, 0.01);
				expect(clock.getTicksAtTime(5)).to.be.closeTo(25, 0.01);
				clock.dispose();
			});
		});

		it("resumes from paused position with tempo scheduling", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 20);
				clock.start(0).pause(1).start(2);
				clock.frequency.setValueAtTime(20, 0);
				clock.frequency.setValueAtTime(10, 0.5);
				expect(clock.getTicksAtTime(0.5)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(1)).to.be.closeTo(15, 0.01);
				expect(clock.getTicksAtTime(2)).to.be.closeTo(15, 0.01);
				expect(clock.getTicksAtTime(3)).to.be.closeTo(25, 0.01);
				expect(clock.getTicksAtTime(3.5)).to.be.closeTo(30, 0.01);
				clock.dispose();
			});
		});

		it("can set a tick value at the given time", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 20);
				clock.start(0);
				clock.setTicksAtTime(0, 1);
				clock.setTicksAtTime(0, 2);
				expect(clock.getTicksAtTime(0)).to.be.closeTo(0, 0.01);
				expect(clock.getTicksAtTime(0.5)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(1)).to.be.closeTo(0, 0.01);
				expect(clock.getTicksAtTime(1.5)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(2)).to.be.closeTo(0, 0.01);
				expect(clock.getTicksAtTime(2.5)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(3)).to.be.closeTo(20, 0.01);
				clock.dispose();
			});
		});

		it("can get a tick position while the frequency is scheduled with setValueAtTime", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 20);
				clock.start(0);
				clock.frequency.setValueAtTime(2, 1);
				clock.setTicksAtTime(0, 1);
				clock.setTicksAtTime(0, 2);
				expect(clock.getTicksAtTime(0)).to.be.closeTo(0, 0.01);
				expect(clock.getTicksAtTime(0.5)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(1)).to.be.closeTo(0, 0.01);
				expect(clock.getTicksAtTime(1.5)).to.be.closeTo(1, 0.01);
				expect(clock.getTicksAtTime(2)).to.be.closeTo(0, 0.01);
				expect(clock.getTicksAtTime(2.5)).to.be.closeTo(1, 0.01);
				expect(clock.getTicksAtTime(3)).to.be.closeTo(2, 0.01);
				clock.dispose();
			});
		});

		it("can get a tick position while the frequency is scheduled with linearRampTo", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 20);
				clock.start(0);
				clock.frequency.linearRampTo(2, 1, 1);
				clock.setTicksAtTime(0, 1);
				clock.setTicksAtTime(10, 2);
				expect(clock.getTicksAtTime(0)).to.be.closeTo(0, 0.01);
				expect(clock.getTicksAtTime(0.5)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(1)).to.be.closeTo(0, 0.01);
				expect(clock.getTicksAtTime(1.5)).to.be.closeTo(7.75, 0.01);
				expect(clock.getTicksAtTime(2)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(2.5)).to.be.closeTo(11, 0.01);
				expect(clock.getTicksAtTime(3)).to.be.closeTo(12, 0.01);
				clock.dispose();
			});
		});

		it("can get a tick position while the frequency is scheduled with exponentialRampTo", function(){
			return Offline(function(){
				var clock = new Clock(function(){}, 20);
				clock.start(0);
				clock.frequency.exponentialRampTo(2, 1, 1);
				clock.setTicksAtTime(0, 1);
				clock.setTicksAtTime(10, 2);
				expect(clock.getTicksAtTime(0)).to.be.closeTo(0, 0.01);
				expect(clock.getTicksAtTime(0.5)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(1)).to.be.closeTo(0, 0.01);
				expect(clock.getTicksAtTime(1.5)).to.be.closeTo(5.96, 0.01);
				expect(clock.getTicksAtTime(2)).to.be.closeTo(10, 0.01);
				expect(clock.getTicksAtTime(2.5)).to.be.closeTo(11, 0.01);
				expect(clock.getTicksAtTime(3)).to.be.closeTo(12, 0.01);
				clock.dispose();
			});
		});

	});

});

