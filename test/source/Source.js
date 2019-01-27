import Test from "helper/Test";
import Source from "Tone/source/Source";
import Transport from "Tone/core/Transport";
import Offline from "helper/Offline";
import Tone from "Tone/core/Tone";
import Supports from "helper/Supports";

describe("Source", function(){

	it("can be created and disposed", function(){
		var source = new Source();
		source.dispose();
		Test.wasDisposed(source);
	});

	it("can be started and stopped", function(){
		var source = new Source();
		source.start(0);
		source.stop(1);
		source.dispose();
	});

	it("can be constructed with an options object", function(){
		var source = new Source({
			"volume" : -20,
		});
		expect(source.volume.value).to.be.closeTo(-20, 0.1);
		source.dispose();
	});

	it("can be muted in the constructor options", function(){
		var source = new Source({
			"mute" : true
		});
		expect(source.mute).to.be.true;
		source.dispose();
	});

	it("can set the volume", function(){
		var source = new Source();
		source.volume.value = -8;
		expect(source.volume.value).to.be.closeTo(-8, 0.1);
		source.dispose();
	});

	it("can mute and unmute the source", function(){
		var source = new Source();
		source.volume.value = -8;
		source.mute = true;
		expect(source.mute).to.be.true;
		expect(source.volume.value).to.equal(-Infinity);
		source.mute = false;
		//returns the volume to what it was
		expect(source.volume.value).to.be.closeTo(-8, 0.1);
		source.dispose();
	});

	it("can get and set values with an object", function(){
		var source = new Source();
		source.set("volume", -10);
		expect(source.get().volume).to.be.closeTo(-10, 0.1);
		source.dispose();
	});

	it("is initally stopped", function(){
		var source = new Source();
		expect(source.state).to.equal("stopped");
		source.dispose();
	});

	it("cannot be scheduled to stop/start twice in a row", function(){
		var source = new Source();
		source.start(0).start(1);
		source.stop(2).stop(3);
		source.dispose();
	});

	it("has an output", function(){
		var source = new Source();
		source.connect(Test);
		source.dispose();
	});

	it("can be scheduled with multiple starts/stops", function(){
		return Offline(function(){
			var source = new Source();
			source.start(0).stop(0.5).start(0.75).stop(1).start(1.25).stop(1.5);
			expect(source._state.getValueAtTime(0)).to.equal("started");
			expect(source._state.getValueAtTime(0.5)).to.equal("stopped");
			expect(source._state.getValueAtTime(0.8)).to.equal("started");
			expect(source._state.getValueAtTime(1)).to.equal("stopped");
			expect(source._state.getValueAtTime(1.25)).to.equal("started");
			expect(source._state.getValueAtTime(1.6)).to.equal("stopped");
			source.dispose();
		});
	});

	if (Supports.ONLINE_TESTING){

		it("clamps start time to the currentTime", function(){
			var source = new Source();
			source.start(0);
			var currentTime = source.context.currentTime;
			expect(source._state.getValueAtTime(0)).to.equal("stopped");
			expect(source._state.getValueAtTime(currentTime)).to.equal("started");
			source.dispose();
		});
	
		it("clamps stop time to the currentTime", function(done){
			var source = new Source();
			source.start(0);
			var currentTime = source.context.currentTime;
			expect(source._state.getValueAtTime(0)).to.equal("stopped");
			expect(source._state.getValueAtTime(currentTime)).to.equal("started");
			setTimeout(function(){
				currentTime = source.context.currentTime;
				source.stop(0);
				expect(source._state.getValueAtTime(currentTime+0.01)).to.equal("stopped");
				source.dispose();
				done();
			}, 100);
		});
	}

	it("correctly returns the scheduled play state", function(){
		return Offline(function(){
			var source = new Source();
			expect(source.state).to.equal("stopped");
			source.start(0).stop(0.5);

			return function(time){
				if (time >= 0 && time < 0.5){
					expect(source.state).to.equal("started");
				} else if (time > 0.5){
					expect(source.state).to.equal("stopped");
				}
			};
		}, 0.6);
	});

	context("sync", function(){

		it("can sync its start to the Transport", function(){
			return Offline(function(Transport){
				var source = new Source();
				source.sync().start(0);
				expect(source.state).to.equal("stopped");
				Transport.start(Tone.now());
				expect(source.state).to.equal("started");
				source.dispose();
				Transport.stop();
			});
		});

		it("can unsync after it was synced", function(){
			return Offline(function(Transport){
				var source = new Source();
				source.sync().start(0);
				source.unsync();
				Transport.start();
				expect(source.state).to.equal("stopped");
			});
		});

		it("can sync its stop to the Transport", function(){
			return Offline(function(Transport){
				var source = new Source();
				source.sync().start(0);
				expect(source.state).to.equal("stopped");
				Transport.start(0).stop(0.4);
				expect(source.state).to.equal("started");

				return function(time){
					if (time > 0.4){
						expect(source.state).to.equal("stopped");
					}
				};
			}, 0.5);
		});

		it("can schedule multiple starts/stops", function(){
			return Offline(function(Transport){
				var source = new Source();
				source.sync().start(0.1).stop(0.2).start(0.3);
				Transport.start(0).stop(0.4);
				expect(source.state).to.equal("stopped");

				return function(time){
					if (time > 0.1 && time < 0.19){
						expect(source.state).to.equal("started");
					} else if (time > 0.2 && time < 0.29){
						expect(source.state).to.equal("stopped");
					} else if (time > 0.3 && time < 0.39){
						expect(source.state).to.equal("started");
					} else if (time > 0.4){
						expect(source.state).to.equal("stopped");
					}
				};
			}, 0.6);
		});

		it("has correct offset when the transport is started with an offset", function(){
			return Offline(function(Transport){
				var source = new Source();
				source.sync().start(0.3).stop(0.4);
				Transport.start(0, 0.1);
				expect(source.state).to.equal("stopped");

				return function(sample, time){
					if (time > 0.21 && time < 0.29){
						expect(source.state).to.equal("started");
					} else if (time > 0.3){
						expect(source.state).to.equal("stopped");
					}
				};
			}, 0.5);
		});

		it("can start with an offset after the start time of the source", function(){
			return Offline(function(Transport){
				var source = new Source();
				source.sync().start(0);
				Transport.start(0, 0.1);
				expect(source.state).to.equal("started");
				source.dispose();
			}, 0.1);
		});

		it("can sync its start to the Transport after a delay", function(){
			return Offline(function(Transport){
				var source = new Source();
				source.sync().start(0.3);
				Transport.start(0).stop(0.4);
				expect(source.state).to.equal("stopped");

				return function(time){
					if (time > 0.3 && time < 0.39){
						expect(source.state).to.equal("started");
					} else if (time > 0.4){
						expect(source.state).to.equal("stopped");
					}
				};
			}, 0.6);
		});

		it("correct state when the Transport position is changed", function(){
			return Offline(function(Transport){
				var source = new Source();
				source.sync().start(0.3).stop(0.4);
				Transport.start(0).stop(0.4);
				expect(source.state).to.equal("stopped");
				Transport.seconds = 0.305;
				expect(source.state).to.equal("started");
				Transport.seconds = 0.405;
				expect(source.state).to.equal("stopped");
			}, 0.1);
		});

		it("gives the correct offset on time on start/stop events", function(){
			return Offline(function(Transport){
				var source = new Source();
				source._start = function(time, offset){
					expect(time).to.be.closeTo(0.4, 0.05);
					expect(offset).to.be.closeTo(0.1, 0.05);
				};

				source._stop = function(time){
					expect(time).to.be.closeTo(0.5, 0.05);
				};

				source.sync().start(0.2, 0.1).stop(0.3);
				Transport.start(0.2);
			}, 0.7);
		});

		it("gives the correct offset on time on start/stop events invoked with an Transport offset", function(){
			return Offline(function(Transport){
				var source = new Source();
				source._start = function(time, offset){
					expect(time).to.be.closeTo(0.3, 0.05);
					expect(offset).to.be.closeTo(0.1, 0.05);
				};

				source._stop = function(time){
					expect(time).to.be.closeTo(0.4, 0.05);
				};

				source.sync().start(0.2, 0.1).stop(0.3);
				Transport.start(0.2, 0.1);
			}, 0.7);
		});

		it("gives the correct offset on time on start/stop events invoked with an Transport offset that's in the middle of the event", function(){
			return Offline(function(Transport){
				var source = new Source();
				source._start = function(time, offset){
					expect(time).to.be.closeTo(0.2, 0.05);
					expect(offset).to.be.closeTo(0.15, 0.05);
				};

				source._stop = function(time){
					expect(time).to.be.closeTo(0.25, 0.05);
				};

				source.sync().start(0.2, 0.1).stop(0.3);

				Transport.start(0.2, 0.25);

			}, 0.7);
		});

		it("gives the correct duration when invoked with an Transport offset that's in the middle of the event", function(){
			return Offline(function(){
				var source = new Source();
				source._start = function(time, offset, duration){
					expect(time).to.be.closeTo(0, 0.05);
					expect(offset).to.be.closeTo(0.2, 0.05);
					expect(duration).to.be.closeTo(0.3, 0.05);
				};

				source._stop = function(time){
					expect(time).to.be.closeTo(0.1, 0.05);
				};

				source.sync().start(0.2, 0.1, 0.4).stop(0.4);
				Transport.start(0, 0.3);
			}, 0.7);
		});

		it("stops at the right time when Transport.stop is invoked before the scheduled stop", function(){
			return Offline(function(Transport){
				var source = new Source();

				source._stop = function(time){
					expect(time).to.be.closeTo(0.3, 0.05);
				};

				source.sync().start(0.2).stop(0.4);
				Transport.start(0).stop(0.3);
			}, 0.7);
		});

		it("invokes the right methods and offsets when the transport is seeked", function(){
			var invoked = false;
			return Offline(function(Transport){
				var source = new Source();

				var seeked = false;
				source._start = function(time, offset){
					if (seeked){
						invoked = true;
						expect(time).to.be.closeTo(0.1, 0.05);
						expect(offset).to.be.closeTo(0.15, 0.05);
					} else {
						expect(time).to.be.closeTo(0, 0.05);
						expect(offset).to.be.closeTo(0.1, 0.05);
					}
				};

				source._stop = function(time){
					//invokes the stop and restarts it
					expect(time).to.be.closeTo(0.1, 0.05);
				};

				source.sync().start(0.2);
				Transport.start(0, 0.3);

				return Test.atTime(0.1, function(){
					seeked = true;
					Transport.seconds = 0.35;
				});
			}, 0.7).then(function(){
				expect(invoked).to.be.true;
			});
		});
	});
});

