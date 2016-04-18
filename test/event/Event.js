define(["helper/Basic", "Tone/event/Event", "Tone/core/Tone", "Tone/core/Transport", "helper/Offline2"], 
	function (Basic, Event, Tone, Transport, Offline) {

	describe("Event", function(){

		Basic(Event);

		function resetTransport(done){
			Tone.Transport.cancel(0);
			Tone.Transport.off("start stop pause loop");
			Tone.Transport.stop();
			Tone.Transport.loop = false;
			Tone.Transport.bpm.value = 120;
			Tone.Transport.timeSignature = [4, 4];
			setTimeout(done, 200);
		}

		context("Constructor", function(){

			afterEach(resetTransport);

			it ("takes a callback and a value", function(){
				var callback = function(){};
				var note = new Event(callback, "C4");
				expect(note.callback).to.equal(callback);
				expect(note.value).to.equal("C4");
				note.dispose();
			});

			it ("can be constructed with no arguments", function(){
				var note = new Event();
				expect(note.value).to.be.null;
				note.dispose();
			});

			it ("can pass in arguments in options object", function(){
				var callback = function(){};
				var value = {"a" : 1};
				var note = new Event({
					"callback" : callback,
					"value" : value,
					"loop" : true,
					"loopEnd" : "4n",
					"probability" : 0.3
				});
				expect(note.callback).to.equal(callback);
				expect(note.value).to.equal(value);
				expect(note.loop).to.be.true;
				expect(note.loopEnd).to.equal("4n");
				expect(note.probability).to.equal(0.3);
				note.dispose();
			});
		});

		context("Get/Set", function(){

			afterEach(resetTransport);

			it ("can set values with object", function(){
				var callback = function(){};
				var note = new Event();
				note.set({
					"callback" : callback,
					"value" : "D4",
					"loop" : 8
				});
				expect(note.callback).to.equal(callback);
				expect(note.value).to.equal("D4");
				expect(note.loop).to.equal(8);
				note.dispose();
			});

			it ("can set get a the values as an object", function(){
				var callback = function(){};
				var note = new Event({
					"callback" : callback,
					"value" : "D3",
					"loop" : 4
				});
				var values = note.get();
				expect(values.value).to.equal("D3");
				expect(values.loop).to.equal(4);
				note.dispose();
			});
		});

		context("Event callback", function(){

			afterEach(resetTransport);

			it ("does not invoke get invoked until started", function(done){
				Offline(function(output, test, after){

					var note = new Event(function(){
						throw new Error("shouldn't call this callback");
					}, "C4");
					Tone.Transport.start();

					after(function(){
						note.dispose();
						done();
					});
				}, 0.3);
			});

			it ("is invoked after it's started", function(done){
				var note = new Event(function(){
					note.dispose();
					done();
				}, "C4").start(0);
				Tone.Transport.start();
			});

			it ("passes in the scheduled time to the callback", function(done){
				var now = Tone.Transport.now() + 0.1;
				var note = new Event(function(time){
					expect(time).to.be.a.number;
					expect(time - now).to.be.closeTo(0.3, 0.01);
					note.dispose();
					done();
				});
				note.start(0.3);
				Tone.Transport.start(now);
			});

			it ("passes in the value to the callback", function(done){
				var note = new Event(function(time, thing){
					expect(time).to.be.a.number;
					expect(thing).to.equal("thing");
					note.dispose();
					done();
				}, "thing").start();
				Tone.Transport.start();
			});

			it ("can mute the callback", function(done){
				Offline(function(output, test, after){
					var note = new Event(function(){
						throw new Error("shouldn't call this callback");
					}, "C4").start();

					note.mute = true;
					expect(note.mute).to.be.true;
					Tone.Transport.start();

					after(function(){
						note.dispose();
						done();
					});
				}, 0.3);
			});

			it ("can trigger with some probability", function(done){

				Offline(function(output, test, after){
					var note = new Event(function(){
						throw new Error("shouldn't call this callback");
					}, "C4").start();

					note.probability = 0;
					expect(note.probability).to.equal(0);
					Tone.Transport.start();

					after(function(){
						note.dispose();
						done();
					});
				}, 0.3);
			});
		});

		context("Scheduling", function(){

			afterEach(resetTransport);

			it ("can be started and stopped multiple times", function(done){
				Offline(function(output, test, after){
					var note = new Event().start(0).stop(0.2).start(0.4);

					Tone.Transport.start(0);

					test(function(sample, time){
						if (time > 0 && time < 0.18){
							expect(note.state).to.equal("started");
						} else if (time > 0.2 && time < 0.38){
							expect(note.state).to.equal("stopped");
						} else if (time > 0.4){
							expect(note.state).to.equal("started");
						}
					});
					
					after(function(){
						expect(note.state).to.equal("started");
						note.dispose();
						done();
					});
				}, 0.5);
			});

			it ("restarts when transport is restarted", function(done){

				Offline(function(output, test, after){
					var note = new Event().start(0).stop(0.4);

					Tone.Transport.start().stop(0.5).start(0.55);

					test(function(sample, time){
						if (time > 0 && time < 0.38){
							expect(note.state).to.equal("started");	
						} else if (time > 0.4 && time < 0.5){
							expect(note.state).to.equal("stopped");	
						} else if (time > 0.55 && time < 0.8){
							expect(note.state).to.equal("started");	
						}
					});

					after(function(){
						expect(Tone.Transport.state).to.equal("started");
						expect(note.state).to.equal("stopped");
						note.dispose();
						done();
					});
				}, 1);
			});


			it ("can be cancelled", function(done){
				var note = new Event().start(0);
				setTimeout(function(){
					expect(note.state).to.equal("started");
					Tone.Transport.stop();
					note.cancel();
					setTimeout(function(){
						Tone.Transport.start();
						setTimeout(function(){
							expect(note.state).to.equal("stopped");
							note.dispose();
							done();
						}, 100);
					}, 100);
				}, 100);
				Tone.Transport.start();
			});

		});

		context("Looping", function(){

			afterEach(resetTransport);

			it ("can be set to loop", function(done){

				Offline(function(output, test, after){

					var callCount = 0;

					var note = new Event({
						"loopEnd" : 0.25,
						"loop" : true,
						"callback" : function(){
							callCount++;
						}
					}).start(0);

					Tone.Transport.start(0);

					after(function(){
						expect(callCount).to.equal(4);
						note.dispose();	
						done();
					});
				}, 0.8);

			});

			it ("can be set to loop at a specific interval", function(done){
				Offline(function(output, test, after){
					var lastCall;
					var note = new Event({
						"loopEnd" : 0.25,
						"loop" : true,
						"callback" : function(time){
							if (lastCall){
								expect(time - lastCall).to.be.closeTo(0.25, 0.01);
							}
							lastCall = time;
						}
					}).start(0);
					Tone.Transport.start();

					after(function(){
						note.dispose();	
						done();
					});

				}, 1);
			});

			it ("can adjust the loop duration after starting", function(done){

				Offline(function(output, test, after){

					var lastCall;

					var note = new Event({
						"loopEnd" : 0.5,
						"loop" : true,
						"callback" : function(time){
							if (lastCall){
								expect(time - lastCall).to.be.closeTo(0.25, 0.01);
							} else {
								note.loopEnd = 0.25;
							}
							lastCall = time;
						}
					}).start(0);

					Tone.Transport.start();

					after(function(){
						note.dispose();	
						done();
					});
				}, 0.8);
			});

			it ("can loop a specific number of times", function(done){

				Offline(function(output, test, after){

					var callCount = 0;

					var note = new Event({
						"loopEnd" : 0.125,
						"loop" : 3,
						"callback" : function(){
							callCount++;
						}
					}).start(0);

					Tone.Transport.start();

					after(function(){
						expect(callCount).to.equal(3);
						note.dispose();	
						done();
					});
				}, 0.8);
			});

			it ("loops the correct amount of times when the event is started in the Transport's past", function(done){

				Offline(function(output, test, after){

					var callCount = 0;
					var note = new Event({
						"loopEnd" : 0.2,
						"loop" : 3,
						"callback" : function(){
							callCount++;
						}
					});

					Tone.Transport.start();

					var wasCalled = false;

					test(function(sample, time){

						if (time > 0.1 && !wasCalled) {
							wasCalled = true;
							note.start(0);
						}
					});

					after(function(){
						expect(callCount).to.equal(2);
						note.dispose();	
						done();
					});

				}, 0.7);
			});

			it ("reports the progress of the loop", function(done){

				Offline(function(output, test, after){

					var note = new Event({
						"loopEnd" : 1,
						"loop" : true,
					}).start(0);

					Tone.Transport.start();

					after(function(){
						expect(note.progress).to.be.closeTo(0.8, 0.05);
						note.dispose();	
						done();
					});
				}, 0.8);
			});

			it ("progress is 0 when not looping", function(done){
				Offline(function(output, test, after){

					var note = new Event({
						"loopEnd" : 0.25,
						"loop" : false,
					}).start(0);

					Tone.Transport.start();

					after(function(){
						expect(note.progress).to.equal(0);
						note.dispose();	
						done();
					});
				}, 0.8);
			});
		});

		context("playbackRate and humanize", function(){

			afterEach(resetTransport);

			it ("can adjust the playbackRate", function(done){

				Offline(function(output, test, after){

					var lastCall;
					var note = new Event({
						"playbackRate" : 2,
						"loopEnd" : 0.5,
						"loop" : true,
						"callback" : function(time){
							if (lastCall){
								expect(time - lastCall).to.be.closeTo(0.25, 0.01);
							}
							lastCall = time;
						}
					}).start(0);

					Tone.Transport.start();

					after(function(){
						note.dispose();	
						done();
					});

				}, 0.7);
			});

			it ("can adjust the playbackRate after starting", function(done){

				Offline(function(output, test, after){
					var lastCall;
					var note = new Event({
						"playbackRate" : 1,
						"loopEnd" : 0.25,
						"loop" : true,
						"callback" : function(time){
							if (lastCall){
								expect(time - lastCall).to.be.closeTo(0.5, 0.01);
							} else {
								note.playbackRate = 0.5;
							}
							lastCall = time;
						}
					}).start(0);
					Tone.Transport.start();

					after(function(){
						note.dispose();	
						done();
					});
				}, 1.2);

			});

			it ("can humanize the callback by some amount", function(done){

				Offline(function(output, test, after){

					var lastCall;
					
					var note = new Event({
						"humanize" : 0.05,
						"loopEnd" : 0.25,
						"loop" : true,
						"callback" : function(time){
							if (lastCall){
								expect(time - lastCall).to.be.within(0.2, 0.3);
							} 
							lastCall += 0.25;
						}
					}).start(0);

					Tone.Transport.start();

					after(function(){
						note.dispose();	
						done();
					});

				}, 0.6);
			});

		});

	});
});