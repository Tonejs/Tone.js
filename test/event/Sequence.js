define(["helper/Basic", "Tone/event/Sequence", "Tone/core/Tone", 
	"Tone/core/Transport", "Tone/event/Event", "helper/Offline2"], 
	function (Basic, Sequence, Tone, Transport, Event, Offline) {

	describe("Sequence", function(){

		Basic(Sequence);

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

			it ("takes a callback and a sequence of values", function(){
				var callback = function(){};
				var seq = new Sequence(callback, [0, 1, 2]);
				expect(seq.callback).to.equal(callback);
				expect(seq.length).to.equal(3);
				seq.dispose();
			});

			it ("takes a callback and a sequence of values and a subdivision", function(){
				var callback = function(){};
				var seq = new Sequence(callback, [0, 1, 2], "2n");
				expect(seq.callback).to.equal(callback);
				expect(seq.subdivision).to.equal("2n");
				expect(seq.length).to.equal(3);
				seq.dispose();
			});

			it ("can be constructed with no arguments", function(){
				var seq = new Sequence();
				expect(seq.length).to.equal(0);
				seq.dispose();
			});

			it ("can pass in arguments in options object", function(){
				var callback = function(){};
				var seq = new Sequence({
					"callback" : callback,
					"humanize" : true,
					"events" : [0, 1, 2],
					"loop" : true,
					"loopEnd" : "4n",
					"probability" : 0.3
				});
				expect(seq.callback).to.equal(callback);
				expect(seq.length).to.equal(3);
				expect(seq.loop).to.be.true;
				expect(seq.loopEnd).to.equal("4n");
				expect(seq.probability).to.equal(0.3);
				expect(seq.humanize).to.be.true;
				seq.dispose();
			});

			it ("loops by default with the loopEnd as the duration of the loop", function(){
				var seq = new Sequence(function(){

				}, [0, 1, 2, 3], "8n");
				expect(seq.loop).to.be.true;
				expect(seq.length).to.equal(4);
				expect(seq.loopEnd).to.equal("2n");
				seq.dispose();
			});
		});

		context("Adding / Removing / Getting Events", function(){

			it("can add an event using the index", function(){
				var seq = new Sequence();
				seq.add(0, 0);
				expect(seq.length).to.equal(1);
				seq.add(1, 1);
				expect(seq.length).to.equal(2);
				seq.dispose();
			});

			it("can add a subsequence", function(){
				var seq = new Sequence();
				seq.add(0, [0, 1, 2]);
				expect(seq.length).to.equal(1);
				seq.dispose();
			});

			it ("can retrieve an event using 'at' and the index", function(){
				var seq = new Sequence(function(){}, [0, 1, 2]);
				expect(seq.length).to.equal(3);
				expect(seq.at(0)).to.be.instanceof(Event);
				expect(seq.at(0).value).to.equal(0);
				expect(seq.at(1).value).to.equal(1);
				expect(seq.at(2).value).to.equal(2);
				expect(seq.at(3)).to.be.null;
				seq.dispose();
			});

			it ("can set the value of an existing event with 'at'", function(){
				var seq = new Sequence(function(){}, [0, 1, 2]);
				expect(seq.length).to.equal(3);
				expect(seq.at(0).value).to.equal(0);
				expect(seq.at(0, 1).value).to.equal(1);
				expect(seq.at(0).value).to.equal(1);
				seq.dispose();
			});

			it ("can remove an event by index", function(){
				var seq = new Sequence(function(){}, [0, 1, 2]);
				expect(seq.length).to.equal(3);
				seq.remove(0);
				expect(seq.length).to.equal(2);
				seq.dispose();
			});


			it ("can add and retrieve a subSequence with 'at'", function(){
				var seq = new Sequence(function(){}, [0, 1, 2]);
				expect(seq.length).to.equal(3);
				expect(seq.at(1, [0, 1])).to.be.instanceof(Sequence);
				expect(seq.at(1).at(0).value).to.equal(0);
				expect(seq.at(1).at(1).value).to.equal(1);
				expect(seq.at(1).at(1, [0, 1])).to.be.instanceof(Sequence);
				expect(seq.at(1).at(1).at(1).value).to.equal(1);
				seq.dispose();
			});

			it("can add another seq", function(){
				var seq = new Sequence();
				expect(seq.length).to.equal(0);
				var subSequence = new Sequence({
					"events" : [0, 0.5]
				});
				seq.add(0, subSequence);
				expect(seq.length).to.equal(1);
				expect(seq.at(0)).to.equal(subSequence);
				seq.dispose();
			});

			it("can remove all of the events", function(){
				var seq = new Sequence(function(){}, [0, 1, 2, 3, 4, 5]);
				expect(seq.length).to.equal(6);
				seq.removeAll();
				expect(seq.length).to.equal(0);
				seq.dispose();
			});
		
		});
		context("Sequence callback", function(){

			afterEach(resetTransport);

			it ("invokes the callback after it's started", function(done){
				var seq = new Sequence(function(){
					seq.dispose();
					done();
				}, [0, 1]).start(0);
				Tone.Transport.start();
			});

			it ("passes in the scheduled time to the callback", function(done){
				var now = Tone.Transport.now() + 0.1;
				var seq = new Sequence(function(time){
					expect(time).to.be.a.number;
					expect(time - now).to.be.closeTo(0.3, 0.01);
					seq.dispose();
					done();
				}, [0.5]);
				seq.start(0.3);
				Tone.Transport.start(now);
			});

			it ("passes in the value to the callback", function(done){
				var seq = new Sequence(function(time, thing){
					expect(time).to.be.a.number;
					expect(thing).to.equal("thing");
					seq.dispose();
					done();
				}, ["thing"]).start();
				Tone.Transport.start();
			});

			it ("invokes the scheduled events in the right order", function(done){
				Offline(function(dest, test, after){

					var count = 0;
					var seq = new Sequence(function(time, value){
						expect(value).to.equal(count);
						count++;
					}, [0, [1, 2], [3, 4]], "16n").start();

					seq.loop = false;
					Tone.Transport.start();

					after(function(){
						seq.dispose();
						done();
					});
				}, 0.5);
			});

			it ("invokes the scheduled events at the correct times", function(done){

				Offline(function(dest, test, after){

					var count = 0;
					var eighth = Tone.Transport.toSeconds("8n");
					var times = [0, eighth, eighth * 1.5, eighth * 2, eighth*(2 + 1/3), eighth*(2 + 2/3)];

					var seq = new Sequence(function(time){
						expect(time).to.be.closeTo(times[count], 0.01);
						count++;
					}, [0, [1, 2], [3, 4, 5]], "8n").start(0);

					seq.loop = false;
					Tone.Transport.start();

					after(function(){
						seq.dispose();
						done();
					});
				}, 0.8);
			});

			it ("can schedule rests using 'null'", function(done){

				Offline(function(dest, test, after){

					var count = 0;
					var eighth = Tone.Transport.toSeconds("8n");
					var times = [0, eighth * 2.5];
					var seq = new Sequence(function(time, value){
						expect(time).to.be.closeTo(times[count], 0.01);
						count++;
					}, [0, null, [null, 1]], "8n").start(0);

					seq.loop = false;
					Tone.Transport.start();
					
					after(function(){
						seq.dispose();
						done();
					});
				}, 0.8);
			});

			it ("can schedule triple nested arrays", function(done){
				Offline(function(output, test, after){

					var count = 0;
					var eighth = Tone.Transport.toSeconds("8n");
					var times = [0,eighth, eighth * 1.5, eighth * 1.75];
					var seq = new Sequence(function(time){
						expect(time).to.be.closeTo(times[count], 0.01);
						count++;
					}, [0, [1, [2, 3]]], "8n").start(0);
					seq.loop = false;

					Tone.Transport.start(0);
					
					after(function(){
						seq.dispose();
						done();
					});
				}, 0.7);
			});

			it ("starts an event added after the seq was started", function(done){
				var seq = new Sequence({
					"callback" : function(time, value){
						if (value === 1){
							seq.dispose();
							done();
						}
					},
					"events" : [[0, 1]]
				}).start(0);
				Tone.Transport.start();
				setTimeout(function(){
					seq.add(1, 1);
				}, 100);
			});

		});

		context("Looping", function(){

			afterEach(resetTransport);

			it ("can be set to loop", function(done){
				var callCount = 0;
				var seq = new Sequence({
					"loopEnd" : 0.2,
					"loop" : true,
					"callback" : function(){
						callCount++;
						if (callCount > 2){
							seq.dispose();
							done();
						}
					},
					"events" : [0, 1]
				}).start(0);
				Tone.Transport.start();
			});

			it ("can loop between loopStart and loopEnd", function(done){
				Offline(function(output, test, after){

					var seq = new Sequence({
						"loopEnd" : "4n",
						"loopStart" : "8n",
						"callback" : function(time, value){
							expect(value).to.be.at.least(1);
							expect(value).to.be.at.most(3);
						},
						"subdivision" : "8n",
						"events" : [0, [1, 2, 3], [4, 5]]
					}).start(0);
					Tone.Transport.start();
					after(function(){
						seq.dispose();
						done();
					});
				}, 0.7);
			});

			it ("can set the loop points after starting", function(done){
				Offline(function(output, test, after){

					var switched = false;
					var seq = new Sequence({
						"callback" : function(time, value){
							if (value === 4){
								seq.loopStart = "8n";
								switched = true;
							}
							if (switched){
								expect(value).to.be.at.least(4);
								expect(value).to.be.at.most(5);
							}
						},
						"subdivision" : "16n",
						"events" : [0, [1, 2, 3], [4, 5]]
					}).start(0);

					Tone.Transport.start();

					after(function(){
						seq.dispose();
						done();
					});
				}, 0.7);
			});

		});

			
		context("playbackRate", function(){

			afterEach(resetTransport);

			it ("can adjust the playbackRate", function(done){

				Offline(function(output, test, after){

					var lastCall;
					var seq = new Sequence({
						"playbackRate" : 2,
						"subdivision" : "4n",
						"events" : [0, 1],
						"callback" : function(time){
							if (lastCall){
								expect(time - lastCall).to.be.closeTo(0.25, 0.01);
							}
							lastCall = time;
						}
					}).start(0);

					Tone.Transport.start();

					after(function(){
						seq.dispose();	
						done();
					});

				}, 0.7);
			});

			it ("adjusts speed of subsequences", function(done){
				Offline(function(output, test, after){

					var lastCall;
					var seq = new Sequence({
						"playbackRate" : 0.5,
						"subdivision" : "8n",
						"events" : [[0, 1], [2, 3]],
						"callback" : function(time){
							if (lastCall){
								expect(time - lastCall).to.be.closeTo(0.25, 0.01);
							}
							lastCall = time;
						}
					}).start(0);
					Tone.Transport.start();

					after(function(){
						seq.dispose();	
						done();
					});

				}, 0.7);
			});
			
			it ("can adjust the playbackRate after starting", function(done){

				Offline(function(output, test, after){

					var lastCall;
					var seq = new Sequence({
						"playbackRate" : 1,
						"subdivision" : "8n",
						"events" : [0, 1],
						"callback" : function(time){
							if (lastCall){
								expect(time - lastCall).to.be.closeTo(0.5, 0.01);
							} else {
								seq.playbackRate = 0.5;
							}
							lastCall = time;
						}
					}).start(0);
					Tone.Transport.start();

					after(function(){
						seq.dispose();	
						done();
					});
					
				}, 0.8);
			});

		});

	});
});