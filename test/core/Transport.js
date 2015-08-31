define(["Test", "Tone/core/Transport", "Tone/core/Tone"], function (Test, Transport, Tone) {

	describe("Transport", function(){

		function resetTransport(done){
			Tone.Transport.clear(0);
			Tone.Transport.stop();
			Tone.Transport.loop = false;
			Tone.Transport.PPQ = 48;
			Tone.Transport.bpm.value = 120;
			Tone.Transport.timeSignature = [4, 4];
			setTimeout(done, 200);
		}

		it("exists", function(){
			expect(Tone.Transport).to.exist;
		});

		context("BPM and timeSignature", function(){

			afterEach(resetTransport);

			it("can get and set bpm", function(){
				Tone.Transport.bpm.value = 125;
				expect(Tone.Transport.bpm.value).to.be.closeTo(125, 0.001);
				//reset the bpm
				Tone.Transport.bpm.value = 120;
				expect(Tone.Transport.bpm._value.value).to.equal(2 * Tone.Transport.PPQ);
			});

			it("can get and set timeSignature as both an array or number", function(){
				Tone.Transport.timeSignature = [6, 8];
				expect(Tone.Transport.timeSignature).to.equal(3);
				Tone.Transport.timeSignature = 5;
				expect(Tone.Transport.timeSignature).to.equal(5);
				Tone.Transport.timeSignature = [4, 4];
			});

			it("can get and set timeSignature as both an array or number", function(){
				Tone.Transport.timeSignature = [6, 8];
				expect(Tone.Transport.timeSignature).to.equal(3);
				Tone.Transport.timeSignature = 5;
				expect(Tone.Transport.timeSignature).to.equal(5);
				Tone.Transport.timeSignature = [4, 4];
			});

		});

		context("looping", function(){

			afterEach(resetTransport);

			it("can get and set loop points", function(){
				Tone.Transport.loopStart = 0.2;
				Tone.Transport.loopEnd = 0.4;
				expect(Tone.Transport.loopStart).to.be.closeTo(0.2, 0.01);
				expect(Tone.Transport.loopEnd).to.be.closeTo(0.4, 0.01);
				Tone.Transport.setLoopPoints(0, "1m");
				expect(Tone.Transport.loopStart).to.be.closeTo(0, 0.01);
				expect(Tone.Transport.loopEnd).to.be.closeTo(Tone.Transport.toSeconds("1m"), 0.01);
			});

			it ("can loop events scheduled on the transport", function(done){
				var invocations = 0;
				Tone.Transport.schedule(function(){
					invocations++;
				}, 0);
				Tone.Transport.setLoopPoints(0, "4n").start();
				Tone.Transport.loop = true;
				setTimeout(function(){
					expect(invocations).to.be.greaterThan(1);
					Tone.Transport.loop = false;
					Tone.Transport.stop();
					Tone.Transport.clear(0);
					done();
				}, 1000);
			});

		});

		context("PPQ", function(){

			afterEach(resetTransport);

			it("can get and set pulses per quarter", function(){
				Tone.Transport.PPQ = 96;
				expect(Tone.Transport.PPQ).to.equal(96);
			});

		});

		context("position", function(){

			afterEach(resetTransport);

			it("can jump to a specific tick number", function(done){
				Tone.Transport.ticks = 200;
				expect(Tone.Transport.ticks).to.equal(200);
				Tone.Transport.start();
				setTimeout(function(){
					expect(Tone.Transport.ticks).to.at.least(200);
					Tone.Transport.stop();
					done();
				}, 100);
			});

			it("can get the current position in TransportTime", function(done){
				expect(Tone.Transport.position).to.equal("0:0:0");
				Tone.Transport.start();
				setTimeout(function(){
					expect(Tone.Transport.position).to.not.equal("0:0:0");
					Tone.Transport.stop();
					done();
				}, 100);
			});

			it("can set the current position in TransportTime", function(){
				expect(Tone.Transport.position).to.equal("0:0:0");
				Tone.Transport.position = "3:0";
				expect(Tone.Transport.position).to.equal("3:0:0");
				Tone.Transport.position = "0:0";
				expect(Tone.Transport.position).to.equal("0:0:0");
			});

		});
		

		context("state", function(){

			afterEach(resetTransport);

			it("can start, pause, and stop", function(done){
				Tone.Transport.start().pause("+0.2").stop("+0.4");
				setTimeout(function(){
					expect(Tone.Transport.state).to.equal("started");
				}, 100);
				setTimeout(function(){
					expect(Tone.Transport.state).to.equal("paused");
				}, 300);
				setTimeout(function(){
					expect(Tone.Transport.state).to.equal("stopped");
					done();
				}, 500);
			});

		});


		context("ticks", function(){

			afterEach(resetTransport);

			it("resets ticks on stop but not on pause", function(done){
				Tone.Transport.start();
				setTimeout(function(){
					expect(Tone.Transport.ticks).to.be.greaterThan(0);
					Tone.Transport.pause();
					setTimeout(function(){
						expect(Tone.Transport.ticks).to.be.greaterThan(0);
						Tone.Transport.stop();
						setTimeout(function(){
							expect(Tone.Transport.ticks).to.equal(0);
							done();
						}, 100);
					}, 100);
				}, 100);
			});

			it("tracks ticks after start", function(done){
				Tone.Transport.bpm.value = 120;
				Tone.Transport.PPQ = 48;
				Tone.Transport.start();
				setTimeout(function(){
					expect(Tone.Transport.ticks).to.at.least(48);
					done();
				}, 600);
			});

			it("can start with a tick offset", function(done){
				Tone.Transport.start(undefined, 200 + "i");
				setTimeout(function(){
					expect(Tone.Transport.ticks).to.at.least(200);
					done();
				}, 100);
			});

			it("tracks ticks correctly with a different PPQ and BPM", function(done){
				Tone.Transport.PPQ = 96;
				Tone.Transport.bpm.value = 60;
				Tone.Transport.start();
				setTimeout(function(){
					expect(Tone.Transport.ticks).to.at.least(48);
					done();
				}, 600);
			});

		});	

		context("schedule", function(){	

			afterEach(resetTransport);

			it ("can schedule an event on the timeline", function(){
				var eventID = Tone.Transport.schedule(function(){}, 0);
				expect(eventID).to.be.a.number;
			});

			it ("scheduled event gets invoked with the time of the event", function(done){
				var startTime = Tone.Transport.now() + 0.1;
				Tone.Transport.schedule(function(time){
					expect(time).to.equal(startTime);
					done();
				}, 0);
				Tone.Transport.start(startTime);
			});

			it ("can cancel a scheduled event", function(done){
				var eventID = Tone.Transport.schedule(function(){
					throw new Error("should not call this function");
				}, 0);
				Tone.Transport.cancel(eventID);
				Tone.Transport.stop();
				setTimeout(done, 100);
			});

			it ("can clear the timeline of scheduled object", function(){
				Tone.Transport.schedule(Tone.noOp, 0);
				Tone.Transport.schedule(Tone.noOp, 1);
				Tone.Transport.schedule(Tone.noOp, 2);
				expect(Tone.Transport._timeline.length).to.equal(3);
				Tone.Transport.clear(2);
				expect(Tone.Transport._timeline.length).to.equal(2);
				Tone.Transport.clear(0);
				expect(Tone.Transport._timeline.length).to.equal(0);
			});

			it ("can clear the timeline of schedulOnce object", function(){
				Tone.Transport.scheduleOnce(Tone.noOp, 0);
				Tone.Transport.scheduleOnce(Tone.noOp, 1);
				Tone.Transport.scheduleOnce(Tone.noOp, 2);
				expect(Tone.Transport._onceEvents.length).to.equal(3);
				Tone.Transport.clear(2);
				expect(Tone.Transport._onceEvents.length).to.equal(2);
				Tone.Transport.clear(0);
				expect(Tone.Transport._onceEvents.length).to.equal(0);
			});

			it ("scheduled event anywhere along the timeline", function(done){
				var startTime = Tone.Transport.now();
				Tone.Transport.schedule(function(time){
					expect(time).to.be.closeTo(startTime + 0.5, 0.001);
					done();
				}, 0.5);
				Tone.Transport.start(startTime);
			});

			it ("can schedule multiple events and invoke them in the right order", function(done){
				var first = false;
				Tone.Transport.schedule(function(){
					first = true;
				}, 0.5);
				Tone.Transport.schedule(function(){
					expect(first).to.be.true;
					done();
				}, 0.51);
				Tone.Transport.start();
			});

			it ("invokes the event again if the timeline is restarted", function(done){
				var iterations = 0;
				Tone.Transport.schedule(function(){
					iterations++;
				}, 0.05);
				Tone.Transport.start().stop("+0.1").start("+0.2");
				setTimeout(function(){
					expect(iterations).to.be.equal(2);
					done();
				}, 1000);
			});

		});

		context("scheduleRepeat", function(){	

			afterEach(resetTransport);

			it ("can schedule a repeated event", function(){
				var eventID = Tone.Transport.scheduleRepeat(function(){}, 1, 0);
				expect(eventID).to.be.a.number;
			});

			it ("scheduled event gets invoked with the time of the event", function(done){
				var startTime = Tone.Transport.now() + 0.1;
				var eventID = Tone.Transport.scheduleRepeat(function(time){
					Tone.Transport.cancel(eventID);
					expect(time).to.equal(startTime);
					done();
				}, 1, 0);
				Tone.Transport.start(startTime);
			});

			it ("can cancel a scheduled event", function(done){
				var eventID = Tone.Transport.scheduleRepeat(function(){
					throw new Error("should not call this function");
				}, 1, 0);
				Tone.Transport.cancel(eventID);
				Tone.Transport.stop();
				setTimeout(done, 100);
			});

			it ("can be scheduled in the future", function(done){
				var startTime = Tone.Transport.now() + 0.1;
				var eventID = Tone.Transport.scheduleRepeat(function(time){
					Tone.Transport.cancel(eventID);
					expect(time).to.be.closeTo(startTime + 0.2, 0.01);
					done();
				}, 1, 0.2);
				Tone.Transport.start(startTime);
			});

			it ("repeats a repeat event", function(done){
				var invocations = 0;
				Tone.Transport.scheduleRepeat(function(){
					invocations++;
				}, 0.1, 0);
				Tone.Transport.start();
				setTimeout(function(){
					expect(invocations).to.be.above(9);
					done();
				}, 1100);
			});

			it ("repeats at the repeat interval", function(done){
				var repeatTime = -1;
				var eventID = Tone.Transport.scheduleRepeat(function(time){
					if (repeatTime !== -1){
						expect(time - repeatTime).to.be.closeTo(0.1, 0.01);
					}
					repeatTime = time;
				}, 0.1, 0);
				Tone.Transport.start();
				setTimeout(function(){
					Tone.Transport.cancel(eventID);
					done();
				}, 1000);
			});

			it ("can schedule multiple events and invoke them in the right order", function(done){
				var first = false;
				var firstID = Tone.Transport.scheduleRepeat(function(){
					first = true;
					Tone.Transport.cancel(firstID);
				}, 1, 0.5);
				var secondID = Tone.Transport.scheduleRepeat(function(){
					Tone.Transport.cancel(secondID);
					expect(first).to.be.true;
					done();
				}, 1, 0.51);
				Tone.Transport.start();
			});

			it ("cannot schedule an event with an interval of 0", function(){
				expect(function(){
					Tone.Transport.scheduleRepeat(function(){}, 0, 10);
				}).to.throw(Error);
			});

		});

		context("scheduleOnce", function(){	

			afterEach(resetTransport);

			it ("can schedule a single event on the timeline", function(){
				var eventID = Tone.Transport.scheduleOnce(function(){}, 0);
				expect(eventID).to.be.a.number;
			});

			it ("scheduled event gets invoked with the time of the event", function(done){
				var startTime = Tone.Transport.now() + 0.1;
				var eventID = Tone.Transport.scheduleOnce(function(time){
					Tone.Transport.cancel(eventID);
					expect(time).to.equal(startTime);
					done();
				}, 0);
				Tone.Transport.start(startTime);
			});


			it ("can cancel a scheduled event", function(done){
				var eventID = Tone.Transport.scheduleOnce(function(){
					throw new Error("should not call this function");
				}, 0);
				Tone.Transport.cancel(eventID);
				Tone.Transport.stop();
				setTimeout(done, 200);
			});

			it ("can be scheduled in the future", function(done){
				var startTime = Tone.Transport.now() + 0.1;
				var eventID = Tone.Transport.scheduleOnce(function(time){
					Tone.Transport.cancel(eventID);
					expect(time).to.be.closeTo(startTime + 0.3, 0.01);
					done();
				}, 0.3);
				Tone.Transport.start(startTime);
			});

			it ("the event is removed after is is invoked", function(done){
				var iterations = 0;
				Tone.Transport.scheduleOnce(function(){
					iterations++;
					expect(iterations).to.be.lessThan(2);
				}, 0);
				Tone.Transport.start().stop("+0.1").start("+0.2");
				setTimeout(done, 500);
			});

		});

	});
});