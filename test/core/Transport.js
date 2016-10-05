define(["Test", "Tone/core/Transport", "Tone/core/Tone", "helper/Offline2", "Tone/type/TransportTime"], 
function (Test, Transport, Tone, Offline, TransportTime) {

	describe("Transport", function(){

		function resetTransport(done){
			Tone.Transport.cancel(0);
			Tone.Transport.off("start stop pause loop");
			Tone.Transport.stop();
			Tone.Transport.loop = false;
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
				expect(Tone.Transport.bpm._param.value).to.equal(2 * Tone.Transport.PPQ);
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
				Offline(function(dest, testFn, after){
					var invocations = 0;
					Tone.Transport.schedule(function(){
						invocations++;
					}, 0);
					Tone.Transport.setLoopPoints(0, "4n").start();
					Tone.Transport.loop = true;
					after(function(){
						expect(invocations).to.be.greaterThan(1);
						Tone.Transport.loop = false;
						Tone.Transport.stop();
						Tone.Transport.cancel(0);
						done();
					});
				}, 1);
			});

		});

		context("nextSubdivision", function(){

			afterEach(resetTransport);

			it("returns 0 if the transports not started", function(){
				expect(Tone.Transport.nextSubdivision()).to.equal(0);
			});

			it("can get the next subdivision of the transport", function(done){
				Offline(function(dest, testFn, after){
					Tone.Transport.start(0);
					after(function(){
						expect(Tone.Transport.nextSubdivision(0.5)).to.be.closeTo(1, 0.01);
						expect(Tone.Transport.nextSubdivision(2)).to.be.closeTo(2, 0.01);
						expect(Tone.Transport.nextSubdivision("8n")).to.be.closeTo(0.75, 0.01);
						done();
					});
				}, 0.7);
			});

		});

		context("PPQ", function(){

			afterEach(resetTransport);

			it("can get and set pulses per quarter", function(){
				var origPPQ = Tone.Transport.PPQ;
				Tone.Transport.PPQ = 96;
				expect(Tone.Transport.PPQ).to.equal(96);
				Tone.Transport.PPQ = origPPQ;
			});

			it("schedules a quarter note at the same time with a different PPQ", function(done){
				var origPPQ = Tone.Transport.PPQ;
				Tone.Transport.PPQ = 1;
				var start = Tone.now();
				var id = Tone.Transport.schedule(function(time){
					expect(time - start).to.be.closeTo(Tone.Transport.toSeconds("4n"), 0.1);
					Tone.Transport.cancel(id);
					Tone.Transport.PPQ = origPPQ;
					done();
				}, "4n");
				Tone.Transport.start();
			});

		});

		context("position", function(){

			afterEach(resetTransport);

			it("can jump to a specific tick number", function(done){
				Offline(function(dest, test, after){
					Tone.Transport.ticks = 200;
					expect(Tone.Transport.ticks).to.equal(200);
					Tone.Transport.start();
					after(function(){
						expect(Tone.Transport.ticks).to.at.least(200);
						Tone.Transport.stop();
						done();
					});
				}, 0.1);
			});

			it("can get the current position in BarsBeatsSixteenths", function(done){
				Offline(function(dest, test, after){
					expect(Tone.Transport.position).to.equal("0:0:0");
					Tone.Transport.start();
					after(function(){
						expect(Tone.Transport.position).to.not.equal("0:0:0");
						Tone.Transport.stop();
						done();
					});
				}, 0.1);
			});

			it("can get the current position in seconds", function(done){
				Offline(function(dest, test, after){
					expect(Tone.Transport.seconds).to.equal(0);
					Tone.Transport.start();
					test(function(sample, time){
						expect(Tone.Transport.seconds).to.be.closeTo(time, 0.05);
					});
					after(function(){
						expect(Tone.Transport.seconds).to.be.closeTo(0.8, 0.05);
						Tone.Transport.stop();
						done();
					});
				}, 0.8);
			});

			it("can set the current position in seconds", function(){
				expect(Tone.Transport.seconds).to.equal(0);
				Tone.Transport.seconds = 3;
				expect(Tone.Transport.seconds).to.be.closeTo(3, 0.05);
				Tone.Transport.seconds = 0;
				expect(Tone.Transport.seconds).to.equal(0);
			});

			it("can set the current position in BarsBeatsSixteenths", function(){
				expect(Tone.Transport.position).to.equal("0:0:0");
				Tone.Transport.position = "3:0";
				expect(Tone.Transport.position).to.equal("3:0:0");
				Tone.Transport.position = "0:0";
				expect(Tone.Transport.position).to.equal("0:0:0");
			});

			it ("can get the progress of the loop", function(){
				Tone.Transport.setLoopPoints(0, "1m").start();
				Tone.Transport.loop = true;
				expect(Tone.Transport.progress).to.be.equal(0);
				Tone.Transport.position = "2n";
				expect(Tone.Transport.progress).to.be.closeTo(0.5, 0.001);
				Tone.Transport.position = "2n + 4n";
				expect(Tone.Transport.progress).to.be.closeTo(0.75, 0.001);
			});

		});
		

		context("state", function(){

			afterEach(resetTransport);

			it("can start, pause, and stop", function(done){
				Offline(function(dest, test, after){
					Tone.Transport.start(0).pause(0.2).stop(0.4);

					test(function(sample, time){
						if (time < 0.2){
							expect(Tone.Transport.state).to.equal("started");
						} else if (time < 0.4){
							expect(Tone.Transport.state).to.equal("paused");
						} else {
							expect(Tone.Transport.state).to.equal("stopped");
						}
					});
					after(function(){
						expect(Tone.Transport.state).to.equal("stopped");
						done();
					});
				}, 0.5);
			});

		});


		context("ticks", function(){

			afterEach(resetTransport);

			it("resets ticks on stop but not on pause", function(done){
				Offline(function(dest, test, after){
					Tone.Transport.start().pause(0.1).stop(0.2);

					var pausedTicks = 0;

					test(function(sample, time){
						if (time <= 0.1){
							expect(Tone.Transport.ticks).to.be.greaterThan(0);	
							pausedTicks = Tone.Transport.ticks;
						} else if (time <= 0.19){
							expect(Tone.Transport.ticks).to.equal(pausedTicks);	
						} else if (time > 0.21){
							expect(Tone.Transport.ticks).to.equal(0);	
						}
					});

					after(done);
				}, 0.5);
			});

			it("tracks ticks after start", function(done){

				Offline(function(dest, test, after){
					Tone.Transport.bpm.value = 120;
					Tone.Transport.start();

					after(function(){
						expect(Tone.Transport.ticks).to.at.least(192);
						done();
					});
				}, 0.6);
			});

			it("can start with a tick offset", function(done){
				Offline(function(dest, test, after){
					Tone.Transport.start(0, "200i");

					test(function(sample, time){
						if (time > 0){
							expect(Tone.Transport.ticks).to.at.least(200);
						}
					});

					after(function(){
						expect(Tone.Transport.ticks).to.at.least(200);
						done();
					});
				}, 0.1);
			});

			it("tracks ticks correctly with a different PPQ and BPM", function(done){

				Offline(function(dest, test, after){
					var origPPQ = Tone.Transport.PPQ;
					Tone.Transport.PPQ = 96;
					Tone.Transport.bpm.value = 90;
					Tone.Transport.start();

					after(function(){
						expect(Tone.Transport.ticks).to.at.least(72);
						Tone.Transport.PPQ = origPPQ;
						done();
					});
				}, 0.6);
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

			it ("can schedule events with TransportTime", function(done){
				var startTime = Tone.Transport.now() + 0.1;
				var eighth = Tone.Transport.toSeconds("8n");
				Tone.Transport.schedule(function(time){
					expect(time).to.be.closeTo(startTime + eighth, 0.01);
					done();
				}, TransportTime("8n"));
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

			it ("can cancel the timeline of scheduled object", function(){
				Tone.Transport.schedule(Tone.noOp, 0);
				Tone.Transport.schedule(Tone.noOp, 1);
				Tone.Transport.schedule(Tone.noOp, 2);
				expect(Tone.Transport._timeline.length).to.equal(3);
				Tone.Transport.cancel(2);
				expect(Tone.Transport._timeline.length).to.equal(2);
				Tone.Transport.cancel(0);
				expect(Tone.Transport._timeline.length).to.equal(0);
			});

			it ("can cancel the timeline of schedulOnce object", function(){
				Tone.Transport.scheduleOnce(Tone.noOp, 0);
				Tone.Transport.scheduleOnce(Tone.noOp, 1);
				Tone.Transport.scheduleOnce(Tone.noOp, 2);
				expect(Tone.Transport._onceEvents.length).to.equal(3);
				Tone.Transport.cancel(2);
				expect(Tone.Transport._onceEvents.length).to.equal(2);
				Tone.Transport.cancel(0);
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
				Offline(function(dest, test, after){
					var iterations = 0;

					Tone.Transport.schedule(function(){
						iterations++;
					}, 0.05);

					Tone.Transport.start(0).stop(0.1).start(0.2);

					after(function(){
						expect(iterations).to.be.equal(2);
						done();
					});
				}, 0.3);
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
					Tone.Transport.clear(eventID);
					expect(time).to.equal(startTime);
					done();
				}, 1, 0);
				Tone.Transport.start(startTime);
			});

			it ("can schedule events with TransportTime", function(done){
				var startTime = Tone.Transport.now() + 0.1;
				var eighth = Tone.Transport.toSeconds("8n");
				Tone.Transport.scheduleRepeat(function(time){
					expect(time).to.be.closeTo(startTime + eighth, 0.01);
					done();
				}, "1n", TransportTime("8n"));
				Tone.Transport.start(startTime);
			});

			it ("can clear a scheduled event", function(done){
				var eventID = Tone.Transport.scheduleRepeat(function(){
					throw new Error("should not call this function");
				}, 1, 0);
				Tone.Transport.clear(eventID);
				Tone.Transport.stop();
				setTimeout(done, 100);
			});

			it ("can be scheduled in the future", function(done){
				var startTime = Tone.Transport.now() + 0.1;
				var eventID = Tone.Transport.scheduleRepeat(function(time){
					Tone.Transport.clear(eventID);
					expect(time).to.be.closeTo(startTime + 0.2, 0.01);
					done();
				}, 1, 0.2);
				Tone.Transport.start(startTime);
			});

			it ("repeats a repeat event", function(done){
				Offline(function(output, test, after){
					var invocations = 0;

					Tone.Transport.scheduleRepeat(function(){
						invocations++;
					}, 0.1, 0);

					Tone.Transport.start();

					after(function(){
						expect(invocations).to.be.above(9);
						done();
					});
				}, 1);
			});

			it ("repeats at the repeat interval", function(done){
				Offline(function(output, test, after){
					var repeatTime = -1;

					var eventID = Tone.Transport.scheduleRepeat(function(time){
						if (repeatTime !== -1){
							expect(time - repeatTime).to.be.closeTo(0.1, 0.01);
						}
						repeatTime = time;
					}, 0.1, 0);

					Tone.Transport.start();

					after(function(){
						Tone.Transport.clear(eventID);
						done();
					});
				});
			});

			it ("can schedule multiple events and invoke them in the right order", function(done){
				var first = false;
				var firstID = Tone.Transport.scheduleRepeat(function(){
					first = true;
					Tone.Transport.clear(firstID);
				}, 1, 0.5);
				var secondID = Tone.Transport.scheduleRepeat(function(){
					Tone.Transport.clear(secondID);
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

			it ("repeats for the given duration", function(done){
				Offline(function(output, test, after){

					var repeatCount = 0;

					var eventID = Tone.Transport.scheduleRepeat(function(){
						repeatCount++;
					}, 0.1, 0, 0.5);

					Tone.Transport.start();

					after(function(){
						expect(repeatCount).to.at.least(5);
						Tone.Transport.clear(eventID);
						done();
					});

				}, 0.6);
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
					Tone.Transport.clear(eventID);
					expect(time).to.equal(startTime);
					done();
				}, 0);
				Tone.Transport.start(startTime);
			});

			it ("can schedule events with TransportTime", function(done){
				var startTime = Tone.Transport.now() + 0.1;
				var eighth = Tone.Transport.toSeconds("8n");
				Tone.Transport.scheduleOnce(function(time){
					expect(time).to.be.closeTo(startTime + eighth, 0.01);
					done();
				}, TransportTime("8n"));
				Tone.Transport.start(startTime);
			});


			it ("can cancel a scheduled event", function(done){
				var eventID = Tone.Transport.scheduleOnce(function(){
					throw new Error("should not call this function");
				}, 0);
				Tone.Transport.clear(eventID);
				Tone.Transport.stop();
				setTimeout(done, 200);
			});

			it ("can be scheduled in the future", function(done){
				var startTime = Tone.Transport.now() + 0.1;
				var eventID = Tone.Transport.scheduleOnce(function(time){
					Tone.Transport.clear(eventID);
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

		context("events", function(){

			afterEach(resetTransport);

			it("invokes start/stop/pause events", function(done){
				var count = 0;
				Tone.Transport.on("start pause stop", function(){
					count++;
					if (count === 3){
						done();
					}
				});
				Tone.Transport.start("+0.1").pause("+0.2").stop("+0.3");
			});

			it("invokes start event with correct offset", function(done){
				var now = Tone.now();
				Tone.Transport.on("start", function(time, offset){
					expect(time).to.be.closeTo(now + 0.1, 0.01);
					expect(offset).to.be.closeTo(0.5, 0.001);
					done();
				});
				Tone.Transport.start("+0.1", "4n");
			});

			it("passes in the time argument to the events", function(done){
				var now = Tone.Transport.now();
				Tone.Transport.on("start", function(time){
					expect(time).to.be.closeTo(now + 0.1, 0.01);
				});
				Tone.Transport.on("stop", function(time){
					expect(time).to.be.closeTo(now + 0.2, 0.01);
					done();
				});
				Tone.Transport.start("+0.1").stop("+0.2");
			});

			it("invokes the 'loop' method on loop", function(done){

				Offline(function(output, test, after){

					var sixteenth = Tone.Transport.toSeconds("16n");

					Tone.Transport.setLoopPoints(0, sixteenth);
					Tone.Transport.loop = true;

					var lastLoop = -1;
					var loops = 0;

					Tone.Transport.on("loop", function(time){
						loops++;
						if (lastLoop !== -1){
							expect(time - lastLoop).to.be.closeTo(sixteenth, 0.001);
						}
						lastLoop = time;
					});

					Tone.Transport.start(0).stop(sixteenth * 5.1);

					after(function(){
						expect(loops).to.equal(5);
						done();
					});

				}, 0.7);
			});
		});

		context("swing", function(){

			afterEach(resetTransport);

			it("can get/set the swing subdivision", function(){
				Tone.Transport.swingSubdivision = "8n";
				expect(Tone.Transport.swingSubdivision).to.equal("8n");
				Tone.Transport.swingSubdivision = "4n";
				expect(Tone.Transport.swingSubdivision).to.equal("4n");
			});

			it("can get/set the swing amount", function(){
				Tone.Transport.swing = 0.5;
				expect(Tone.Transport.swing).to.equal(0.5);
				Tone.Transport.swing = 0;
				expect(Tone.Transport.swing).to.equal(0);
			});

			it("can swing", function(done){
				Offline(function(output, test, after){

					Tone.Transport.swing = 1;
					Tone.Transport.swingSubdivision = "8n";
					var eightNote = Tone.Transport.toSeconds("8n");

					//downbeat, no swing
					Tone.Transport.schedule(function(time){
						expect(time).is.closeTo(0, 0.001);
					}, 0);

					//eighth note has swing
					Tone.Transport.schedule(function(time){
						expect(time).is.closeTo(eightNote * 5/3, 0.001);
					}, "8n");

					//sixteenth note is also swung
					Tone.Transport.schedule(function(time){
						expect(time).is.closeTo(eightNote, 0.05);
					}, "16n");

					//no swing on the quarter
					Tone.Transport.schedule(function(time){
						expect(time).is.closeTo(eightNote * 2, 0.001);
					}, "4n");

					Tone.Transport.start(0).stop(0.7);

					after(function(){
						Tone.Transport.swing = 0;
						done();
					});

				}, 0.7);
			});
		});

	});
});