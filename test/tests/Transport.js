/* global it, describe, beforeEach, maxTimeout */

define(["chai", "Tone/core/Transport", "tests/Core", "tests/Common", "Tone/core/Clock"], function(chai, Transport, Core, Test, Clock){
	var expect = chai.expect;

	describe("Tone.Clock", function(){
		this.timeout(maxTimeout);

		it("can be created and destroyed", function(){
			var c = new Clock();
			c.dispose();
			Test.wasDisposed(c);
		});

		it("invokes a callback at regular intervals", function(done){
			var tickCount = 0;
			var clock;
			Test.offlineTest(11, function(){
				clock = new Clock(1, function(){
					tickCount++;
				});
				clock.start();
			}, function(){
			}, function(){
				expect(tickCount).to.be.above(9);
				done();
			});
		});
	});

	describe("Transport.setBpm  / getBpm", function(){
		this.timeout(maxTimeout);

		it("is the right bpm after starting", function(done){
			var duration = 2;
			Test.offlineTest(duration, function(){
				Transport.start();
			}, function(){
			}, function(){
				expect(Transport.getBpm()).to.equal(120);
				done();
			});
		});


		it("is the right bpm after stopping", function(done){
			Test.offlineTest(0.2, function(){
			}, function(){
			}, function(){
				expect(Transport.getBpm()).to.equal(120);
				done();
			});
		});

		it("ramps to the right value", function(done){
			var duration = 2;
			Test.offlineTest(duration, function(){
				expect(Transport.getBpm()).to.equal(120);
				Transport.start();
				Transport.setBpm(200, 0.05);
			}, function(){
			}, function(){
				expect(Transport.getBpm()).to.equal(200);
				done();
			});
		});
	});

	describe("Transport.setTimeout", function(){
		this.timeout(maxTimeout);

		beforeEach(function(){
			Transport.clearTimeouts();
		});

		it("invokes a callback at the start", function(done){
			Transport.setBpm(240);
			var wasCalled = false;
			var duration = 2;
			Test.offlineTest(duration, function(){
				Transport.setTimeout(function(){
					wasCalled = true;
				}, 0);
				Transport.start();
			}, undefined, function(){
				expect(wasCalled).to.be.true;
				done();
			});
		});

		it("invokes the callback in the future", function(done){
			Transport.setBpm(240);
			var duration = 4;
			var firstCallback = 0;
			var callbackTime = 0;
			Test.offlineTest(duration, function(){
				Transport.setTimeout(function(time){
					firstCallback = time;
				}, 0);
				Transport.setTimeout(function(time){
					callbackTime = time;
				}, "4n");
				Transport.start();
			}, function(){}, function(){
				expect(callbackTime - firstCallback).to.be.closeTo(0.25, 0.1);
				done();
			});
		});

		it("invokes a callback at the right time even when the transport is looping at a smaller interval", function(done){
			Transport.loop = true;
			Transport.setLoopPoints(0, 0.3);
			var duration = 2;
			Test.offlineTest(duration, function(){
				Transport.setTimeout(function(){
					Transport.loop = false;
					done();
				}, 1);
				Transport.start();
			});
		});

		it("can clear a timeout", function(done){
			Transport.setBpm(120);
			Test.offlineTest(2, function(){
				var timeoutId = Transport.setTimeout(function(){
					throw new Error("should not have called this");
				}, "4n");
				Transport.clearTimeout(timeoutId);
				Transport.start();
			}, function(){}, function(){
				done();
			});
		});
	});

	describe("Transport.setInterval", function(){
		this.timeout(maxTimeout);

		beforeEach(function(){
			Transport.clearIntervals();
		});

		it("invokes a repeated event", function(done){
			Transport.setBpm(120);
			var callbackCount = 0;
			Test.offlineTest(4, function(){
				Transport.setInterval(function(){
					callbackCount++;
				}, "4n");
				Transport.start();
			}, function(){}, function(){
				expect(callbackCount).to.be.greaterThan(7);
				done();
			});
		});

		it("can clear an interval", function(done){
			Transport.setBpm(120);
			Test.offlineTest(2, function(){
				var timeoutId = Transport.setInterval(function(){
					throw new Error("should not have called this");
				}, "4n");
				Transport.clearInterval(timeoutId);
				Transport.start();
			}, function(){}, function(){
				done();
			});
		});
	});

	
	describe("Transport.setTimeline", function(){
		this.timeout(maxTimeout);

		beforeEach(function(){
			Transport.clearTimelines();
		});

		it("invokes the callback", function(done){
			Transport.setBpm(240);
			var wasCalled = false;
			Test.offlineTest(2, function(){
				Transport.setTimeline(function(){
					wasCalled = true;
				}, "0:3:0");
				Transport.start();
			}, undefined, function(){
				expect(wasCalled).to.be.true;
				done();
			});
		});

		
		it("can clear a timeline event", function(done){
			Transport.setBpm(120);
			Test.offlineTest(2, function(){
				var timeoutId = Transport.setTimeline(function(){
					throw new Error("should not have called this");
				}, "4n");
				Transport.clearTimeline(timeoutId);
				Transport.start();
			}, function(){}, function(){
				done();
			});
		});
	});
});