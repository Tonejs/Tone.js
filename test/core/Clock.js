define(["Test", "Tone/core/Clock"], function (Test, Clock) {

	describe("Clock", function(){

		this.timeout(2500);

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
				var clock = new Clock();
				expect(clock.state).to.equal("stopped");
				clock.start().stop("+0.5");
				setTimeout(function(){
					expect(clock.state).to.equal("started");
				}, 100);
				setTimeout(function(){
					expect(clock.state).to.equal("stopped");
					clock.dispose();
					done();
				}, 600);
			});

			it("can start, pause, and stop", function(done){
				var clock = new Clock();
				clock.start().pause("+0.2").stop("+0.4");
				setTimeout(function(){
					expect(clock.state).to.equal("started");
				}, 100);
				setTimeout(function(){
					expect(clock.state).to.equal("paused");
				}, 300);
				setTimeout(function(){
					expect(clock.state).to.equal("stopped");
					clock.dispose();
					done();
				}, 500);
			});

			it("can schedule multiple start and stops", function(done){
				var clock = new Clock();
				clock.start().pause("+0.2").stop("+0.4").start("+0.6").stop("+0.8");
				setTimeout(function(){
					expect(clock.state).to.equal("started");
					expect(clock.ticks).to.be.above(0);
				}, 100);
				setTimeout(function(){
					expect(clock.state).to.equal("paused");
					expect(clock.ticks).to.be.above(0);
				}, 300);
				setTimeout(function(){
					expect(clock.state).to.equal("stopped");
					expect(clock.ticks).to.equal(0);
				}, 500);
				setTimeout(function(){
					expect(clock.state).to.equal("started");
					expect(clock.ticks).to.be.above(0);
				}, 700);
				setTimeout(function(){
					expect(clock.state).to.equal("stopped");
					expect(clock.ticks).to.equal(0);
					clock.dispose();
					done();
				}, 900);
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
				var invokations = 0;
				var clock = new Clock(function(){
					invokations++;
				}, 2);
				var now = clock.now();
				var stopTime = now + 0.5;
				clock.start(now).stop(stopTime);
				setTimeout(function(){
					expect(invokations).to.equal(1);
					clock.dispose();
					done();
				}, 1000);
			});

			it ("invokes the right number of callbacks given the duration", function(done){
				var invokations = 0;
				var clock = new Clock(function(){
					invokations++;
				}, 10);
				var now = clock.now();
				var stopTime = now + 0.5;
				clock.start(now).stop(stopTime);
				setTimeout(function(){
					expect(invokations).to.equal(5);
					clock.dispose();
					done();
				}, 1000);
			});

			it ("can schedule the frequency of the clock", function(done){
				var invokations = 0;
				var clock = new Clock(function(){
					invokations++;
				}, 2);
				var now = clock.now();
				var stopTime = now + 1.1;
				clock.start(now).stop(stopTime);
				clock.frequency.setValueAtTime(4, now + 0.5);
				setTimeout(function(){
					expect(invokations).to.equal(4);
					clock.dispose();
					done();
				}, 2000);
			});

		});

		context("Ticks", function(){

			it ("has 0 ticks when first created", function(){
				var clock = new Clock();
				expect(clock.ticks).to.equal(0);
				clock.dispose();
			});

			it ("increments 1 tick per callback", function(done){
				var ticks = 0;
				var clock = new Clock(function(){
					ticks++;
				}, 0.05).start();
				setTimeout(function(){
					expect(ticks).to.equal(clock.ticks);
					clock.dispose();
					done();
				}, 600);
			});

			it ("resets ticks on stop", function(done){
				var clock = new Clock(function(){}, 0.05).start().stop("+0.5");
				setTimeout(function(){
					expect(clock.ticks).to.be.above(0);
				}, 100);
				setTimeout(function(){
					expect(clock.ticks).to.equal(0);
					clock.dispose();
					done();
				}, 600);
			});

			it ("does not reset ticks on pause but stops incrementing", function(done){
				var clock = new Clock(function(){}, 0.05).start().pause("+0.3");
				var pausedTicks;
				setTimeout(function(){
					pausedTicks = clock.ticks;
				}, 400);
				setTimeout(function(){
					expect(clock.ticks).to.equal(pausedTicks);
					clock.dispose();
					done();
				}, 600);
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