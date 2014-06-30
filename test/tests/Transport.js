define(["chai", "Tone/core/Transport", "tests/Core"], function(chai, Transport){
	var expect = chai.expect;

	describe("Transport.getBpm and Transport.getTimeSignature", function(){
		this.timeout(300);

		beforeEach(function(){
			Transport.stop();
			Transport.setBpm(120);
			Transport.setTimeSignature(4, 4);
		});

		it("gets the right bpm before starting", function(){
			Transport.start();
			expect(Transport.getBpm()).to.equal(120);
		});

		it("gets the right bpm after starting", function(){
			expect(Transport.getBpm()).to.equal(120);
		});

		it("ramps to the right value", function(done){
			Transport.start();
			expect(Transport.getBpm()).to.equal(120);
			Transport.setBpm(200, 0.05);
			setTimeout(function(){
				expect(Transport.getBpm()).to.equal(200);
				done();
			}, 200);
		});

	});

	describe("Transport.setTimeout", function(){
		this.timeout(1000);

		beforeEach(function(){
			Transport.stop();
			Transport.setBpm(240);
			Transport.setTimeSignature(4, 4);
			Transport.clearTimeouts();
		});

		it("invokes the callback with the correct playback time", function(done){
			var firstCall = 0;
			Transport.setTimeout(function(time){
				//callback should be invoked before it's supposed to happen
				expect(time).to.be.at.least(Transport.now());
				firstCall = time;
			}, "4n");
			Transport.setTimeout(function(time){
				//they should be evenly spaced apart
				expect(time - firstCall).to.be.closeTo(0.5, 0.05);
				Transport.stop();
				done();
			}, "0:3:0");
			Transport.start();
		});
		it("can clear a timeout", function(done){
			var timeoutId = Transport.setTimeout(function(){
				throw new Error("should not have called this");
			}, "4n");
			setTimeout(function(){
				done();
			}, 400);
			Transport.start();
			Transport.clearTimeout(timeoutId);
		});
	});

	describe("Transport.setInterval", function(){
		this.timeout(1500);

		beforeEach(function(){
			Transport.stop();
			Transport.setBpm(200);
			Transport.setTimeSignature(4, 4);
			Transport.clearIntervals();
		});

		it("invokes the callback with the correct playback time", function(done){
			var intervalCalls = 0;
			Transport.setInterval(function(time){
				expect(time).to.be.greaterThan(Transport.now());
				if (lastCall !== -1){
					expect(time - lastCall).to.be.closeTo(0.3, 0.1);
				}
				lastCall = time;
				intervalCalls++;
				if (intervalCalls === 3){
					done();
					Transport.stop();
				}
			}, "4n");
			var lastCall = -1;
			Transport.start();
		});

		it("can clear an interval", function(done){
			var intervalId = Transport.setInterval(function(){
				throw new Error("should not have called this");
			}, "4n");
			setTimeout(function(){
				done();
			}, 400);
			Transport.clearInterval(intervalId);
			Transport.start();
		});
	});

	describe("Transport.setTimeline", function(){
		this.timeout(1100);

		beforeEach(function(){
			Transport.stop();
			Transport.setBpm(240);
			Transport.setTimeSignature(4, 4);
			Transport.clearTimelines();
		});

		it("invokes the callback with the correct playback time", function(done){
			var callbacks = 0;
			Transport.setTimeline(function(time){
				expect(time - now).to.be.closeTo(0.25, 0.1);
				callbacks++;
			}, "4n");
			Transport.setTimeline(function(time){
				expect(time - now).to.be.closeTo(0.75, 0.1);
				callbacks++;
				if (callbacks === 2){
					done();
				}
			}, "0:3:0");
			var now = Transport.now();
			Transport.start();
		});

		
		it("can clear a timeline event", function(done){
			var timelineId = Transport.setTimeline(function(){
				throw new Error("should not have called this");
			}, "0:0:2");
			setTimeout(function(){
				done();
			}, 400);
			Transport.clearTimeline(timelineId);
			Transport.start();
		});
	});
});