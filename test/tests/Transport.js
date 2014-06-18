define(["chai", "Tone/core/Transport"], function(chai, Transport){
	var expect = chai.expect;

	describe("Transport.getBpm and Transport.getTimeSignature", function(){
		this.timeout(300);
		Transport.setBpm(120);
		Transport.setTimeSignature(4, 4);

		it("gets the right bpm before starting", function(){
			Transport.start();
			expect(Transport.getBpm()).to.equal(120);
			Transport.stop();
		});

		it("gets the right bpm after starting", function(){
			expect(Transport.getBpm()).to.equal(120);
		});

		it("ramps to the right value", function(done){
			Transport.setBpm(120);
			expect(Transport.getBpm()).to.equal(120);
			Transport.start();
			Transport.setBpm(200, 0.05);
			setTimeout(function(){
				expect(Transport.getBpm()).to.equal(200);
				done();
			}, 100);
		});

	});

	describe("Transport.setTimeout", function(){
		this.timeout(1800);
		it("invokes the callback with the correct playback time", function(done){
			Transport.stop();
			Transport.setBpm(120);
			Transport.setTimeSignature(4, 4);
			var firstCall = 0;
			Transport.setTimeout(function(time){
				//callback should be invoked before it's supposed to happen
				expect(time).to.be.greaterThan(Transport.now());
				firstCall = time;
			}, "4n");
			Transport.setTimeout(function(time){
				//they should be evenly spaced apart
				expect(time - firstCall).to.be.closeTo(1, 0.04);
				Transport.stop();
				done();
			}, "0:3:0");
			var now = Transport.now() + 0.05;
			Transport.start(now);
		});
	});

	describe("Transport.setInterval", function(){
		this.timeout(1100);
		it("invokes the callback with the correct playback time", function(done){
			Transport.stop();
			Transport.setBpm(200);
			Transport.setTimeSignature(4, 4);
			var intervalCalls = 0;
			Transport.setInterval(function(time){
				expect(time).to.be.greaterThan(Transport.now());
				if (lastCall !== -1){
					expect(time - lastCall).to.be.closeTo(0.3, 0.04);
				}
				lastCall = time;
				intervalCalls++;
				if (intervalCalls === 3){
					done();
					Transport.stop();
				}
			}, "4n");
			var now = Transport.now() + 0.05;
			var lastCall = -1;
			Transport.start(now);
		});
	});
});