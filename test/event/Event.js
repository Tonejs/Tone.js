import Basic from "helper/Basic";
import Event from "Tone/event/Event";
import Tone from "Tone/core/Tone";
import Transport from "Tone/core/Transport";
import Offline from "helper/Offline";
import Test from "helper/Test";
import Time from "Tone/type/Time";

describe("Event", function(){

	Basic(Event);

	context("Constructor", function(){

		it("takes a callback and a value", function(){
			return Offline(function(){
				var callback = function(){};
				var note = new Event(callback, "C4");
				expect(note.callback).to.equal(callback);
				expect(note.value).to.equal("C4");
				note.dispose();
			});
		});

		it("can be constructed with no arguments", function(){
			return Offline(function(){
				var note = new Event();
				expect(note.value).to.be.null;
				note.dispose();
			});
		});

		it("can pass in arguments in options object", function(){
			return Offline(function(){
				var callback = function(){};
				var value = { "a" : 1 };
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
				expect(note.loopEnd).to.equal(Time("4n").valueOf());
				expect(note.probability).to.equal(0.3);
				note.dispose();
			});
		});
	});

	context("Get/Set", function(){

		it("can set values with object", function(){
			return Offline(function(){
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
		});

		it("can set get a the values as an object", function(){
			return Offline(function(){
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
	});

	context("Event callback", function(){

		it("does not invoke get invoked until started", function(){
			return Offline(function(Transport){
				new Event(function(){
					throw new Error("shouldn't call this callback");
				}, "C4");
				Transport.start();
			}, 0.3);
		});

		it("is invoked after it's started", function(){
			var invoked = false;
			return Offline(function(Transport){
				var note = new Event(function(){
					note.dispose();
					invoked = true;
				}, "C4").start(0);
				Transport.start();
			}, 0.3).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("passes in the scheduled time to the callback", function(){
			var invoked = false;
			return Offline(function(Transport){
				var now = 0.1;
				var note = new Event(function(time){
					expect(time).to.be.a.number;
					expect(time - now).to.be.closeTo(0.3, 0.01);
					note.dispose();
					invoked = true;
				});
				note.start(0.3);
				Transport.start(now);
			}, 0.5).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("passes in the value to the callback", function(){
			var invoked = false;
			return Offline(function(Transport){
				var note = new Event(function(time, thing){
					expect(time).to.be.a.number;
					expect(thing).to.equal("thing");
					note.dispose();
					invoked = true;
				}, "thing").start();
				Transport.start();
			}, 0.3).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("can mute the callback", function(){
			return Offline(function(Transport){
				var note = new Event(function(){
					throw new Error("shouldn't call this callback");
				}, "C4").start();
				note.mute = true;
				expect(note.mute).to.be.true;
				Transport.start();
			}, 0.3);
		});

		it("can trigger with some probability", function(){

			return Offline(function(Transport){
				var note = new Event(function(){
					throw new Error("shouldn't call this callback");
				}, "C4").start();
				note.probability = 0;
				expect(note.probability).to.equal(0);
				Transport.start();
			}, 0.3);
		});
	});

	context("Scheduling", function(){

		it("can be started and stopped multiple times", function(){
			return Offline(function(Transport){
				var note = new Event().start(0).stop(0.2).start(0.4);
				Transport.start(0);
				return function(time){
					Test.whenBetween(time, 0, 0.19, function(){
						expect(note.state).to.equal("started");
					});
					Test.whenBetween(time, 0.2, 0.39, function(){
						expect(note.state).to.equal("stopped");
					});
					Test.whenBetween(time, 0.4, Infinity, function(){
						expect(note.state).to.equal("started");
					});
				};
			}, 0.5);
		});

		it("restarts when transport is restarted", function(){

			return Offline(function(Transport){
				var note = new Event().start(0).stop(0.4);
				Transport.start(0).stop(0.5).start(0.55);
				return function(sample, time){
					Test.whenBetween(time, 0, 0.39, function(){
						expect(note.state).to.equal("started");
					});
					Test.whenBetween(time, 0.4, 0.5, function(){
						expect(note.state).to.equal("stopped");
					});
					Test.whenBetween(time, 0.55, 0.8, function(){
						expect(note.state).to.equal("started");
					});
				};
			}, 1);
		});

		it("can be cancelled", function(){
			return Offline(function(Transport){
				var note = new Event().start(0);
				expect(note.state).to.equal("started");
				Transport.start();

				var firstStop = false;
				var restarted = false;
				var tested = false;
				return function(time){
					//stop the transport
					if (time > 0.2 && !firstStop){
						firstStop = true;
						Transport.stop();
						note.cancel();
					}
					if (time > 0.3 && !restarted){
						restarted = true;
						Transport.start();
					}
					if (time > 0.4 && !tested){
						restarted = true;
						Transport.start();
						expect(note.state).to.equal("stopped");
					}
				};
			}, 0.5);
		});

	});

	context("Looping", function(){

		it("can be set to loop", function(){
			var callCount = 0;
			return Offline(function(Transport){
				new Event({
					"loopEnd" : 0.25,
					"loop" : true,
					"callback" : function(){
						callCount++;
					}
				}).start(0);
				Transport.start(0);
			}, 0.8).then(function(){
				expect(callCount).to.equal(4);
			});

		});

		it("can be set to loop at a specific interval", function(){
			return Offline(function(Transport){
				var lastCall;
				new Event({
					"loopEnd" : 0.25,
					"loop" : true,
					"callback" : function(time){
						if (lastCall){
							expect(time - lastCall).to.be.closeTo(0.25, 0.01);
						}
						lastCall = time;
					}
				}).start(0);
				Transport.start();
			}, 1);
		});

		it("can adjust the loop duration after starting", function(){
			return Offline(function(Transport){
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
				Transport.start();
			}, 0.8);
		});

		it("can loop a specific number of times", function(){
			var callCount = 0;
			return Offline(function(Transport){
				new Event({
					"loopEnd" : 0.125,
					"loop" : 3,
					"callback" : function(){
						callCount++;
					}
				}).start(0);
				Transport.start();
			}, 0.8).then(function(){
				expect(callCount).to.equal(3);
			});
		});

		it("plays once when loop is 1", function(){
			var callCount = 0;
			return Offline(function(Transport){
				new Event({
					"loopEnd" : 0.125,
					"loop" : 1,
					"callback" : function(){
						callCount++;
					}
				}).start(0);
				Transport.start();
			}, 0.8).then(function(){
				expect(callCount).to.equal(1);
			});
		});

    it("plays once when loop is 0", function(){
			var callCount = 0;
			return Offline(function(Transport){
				new Event({
					"loopEnd" : 0.125,
					"loop" : 0,
					"callback" : function(){
						callCount++;
					}
				}).start(0);
				Transport.start();
			}, 0.8).then(function(){
				expect(callCount).to.equal(1);
			});
		});

    it("plays once when loop is false", function(){
			var callCount = 0;
			return Offline(function(Transport){
				new Event({
					"loopEnd" : 0.125,
					"loop" : false,
					"callback" : function(){
						callCount++;
					}
				}).start(0);
				Transport.start();
			}, 0.8).then(function(){
				expect(callCount).to.equal(1);
			});
    });

		it("can be started and stopped multiple times", function(){
			return Offline(function(Transport){
				var eventTimes = [0.3, 0.4, 0.9, 1.0, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9];
				var eventTimeIndex = 0;
				new Event({
					"loopEnd" : 0.1,
					"loop" : true,
					"callback" : function(time){
						expect(eventTimes.length).to.be.gt(eventTimeIndex);
						expect(eventTimes[eventTimeIndex]).to.be.closeTo(time, 0.05);
						eventTimeIndex++;
					}
				}).start(0.1).stop(0.2).start(0.5).stop(1.1);
				Transport.start(0.2).stop(0.5).start(0.8);
			}, 2);
		});

		it("loops the correct amount of times when the event is started in the Transport's past", function(){
			var callCount = 0;
			return Offline(function(Transport){
				var note = new Event({
					"loopEnd" : 0.2,
					"loop" : 3,
					"callback" : function(){
						callCount++;
					}
				});
				Transport.start();
				var wasCalled = false;
				return function(time){
					if (time > 0.1 && !wasCalled){
						wasCalled = true;
						note.start(0);
					}
				};
			}, 1).then(function(){
				expect(callCount).to.equal(2);
			});
		});

		it("reports the progress of the loop", function(){
			return Offline(function(Transport){
				var note = new Event({
					"loopEnd" : 1,
					"loop" : true,
				});
				expect(note.progress).to.equal(0);
				note.start(0);
				Transport.start();
				return function(time){
					expect(note.progress).to.be.closeTo(time, 0.05);
				};
			}, 0.8);
		});

		it("progress is 0 when not looping", function(){
			Offline(function(Transport){
				var note = new Event({
					"loopEnd" : 0.25,
					"loop" : false,
				}).start(0);
				Transport.start();
				return function(){
					expect(note.progress).to.equal(0);
				};
			}, 0.2);
		});
	});

	context("playbackRate and humanize", function(){

		it("can adjust the playbackRate", function(){
			return Offline(function(Transport){
				var lastCall;
				new Event({
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
				Transport.start();
			}, 0.7);
		});

		it("can adjust the playbackRate after starting", function(){
			return Offline(function(Transport){
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
				Transport.start();
			}, 1.2);

		});

		it("can humanize the callback by some amount", function(){
			return Offline(function(Transport){
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
				Transport.start();
			}, 0.6);
		});

	});

});

