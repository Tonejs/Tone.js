define(["helper/Basic", "Tone/event/Part", "Tone/core/Tone", "Tone/core/Transport", "Tone/event/Event"], 
	function (Basic, Part, Tone, Transport, Event) {

	describe("Part", function(){

		Basic(Part);

		function resetTransport(done){
			Tone.Transport.cancel(0);
			Tone.Transport.off("start stop pause loop");
			Tone.Transport.stop();
			Tone.Transport.loop = false;
			Tone.Transport.PPQ = 48;
			Tone.Transport.bpm.value = 120;
			Tone.Transport.timeSignature = [4, 4];
			setTimeout(done, 200);
		}

		context("Constructor", function(){

			afterEach(resetTransport);

			it ("takes a callback and an array of values", function(){
				var callback = function(){};
				var part = new Part(callback, [0, 1, 2]);
				expect(part.callback).to.equal(callback);
				expect(part.length).to.equal(3);
				part.dispose();
			});

			it ("can be constructed with no arguments", function(){
				var part = new Part();
				expect(part.length).to.equal(0);
				part.dispose();
			});

			it ("can pass in arguments in options object", function(){
				var callback = function(){};
				var part = new Part({
					"callback" : callback,
					"humanize" : true,
					"events" : [0, 1, 2],
					"loop" : true,
					"loopEnd" : "4n",
					"probability" : 0.3
				});
				expect(part.callback).to.equal(callback);
				expect(part.length).to.equal(3);
				expect(part.loop).to.be.true;
				expect(part.loopEnd).to.equal("4n");
				expect(part.probability).to.equal(0.3);
				expect(part.humanize).to.be.true;
				part.dispose();
			});
		});

		context("Adding / Removing / Getting Events", function(){

			it("can take events in the constructor as an array of times", function(){
				var part = new Part(function(){}, ["0", "8n", "4n"]);
				expect(part.length).to.equal(3);
				part.dispose();
			});

			it("can take events in the constructor as an array of times and values", function(){
				var part = new Part(function(){}, [["0", "C4"], ["8n", "D3"], ["4n", "E4"]]);
				expect(part.length).to.equal(3);
				part.dispose();
			});

			it ("can retrieve an event using 'at'", function(){
				var part = new Part(function(){}, [["0", 0], ["8n", "C2"], ["4n", 2]]);
				expect(part.length).to.equal(3);
				expect(part.at(0)).to.be.instanceof(Event);
				expect(part.at(0).value).to.equal(0);
				expect(part.at("8n").value).to.equal("C2");
				expect(part.at("4n").value).to.equal(2);
				expect(part.at("2n")).to.be.null;
				part.dispose();
			});

			it("can set the value of an existing event with 'at'", function(){
				var part = new Part({
					"events" : [[0, "C3"]]
				});
				expect(part.length).to.equal(1);
				expect(part.at(0).value).to.equal("C3");
				part.at(0, "C4");
				expect(part.at(0).value).to.equal("C4");
				part.dispose();
			});

			it("can take events in the constructor as an array of objects", function(){
				var part = new Part(function(){}, [{
					"time" : 0.3,
					"note" : "C3"
				},
				{
					"time" : 1,
					"note" : "D3"
				}]);
				expect(part.length).to.equal(2);
				expect(part.at(0.3).value).to.deep.equal({note : "C3"});
				part.dispose();
			});

			it("can add an event as a time and value", function(){
				var part = new Part();
				expect(part.length).to.equal(0);
				part.add(1, "D3");
				expect(part.length).to.equal(1);
				expect(part.at(1).value).to.equal("D3");
				part.dispose();
			});

			it("can add an event as an object", function(){
				var part = new Part();
				expect(part.length).to.equal(0);
				part.add({
					"time" : 0.5,
					"note" : "D4",
					"duration" : "8n"
				});
				expect(part.length).to.equal(1);
				expect(part.at(0.5).value).to.deep.equal({"note" : "D4", "duration" : "8n"});
				part.dispose();
			});

			it("can remove an event by time", function(){
				var part = new Part({
					"events" : [[0.2, "C3"], [0.2, "C4"]]
				});
				expect(part.length).to.equal(2);
				part.remove(0.2);
				expect(part.length).to.equal(0);
				part.dispose();
			});

			it("can remove an event by time and value", function(){
				var part = new Part({
					"events" : [[0.2, "C3"], [0.2, "C4"]]
				});
				expect(part.length).to.equal(2);
				part.remove(0.2, "C4");
				expect(part.length).to.equal(1);
				part.dispose();
			});

			it("added events have the same settings as the parent", function(){
				var part = new Part({
					"humanize" : 0.1,
					"probability" : 0.2,
					"events" : [[0.2, "C3"], [0.3, "C4"]]
				});
				expect(part.at(0.2).humanize).to.equal(0.1);
				expect(part.at(0.3).probability).to.equal(0.2);
				part.dispose();
			});

			it("will create an event using at if one wasn't there at that time", function(){
				var part = new Part();
				expect(part.length).to.equal(0);
				expect(part.at(0.1, "C4").value).to.equal("C4");
				expect(part.length).to.equal(1);
				part.dispose();
			});

			it("can remove all of the events", function(){
				var part = new Part(function(){}, [0, 1, 2, 3, 4, 5]);
				expect(part.length).to.equal(6);
				part.removeAll();
				expect(part.length).to.equal(0);
				part.dispose();
			});

		});

		context("Part callback", function(){

			afterEach(resetTransport);

			it ("does not invoke get invoked until started", function(done){
				var part = new Event(function(){
					throw new Error("shouldn't call this callback");
				}, [0, 0.4]);
				Tone.Transport.start();
				setTimeout(function(){
					part.dispose();
					done();
				}, 300);
			});

			it ("is invoked after it's started", function(done){
				var part = new Part(function(){
					part.dispose();
					done();
				}, [0, 1]).start(0);
				Tone.Transport.start();
			});

			it ("passes in the scheduled time to the callback", function(done){
				var now = Tone.Transport.now();
				var part = new Part(function(time){
					expect(time).to.be.a.number;
					expect(time - now).to.be.closeTo(0.8, 0.01);
					part.dispose();
					done();
				}, [0.5]);
				part.start(0.3);
				Tone.Transport.start();
			});

			it ("passes in the value to the callback", function(done){
				var part = new Part(function(time, thing){
					expect(time).to.be.a.number;
					expect(thing).to.equal("thing");
					part.dispose();
					done();
				}, [[0, "thing"]]).start();
				Tone.Transport.start();
			});

			it ("can mute the callback", function(done){
				var part = new Part(function(){
					throw new Error("shouldn't call this callback");
				}, [0, 0.1, 0.2, 0.3]).start();
				part.mute = true;
				expect(part.mute).to.be.true;
				Tone.Transport.start();
				setTimeout(function(){
					part.dispose();
					done();
				}, 300);
			});

			it ("can trigger with some probability", function(done){
				var part = new Part(function(){
					throw new Error("shouldn't call this callback");
				}, [0, 1, 2, 3]).start();
				part.probability = 0;
				expect(part.probability).to.equal(0);
				Tone.Transport.start();
				setTimeout(function(){
					part.dispose();
					done();
				}, 300);
			});


			it ("invokes all of the scheduled events", function(done){
				var count = 0;
				var part = new Part(function(){
					count++;
				}, [0, 0.1, 0.2, 0.3]).start();
				Tone.Transport.start();
				setTimeout(function(){
					expect(count).to.equal(4);
					part.dispose();
					done();
				}, 400);
			});

			it ("invokes all of the scheduled events at the correct times", function(done){
				var count = 0;
				var now = Tone.Transport.now() + 0.1;
				var part = new Part(function(time, value){
					count++;
					expect(time - now).to.be.closeTo(value, 0.01);
				}, [[0, 0], [0.1, 0.1], [0.2, 0.2]]).start();
				Tone.Transport.start(now);
				setTimeout(function(){
					expect(count).to.equal(3);
					part.dispose();
					done();
				}, 400);
			});

			it ("starts an event added after the part was started", function(done){
				var part = new Part({
					"loopEnd" : 0.2,
					"loop" : true,
					"callback" : function(time, value){
						if (value === 1){
							part.dispose();
							done();
						}
					},
					"events" : [[0, 0]]
				}).start(0);
				Tone.Transport.start();
				setTimeout(function(){
					part.add(0.1, 1);
				}, 100);
			});
		});
		
		context("Looping", function(){

			afterEach(resetTransport);

			it ("can be set to loop", function(done){
				var callCount = 0;
				var part = new Part({
					"loopEnd" : 0.2,
					"loop" : true,
					"callback" : function(){
						callCount++;
					},
					"events" : [0, 0.1]
				}).start(0);
				Tone.Transport.start();

				setTimeout(function(){
					expect(callCount).to.equal(6);
					part.dispose();	
					done();
				}, 550);
			});

			it ("can be set to loop at a specific interval", function(done){
				var lastCall;
				var note = new Part({
					"loopEnd" : 0.25,
					"loop" : true,
					"callback" : function(time){
						if (lastCall){
							expect(time - lastCall).to.be.closeTo(0.25, 0.01);
						}
						lastCall = time;
					},
					events : [0]
				}).start(0);
				Tone.Transport.start();

				setTimeout(function(){
					note.dispose();	
					done();
				}, 700);
			});

			it ("a started note will be stopped if it is after the loopEnd", function(done){
				var switched = false;
				var note = new Part({
					"loopEnd" : 0.5,
					"loop" : true,
					"callback" : function(time, value){
						if (value === 1){
							switched = true;
							note.loopEnd = 0.2;
						} else if (switched){
							expect(value).to.equal(0);
						} 
					},
					events : [[0, 0], [0.25, 1]]
				}).start(0);
				Tone.Transport.start();

				setTimeout(function(){
					note.dispose();	
					done();
				}, 700);
			});

			it ("a started note will be stopped if it is before the loopStart", function(done){
				var switched = false;
				var note = new Part({
					"loopEnd" : 0.5,
					"loop" : true,
					"callback" : function(time, value){
						if (value === 1){
							switched = true;
							note.loopStart = 0.2;
						} else if (switched){
							expect(value).to.equal(1);
						} 
					},
					events : [[0, 0], [0.25, 1]]
				}).start(0);
				Tone.Transport.start();

				setTimeout(function(){
					note.dispose();	
					done();
				}, 700);
			});

			
			it ("can loop a specific number of times", function(done){
				var callCount = 0;
				var note = new Part({
					"loopEnd" : 0.125,
					"loop" : 3,
					"callback" : function(){
						callCount++;
					},
					events : [0, 0.1]
				}).start(0);
				Tone.Transport.start();

				setTimeout(function(){
					expect(callCount).to.equal(6);
					note.dispose();	
					done();
				}, 800);
			});

			it ("can loop between loopStart and loopEnd", function(done){
				var note = new Part({
					"loopStart" : "8n",
					"loopEnd" : "4n",
					"loop" : true,
					"callback" : function(time, value){
						expect(value).to.be.at.least(1);
						expect(value).to.be.at.most(2);
					},
					events : [[0, 0], ["8n", 1], ["8n + 16n", 2], ["4n", 3]]
				}).start(0);
				Tone.Transport.start();

				setTimeout(function(){
					note.dispose();	
					done();
				}, 800);
			});


			it ("reports the progress of the loop", function(done){
				var callCount = 0;
				var note = new Part({
					"loopEnd" : 1,
					"loop" : true,
					"callback" : function(){
						callCount++;
					}
				}).start(0);
				Tone.Transport.start();
				setTimeout(function(){
					expect(note.progress).to.be.closeTo(0.8, 0.05);
					note.dispose();	
					done();
				}, 800);
			});

		});
	});
});