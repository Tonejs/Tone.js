import Basic from "helper/Basic";
import Loop from "Tone/event/Loop";
import Tone from "Tone/core/Tone";
import Transport from "Tone/core/Transport";
import Offline from "helper/Offline";
import Test from "helper/Test";
import Time from "Tone/type/Time";

describe("Loop", function(){

	Basic(Loop);

	context("Constructor", function(){

		it("takes a callback and an interval", function(){
			return Offline(function(){
				var callback = function(){};
				var loop = new Loop(callback, "8n");
				expect(loop.callback).to.equal(callback);
				expect(loop.interval.valueOf()).to.equal(Time("8n").valueOf());
				loop.dispose();
			});
		});

		it("can be constructed with no arguments", function(){
			return Offline(function(){
				var loop = new Loop();
				expect(loop.iterations).to.equal(Infinity);
				loop.dispose();
			});
		});

		it("can pass in arguments in options object", function(){
			return Offline(function(){
				var callback = function(){};
				var loop = new Loop({
					"callback" : callback,
					"iterations" : 4,
					"probability" : 0.3,
					"interval" : "8t"
				});
				expect(loop.callback).to.equal(callback);
				expect(loop.interval.valueOf()).to.equal(Time("8t").valueOf());
				expect(loop.iterations).to.equal(4);
				expect(loop.probability).to.equal(0.3);
				loop.dispose();
			});
		});
	});

	context("Get/Set", function(){

		it("can set values with object", function(){
			return Offline(function(){
				var callback = function(){};
				var loop = new Loop();
				loop.set({
					"callback" : callback,
					"iterations" : 8
				});
				expect(loop.callback).to.equal(callback);
				expect(loop.iterations).to.equal(8);
				loop.dispose();
			});
		});

		it("can get/set the humanize values", function(){
			return Offline(function(){
				var callback = function(){};
				var loop = new Loop();
				loop.humanize = true;
				expect(loop.humanize).to.be.true;
				loop.dispose();
			});
		});

		it("can set get a the values as an object", function(){
			return Offline(function(){
				var callback = function(){};
				var loop = new Loop({
					"callback" : callback,
					"iterations" : 4,
					"probability" : 0.3
				});
				var values = loop.get();
				expect(values.iterations).to.equal(4);
				expect(values.probability).to.equal(0.3);
				loop.dispose();
			});
		});
	});

	context("Callback", function(){

		it("does not invoke get invoked until started", function(){
			return Offline(function(Transport){
				new Loop(function(){
					throw new Error("shouldn't call this callback");
				}, "8n");
				Transport.start();
			}, 0.3);
		});

		it("is invoked after it's started", function(){
			var invoked = false;
			return Offline(function(Transport){
				var loop = new Loop(function(){
					loop.dispose();
					invoked = true;
				}, 0.05).start(0);
				Transport.start();
			}).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("passes in the scheduled time to the callback", function(){
			var invoked = false;
			return Offline(function(Transport){
				var now = Transport.now() + 0.1;
				var loop = new Loop(function(time){
					expect(time).to.be.a.number;
					expect(time - now).to.be.closeTo(0.3, 0.01);
					loop.dispose();
					invoked = true;
				});
				Transport.start(now);
				loop.start(0.3);
			}, 0.5).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("can mute the callback", function(){
			return Offline(function(){
				var loop = new Loop(function(){
					throw new Error("shouldn't call this callback");
				}, "4n").start();
				loop.mute = true;
				expect(loop.mute).to.be.true;
				Transport.start();
			}, 0.4);
		});

		it("can trigger with some probability", function(){
			return Offline(function(Transport){
				var loop = new Loop(function(){
					throw new Error("shouldn't call this callback");
				}, "4n").start();
				loop.probability = 0;
				expect(loop.probability).to.equal(0);
				Transport.start();
			}, 0.4);
		});
	});

	context("Scheduling", function(){

		it("can be started and stopped multiple times", function(){
			return Offline(function(Transport){
				var loop = new Loop().start().stop(0.2).start(0.4);
				Transport.start(0);
				return function(time){
					Test.whenBetween(time, 0, 0.19, function(){
						expect(loop.state).to.equal("started");
					});
					Test.whenBetween(time, 0.2, 0.39, function(){
						expect(loop.state).to.equal("stopped");
					});
					Test.whenBetween(time, 0.4, Infinity, function(){
						expect(loop.state).to.equal("started");
					});
				};
			}, 0.6);
		});

		it("restarts when transport is restarted", function(){
			return Offline(function(Transport){
				var note = new Loop().start(0).stop(0.4);
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
				var note = new Loop().start(0);
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

		it("loops", function(){
			var callCount = 0;
			return Offline(function(Transport){
				new Loop({
					"interval" : 0.1,
					"callback" : function(){
						callCount++;
					}
				}).start(0);
				Transport.start();
			}, 0.8).then(function(){
				expect(callCount).to.equal(9);
			});
		});

		it("loops for the specified interval", function(){
			var invoked = false;
			return Offline(function(Transport){
				var lastCall;
				new Loop({
					"interval" : "8n",
					"callback" : function(time){
						if (lastCall){
							invoked = true;
							expect(time - lastCall).to.be.closeTo(0.25, 0.01);
						}
						lastCall = time;
					}
				}).start(0);
				Transport.start();
			}, 1).then(function(){
				expect(invoked).to.be.true;
			});
		});

		it("can loop a specific number of iterations", function(){
			var callCount = 0;
			return Offline(function(Transport){
				new Loop({
					"interval" : 0.1,
					"iterations" : 2,
					"callback" : function(){
						callCount++;
					}
				}).start(0);
				Transport.start();
			}, 0.4).then(function(){
				expect(callCount).to.equal(2);
			});
		});

		it("reports the progress of the loop", function(){
			return Offline(function(Transport){
				var loop = new Loop({
					"interval" : 1,
				}).start(0);
				Transport.start();
				return function(time){
					expect(loop.progress).to.be.closeTo(time, 0.05);
				};
			}, 0.8);
		});
	});

	context("playbackRate", function(){

		it("can adjust the playbackRate", function(){
			var invoked = false;
			return Offline(function(Transport){
				var lastCall;
				var loop = new Loop({
					"playbackRate" : 2,
					"interval" : 0.5,
					"callback" : function(time){
						if (lastCall){
							invoked = true;
							expect(time - lastCall).to.be.closeTo(0.25, 0.01);
						}
						lastCall = time;
					}
				}).start(0);
				expect(loop.playbackRate).to.equal(2);
				Transport.start();
			}, 0.7).then(function(){
				expect(invoked).to.be.true;
			});

		});

		it("can playback at a faster rate", function(){
			var callCount = 0;
			return Offline(function(Transport){
				var loop = new Loop({
					"interval" : 0.1,
					"callback" : function(){
						callCount++;
					}
				}).start(0);
				loop.playbackRate = 1.5;
				expect(loop.playbackRate).to.equal(1.5);
				Transport.start();
			}, 0.8).then(function(){
				expect(callCount).to.equal(13);
			});
		});

	});

});

