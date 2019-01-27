import Basic from "helper/Basic";
import Sequence from "Tone/event/Sequence";
import Tone from "Tone/core/Tone";
import Transport from "Tone/core/Transport";
import Event from "Tone/event/Event";
import Offline from "helper/Offline";
import Test from "helper/Test";
import Time from "Tone/type/Time";

describe("Sequence", function(){

	Basic(Sequence);

	context("Constructor", function(){

		it("takes a callback and a sequence of values", function(){
			return Offline(function(){
				var callback = function(){};
				var seq = new Sequence(callback, [0, 1, 2]);
				expect(seq.callback).to.equal(callback);
				expect(seq.length).to.equal(3);
				seq.dispose();
			});
		});

		it("takes a callback and a sequence of values and a subdivision", function(){
			return Offline(function(){
				var callback = function(){};
				var seq = new Sequence(callback, [0, 1, 2], "2n");
				expect(seq.callback).to.equal(callback);
				expect(seq.subdivision).to.equal(Time("2n").valueOf());
				expect(seq.length).to.equal(3);
				seq.dispose();
			});
		});

		it("can be constructed with no arguments", function(){
			return Offline(function(){
				var seq = new Sequence();
				expect(seq.length).to.equal(0);
				seq.dispose();
			});
		});

		it("can pass in arguments in options object", function(){
			return Offline(function(){
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
				expect(seq.loopEnd).to.equal(Time("4n").valueOf());
				expect(seq.probability).to.equal(0.3);
				expect(seq.humanize).to.be.true;
				seq.dispose();
			});
		});

		it("loops by default with the loopEnd as the duration of the loop", function(){
			return Offline(function(){
				var seq = new Sequence(function(){}, [0, 1, 2, 3], "8n");
				expect(seq.loop).to.be.true;
				expect(seq.length).to.equal(4);
				expect(seq.loopEnd).to.equal(Time("2n").valueOf());
				seq.dispose();
			});
		});
	});

	context("Adding / Removing / Getting Events", function(){

		it("can add an event using the index", function(){
			return Offline(function(){
				var seq = new Sequence();
				seq.add(0, 0);
				expect(seq.length).to.equal(1);
				seq.add(1, 1);
				expect(seq.length).to.equal(2);
				seq.dispose();
			});
		});

		it("can add a subsequence", function(){
			return Offline(function(){
				var seq = new Sequence();
				seq.add(0, [0, 1, 2]);
				expect(seq.length).to.equal(1);
				seq.dispose();
			});
		});

		it("can retrieve an event using 'at' and the index", function(){
			return Offline(function(){
				var seq = new Sequence(function(){}, [0, 1, 2]);
				expect(seq.length).to.equal(3);
				expect(seq.at(0)).to.be.instanceof(Event);
				expect(seq.at(0).value).to.equal(0);
				expect(seq.at(1).value).to.equal(1);
				expect(seq.at(2).value).to.equal(2);
				expect(seq.at(3)).to.be.null;
				seq.dispose();
			});
		});

		it("can set the value of an existing event with 'at'", function(){
			return Offline(function(){
				var seq = new Sequence(function(){}, [0, 1, 2]);
				expect(seq.length).to.equal(3);
				expect(seq.at(0).value).to.equal(0);
				expect(seq.at(0, 1).value).to.equal(1);
				expect(seq.at(0).value).to.equal(1);
				seq.dispose();
			});
		});

		it("can remove an event by index", function(){
			return Offline(function(){
				var seq = new Sequence(function(){}, [0, 1, 2]);
				expect(seq.length).to.equal(3);
				seq.remove(0);
				expect(seq.length).to.equal(2);
				seq.dispose();
			});
		});

		it("can add a subsequence and remove the entire subsequence", function(){
			return Offline(function(){
				var seq = new Sequence(function(){}, [0, 1, 2]);
				expect(seq.length).to.equal(3);
				seq.remove(0);
				seq.add(0, [1, 2]);
				expect(seq.length).to.equal(3);
				expect(seq.at(0).at(0).value).to.equal(1);
				expect(seq.at(0).at(1).value).to.equal(2);
				seq.remove(0);
				expect(seq.at(0)).to.equal(null);
				seq.add(0, 4);
				expect(seq.at(0).value).to.equal(4);
				seq.dispose();
			});
		});

		it("can add and retrieve a subSequence with 'at'", function(){
			return Offline(function(){
				var seq = new Sequence(function(){}, [0, 1, 2]);
				expect(seq.length).to.equal(3);
				expect(seq.at(1, [0, 1])).to.be.instanceof(Sequence);
				expect(seq.at(1).at(0).value).to.equal(0);
				expect(seq.at(1).at(1).value).to.equal(1);
				expect(seq.at(1).at(1, [0, 1])).to.be.instanceof(Sequence);
				expect(seq.at(1).at(1).at(1).value).to.equal(1);
				seq.dispose();
			});
		});

		it("can add another seq", function(){
			return Offline(function(){
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
		});

		it("can remove all of the events", function(){
			return Offline(function(){
				var seq = new Sequence(function(){}, [0, 1, 2, 3, 4, 5]);
				expect(seq.length).to.equal(6);
				seq.removeAll();
				expect(seq.length).to.equal(0);
				seq.dispose();
			});
		});

	});
	context("Sequence callback", function(){

		it("invokes the callback after it's started", function(){
			var invoked = false;
			return Offline(function(Transport){
				var seq = new Sequence(function(){
					seq.dispose();
					invoked = true;
				}, [0, 1]).start(0);
				Transport.start();
			}, 0.1).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("passes in the scheduled time to the callback", function(){
			var invoked = false;
			return Offline(function(Transport){
				var now = 0.1;
				var seq = new Sequence(function(time){
					expect(time).to.be.a.number;
					expect(time - now).to.be.closeTo(0.3, 0.01);
					seq.dispose();
					invoked = true;
				}, [0.5]);
				seq.start(0.3);
				Transport.start(now);
			}, 0.5).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("passes in the value to the callback", function(){
			var invoked = false;
			return Offline(function(Transport){
				var seq = new Sequence(function(time, thing){
					expect(time).to.be.a.number;
					expect(thing).to.equal("thing");
					seq.dispose();
					invoked = true;
				}, ["thing"]).start();
				Transport.start();
			}, 0.1).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("invokes the scheduled events in the right order", function(){
			var count = 0;
			return Offline(function(Transport){
				var seq = new Sequence(function(time, value){
					expect(value).to.equal(count);
					count++;
				}, [0, [1, 2], [3, 4]], "16n").start();
				seq.loop = false;
				Transport.start(0);
			}, 0.5).then(function(){
				expect(count).to.equal(5);
			});
		});

		it("invokes the scheduled events at the correct times", function(){
			var count = 0;
			return Offline(function(Transport){
				var eighth = Transport.toSeconds("8n");
				var times = [0, eighth, eighth * 1.5, eighth * 2, eighth*(2 + 1/3), eighth*(2 + 2/3)];
				var seq = new Sequence(function(time){
					expect(time).to.be.closeTo(times[count], 0.01);
					count++;
				}, [0, [1, 2], [3, 4, 5]], "8n").start(0);
				seq.loop = false;
				Transport.start(0);
			}, 0.8).then(function(){
				expect(count).to.equal(6);
			});
		});

		it("can schedule rests using 'null'", function(){
			var count = 0;
			return Offline(function(Transport){
				var eighth = Transport.toSeconds("8n");
				var times = [0, eighth * 2.5];
				var seq = new Sequence(function(time, value){
					expect(time).to.be.closeTo(times[count], 0.01);
					count++;
				}, [0, null, [null, 1]], "8n").start(0);
				seq.loop = false;
				Transport.start(0);
			}, 0.8).then(function(){
				expect(count).to.equal(2);
			});
		});

		it("can schedule triple nested arrays", function(){
			var count = 0;
			return Offline(function(Transport){
				var eighth = Transport.toSeconds("8n");
				var times = [0, eighth, eighth * 1.5, eighth * 1.75];
				var seq = new Sequence(function(time){
					expect(time).to.be.closeTo(times[count], 0.01);
					count++;
				}, [0, [1, [2, 3]]], "8n").start(0);
				seq.loop = false;
				Transport.start(0);
			}, 0.7).then(function(){
				expect(count).to.equal(4);
			});
		});

		it("starts an event added after the seq was started", function(){
			var invoked = false;
			return Offline(function(Transport){
				var seq = new Sequence({
					"callback" : function(time, value){
						if (value === 1){
							seq.dispose();
							invoked = true;
						}
					},
					"events" : [[0, 1]]
				}).start(0);
				Transport.start();

				var addNote = Test.atTime(0.1, function(){
					seq.add(1, 1);
				});
				return function(time){
					addNote(time);
				};
			}, 0.5).then(function(){
				expect(invoked).to.be.true;
			});
		});

	});

	context("Looping", function(){

		it("can be set to loop", function(){
			var callCount = 0;
			return Offline(function(Transport){
				var seq = new Sequence({
					"loopEnd" : 0.2,
					"loop" : true,
					"callback" : function(){
						callCount++;
						if (callCount > 2){
							seq.dispose();
						}
					},
					"events" : [0, 1]
				}).start(0);
				Transport.start();
			}, 0.5).then(function(){
				expect(callCount).to.equal(3);
			});
		});

		it("can loop between loopStart and loopEnd", function(){
			var invokations = 0;
			return Offline(function(Transport){
				new Sequence({
					"loopEnd" : "4n",
					"loopStart" : "8n",
					"callback" : function(time, value){
						expect(value).to.be.at.least(1);
						expect(value).to.be.at.most(3);
						invokations++;
					},
					"subdivision" : "8n",
					"events" : [0, [1, 2, 3], [4, 5]]
				}).start(0);
				Transport.start();
			}, 0.7).then(function(){
				expect(invokations).to.equal(9);
			});
		});

		it("can set the loop points after starting", function(){
			var invoked = false;
			return Offline(function(Transport){
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
							invoked = true;
						}
					},
					"subdivision" : "16n",
					"events" : [0, [1, 2, 3], [4, 5]]
				}).start(0);
				Transport.start();
			}, 0.7).then(function(){
				expect(invoked).to.be.true;
			});
		});
	});

	context("playbackRate", function(){

		it("can adjust the playbackRate", function(){
			var invoked = false;
			return Offline(function(Transport){
				var lastCall;
				new Sequence({
					"playbackRate" : 2,
					"subdivision" : "4n",
					"events" : [0, 1],
					"callback" : function(time){
						if (lastCall){
							invoked = true;
							expect(time - lastCall).to.be.closeTo(0.25, 0.01);
						}
						lastCall = time;
					}
				}).start(0);
				Transport.start();
			}, 0.7).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("adjusts speed of subsequences", function(){
			var invoked = false;
			return Offline(function(Transport){
				var lastCall;
				new Sequence({
					"playbackRate" : 0.5,
					"subdivision" : "8n",
					"events" : [[0, 1], [2, 3]],
					"callback" : function(time){
						if (lastCall){
							expect(time - lastCall).to.be.closeTo(0.25, 0.01);
							invoked = true;
						}
						lastCall = time;
					}
				}).start(0);
				Transport.start();
			}, 0.7).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("can adjust the playbackRate after starting", function(){
			var invoked = false;
			return Offline(function(Transport){
				var lastCall;
				var seq = new Sequence({
					"playbackRate" : 1,
					"subdivision" : "8n",
					"events" : [0, 1],
					"callback" : function(time){
						if (lastCall){
							expect(time - lastCall).to.be.closeTo(0.5, 0.01);
							invoked = true;
						} else {
							seq.playbackRate = 0.5;
						}
						lastCall = time;
					}
				}).start(0);
				Transport.start();
			}, 2).then(function(){
				expect(invoked).to.be.true;
			});
		});

	});

});

