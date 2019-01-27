import BasicTests from "helper/Basic";
import BufferSource from "Tone/source/BufferSource";
import Offline from "helper/Offline";
import Buffer from "Tone/core/Buffer";
import Meter from "helper/Meter";
import Tone from "Tone/core/Tone";
import CompareToFile from "helper/CompareToFile";
import Supports from "helper/Supports";
import Test from "helper/Test";

describe("BufferSource", function(){

	var buffer = new Buffer();

	var ones = new Float32Array(buffer.context.sampleRate * 0.5);
	ones.forEach(function(sample, index){
		ones[index] = 1;
	});
	var onesBuffer = Buffer.fromArray(ones);

	beforeEach(function(done){
		buffer.load("./audio/sine.wav", function(){
			done();
		});
	});

	//run the common tests
	BasicTests(BufferSource, buffer);

	it("matches a file", function(){
		return CompareToFile(function(){
			var source = new BufferSource(buffer).toMaster();
			source.start(0).stop(0.2);
		}, "bufferSource.wav");
	});

	context("Constructor", function(){

		it("can be constructed with a Tone.Buffer", function(){
			var source = new BufferSource(buffer);
			expect(source.buffer.get()).to.equal(buffer.get());
			source.dispose();
		});

		it("can be constructed with an AudioBuffer", function(){
			var source = new BufferSource(buffer.get());
			expect(source.buffer.get()).to.equal(buffer.get());
			source.dispose();
		});

		it("can be created with an options object", function(){
			var source = new BufferSource({
				"buffer" : buffer,
				"loop" : true,
				"loopEnd" : 0.2,
				"loopStart" : 0.1,
				"playbackRate" : 0.5
			});
			expect(source.loop).to.equal(true);
			expect(source.loopEnd).to.equal(0.2);
			expect(source.loopStart).to.equal(0.1);
			expect(source.playbackRate.value).to.equal(0.5);
			source.dispose();
		});

		it("can be constructed with no arguments", function(){
			var source = new BufferSource();
			source.dispose();
		});

		it("can set the buffer after construction", function(){
			var source = new BufferSource();
			expect(source.buffer.loaded).to.be.false;
			source.buffer = buffer;
			expect(source.buffer.loaded).to.be.true;
			source.dispose();
		});

		it("can be constructed with a url and onload", function(done){
			var source = new BufferSource("./audio/short_sine.wav", function(){
				expect(source.buffer.loaded).to.be.true;
				source.dispose();
				done();
			});
		});

		it("won't start or stop if there is no buffer", function(){
			var source = new BufferSource();
			expect(function(){
				source.start();
			}).to.throw(Error);
			expect(function(){
				source.stop();
			}).to.throw(Error);
			source.dispose();
		});
	});

	context("Looping", function(){

		beforeEach(function(done){
			buffer.load("./audio/short_sine.wav", function(){
				done();
			});
		});

		it("can be set to loop", function(){
			var player = new BufferSource();
			player.loop = true;
			expect(player.loop).to.be.true;
			player.dispose();
		});

		it("loops the audio", function(){
			return Offline(function(){
				var player = new BufferSource(buffer);
				player.loop = true;
				player.toMaster();
				player.start(0);
			}, buffer.duration * 2).then(function(buff){
				expect(buff.getRmsAtTime(0)).to.be.above(0);
				expect(buff.getRmsAtTime(buffer.duration * 0.5)).to.be.above(0);
				expect(buff.getRmsAtTime(buffer.duration)).to.be.above(0);
				expect(buff.getRmsAtTime(buffer.duration * 1.5)).to.be.above(0);
			});
		});

		it("loops the audio when loop is set after 'start'", function(){
			return Offline(function(){
				var player = new BufferSource(buffer);
				player.start(0);
				player.loop = true;
				player.toMaster();
			}, buffer.duration * 2).then(function(buff){
				expect(buff.getRmsAtTime(0)).to.be.above(0);
				expect(buff.getRmsAtTime(buffer.duration * 0.5)).to.be.above(0);
				expect(buff.getRmsAtTime(buffer.duration)).to.be.above(0);
				expect(buff.getRmsAtTime(buffer.duration * 1.5)).to.be.above(0);
			});
		});

		it("unloops the audio when loop is set after 'start'", function(){
			return Offline(function(){
				var player = new BufferSource(buffer);
				player.loop = true;
				player.start(0);
				player.loop = false;
				player.toMaster();
			}, buffer.duration * 2).then(function(buff){
				expect(buff.getRmsAtTime(0)).to.be.above(0);
				expect(buff.getRmsAtTime(buffer.duration * 0.5)).to.be.above(0);
				expect(buff.getRmsAtTime(buffer.duration)).to.equal(0);
				expect(buff.getRmsAtTime(buffer.duration * 1.5)).to.equal(0);
			});
		});

		it("loops the audio for the specific duration", function(){
			var playDur = buffer.duration * 1.5;
			return Meter(function(){
				var player = new BufferSource(buffer);
				player.loop = true;
				player.toMaster();
				player.start(0, 0, playDur);
			}, buffer.duration * 2).then(function(buff){
				buff.forEach(function(val, time){
					if (time < (playDur - 0.01)){
						expect(val).to.be.greaterThan(0);
					} else if (time > playDur){
						expect(val).to.equal(0);
					}
				});
			});
		});

		it("starts at the loop start offset if looping", function(){
			var offsetTime = 0.1;
			var offsetSample = buffer.toArray()[Math.floor(offsetTime * Tone.context.sampleRate)];
			return Offline(function(){
				var player = new BufferSource(buffer).toMaster();
				player.loop = true;
				player.loopStart = offsetTime;
				player.start(0);
			}, 0.05).then(function(buffer){
				expect(buffer.toArray()[0]).to.equal(offsetSample);
			});
		});

		it("the offset is modulo the loopDuration", function(){
			var testSample = buffer.toArray()[Math.floor(0.05 * buffer.context.sampleRate)];
			return Offline(function(){
				var player = new BufferSource(buffer).toMaster();
				player.loop = true;
				player.loopStart = 0;
				player.loopEnd = 0.1;
				player.start(0, 0.35);
			}, 0.05).then(function(buffer){
				expect(buffer.toArray()[0]).to.be.closeTo(testSample, 1e-4);
			});
		});

	});

	context("Get/Set", function(){

		it("can be set with an options object", function(){
			var player = new BufferSource();
			expect(player.loop).to.be.false;
			player.set({
				"loop" : true,
				"loopStart" : 0.4,
				"loopEnd" : 0.5
			});
			expect(player.loop).to.be.true;
			expect(player.loopStart).to.equal(0.4);
			expect(player.loopEnd).to.equal(0.5);
			player.dispose();
		});

		it("can get/set the playbackRate", function(){
			var player = new BufferSource();
			player.playbackRate.value = 0.5;
			expect(player.playbackRate.value).to.equal(0.5);
			player.dispose();
		});

	});

	context("onended", function(){

		beforeEach(function(done){
			buffer.load("./audio/sine.wav", function(){
				done();
			});
		});

		if (Supports.ONLINE_TESTING){
			it("schedules the onended callback in online context", function(done){
				var player = new BufferSource(buffer);
				player.start().stop("+0.1");
				player.onended = function(plyr){
					expect(plyr).to.equal(player);
					expect(player.state).to.equal("stopped");
					player.dispose();
					done();
				};
			});
		}

		it("schedules the onended callback when offline", function(done){

			Offline(function(){
				var player = new BufferSource(buffer).toMaster();
				player.start(0.2).stop(0.4);
				player.onended = function(){
					done();
				};
			}, 0.5);
		});

		it("invokes the onedned callback when a looped buffer is scheduled to stop", function(done){

			Offline(function(){
				var player = new BufferSource(buffer).toMaster();
				player.loop = true;
				player.start().stop(0.4);
				player.onended = function(){
					done();
				};
			}, 0.5);
		});

		/*it("schedules the onended callback when the buffer is done without scheduling stop", function(done){

			Offline(function(){
				var player = new BufferSource(buffer).toMaster();
				player.start(0);
				player.onended = function(){
					done();
				};
			}, buffer.duration * 1.1);
		});*/

	});

	context("state", function(){

		beforeEach(function(done){
			buffer.load("./audio/sine.wav", function(){
				done();
			});
		});

		it("reports the right state when scheduled to stop", function(){
			return Offline(function(){
				var player = new BufferSource(buffer).toMaster();
				player.start(0.2).stop(0.4);

				return function(time){
					if (time >= 0.2 && time < 0.4){
						expect(player.state).to.equal("started");
					} else {
						expect(player.state).to.equal("stopped");
					}
				};
			}, 0.5);
		});

		it("reports the right state when duration is passed into start method", function(){
			return Offline(function(){
				var player = new BufferSource(buffer).toMaster();
				player.start(0, 0, 0.1);

				return function(time){
					if (time >= 0 && time < 0.1){
						expect(player.state).to.equal("started");
					} else {
						expect(player.state).to.equal("stopped");
					}
				};
			}, 0.2);
		});
	});

	context("Start/Stop Scheduling", function(){

		beforeEach(function(done){
			buffer.load("./audio/sine.wav", function(){
				done();
			});
		});

		it("can play for a specific duration", function(){
			return Meter(function(){
				var player = new BufferSource(buffer).toMaster();
				player.start(0).stop(0.1);

				return function(time){
					if (time > 0.1){
						expect(player.state).to.equal("stopped");
					}
				};
			}, 0.4).then(function(rms){
				expect(rms.getValueAtTime(0)).to.be.gt(0);
				expect(rms.getValueAtTime(0.09)).to.be.gt(0);
				//after stop is scheduled
				expect(rms.getValueAtTime(0.11)).to.equal(0);
				expect(rms.getValueAtTime(0.3)).to.equal(0);
			});
		});

		it("can be scheduled to stop", function(){
			return Meter(function(){
				var player = new BufferSource(buffer).toMaster();
				player.start(0).stop(0.1);
			}, 0.6).then(function(rms){
				expect(rms.getValueAtTime(0.01)).to.be.gt(0);
				expect(rms.getValueAtTime(0.08)).to.be.gt(0);
				expect(rms.getValueAtTime(0.11)).to.equal(0);
			});
		});

		it("plays correctly when playbackRate is < 1", function(){
			return Meter(function(){
				var player = new BufferSource(buffer).toMaster();
				player.start(0);
				player.playbackRate.value = 0.75;
			}, buffer.duration * 1.3).then(function(rms){
				expect(rms.getValueAtTime(0.01)).to.be.gt(0);
				expect(rms.getValueAtTime(0.1)).to.be.gt(0);
				expect(rms.getValueAtTime(0.2)).to.be.gt(0);
				expect(rms.getValueAtTime(buffer.duration)).to.be.gt(0);
			});
		});

		it("plays correctly when playbackRate is > 1", function(){
			return Meter(function(){
				var player = new BufferSource(buffer).toMaster();
				player.start(0);
				player.playbackRate.value = 2;
			}, buffer.duration).then(function(rms){
				expect(rms.getValueAtTime(0.03)).to.be.gt(0);
				expect(rms.getValueAtTime(buffer.duration * 0.45)).to.be.gt(0);
				expect(rms.getValueAtTime(buffer.duration * 0.5)).to.closeTo(0, 0.01);
				expect(rms.getValueAtTime(buffer.duration * 0.7)).to.closeTo(0, 0.01);
			});
		});

		it("can play for a specific duration passed in the 'start' method", function(){
			return Meter(function(){
				var player = new BufferSource(buffer).toMaster();
				player.start(0, 0, 0.1);

				return function(time){
					if (time > 0.1){
						expect(player.state).to.equal("stopped");
					}
				};
			}, 0.4).then(function(rms){
				expect(rms.getValueAtTime(0)).to.be.gt(0);
				expect(rms.getValueAtTime(0.09)).to.be.gt(0);
				//after stop is scheduled
				expect(rms.getValueAtTime(0.11)).to.equal(0);
				expect(rms.getValueAtTime(0.3)).to.equal(0);
			});
		});

		it("can start at an offset", function(){
			var offsetTime = 0.1;
			var offsetSample = buffer.toArray()[Math.floor(offsetTime * Tone.context.sampleRate)];
			return Offline(function(){
				var player = new BufferSource(buffer).toMaster();
				player.start(0, offsetTime);
			}, 0.05).then(function(buffer){
				expect(buffer.toArray()[0]).to.equal(offsetSample);
			});
		});

		it("can end start ramp early", function(){
			return Meter(function(){
				var player = new BufferSource(buffer);
				player.fadeIn = 0.2;
				player.toMaster();
				player.start(0).stop(0.1);
			}, 0.2).then(function(rms){
				expect(rms.getValueAtTime(0.0)).to.be.gt(0);
				expect(rms.getValueAtTime(0.05)).to.be.gt(0);
				expect(rms.getValueAtTime(0.09)).to.be.gt(0);
				expect(rms.getValueAtTime(0.1)).to.equal(0);
				expect(rms.getValueAtTime(0.15)).to.equal(0);
			});
		});

		it("can end start ramp with a ramp", function(){
			return Meter(function(){
				var player = new BufferSource(onesBuffer);
				player.fadeIn = 0.2;
				player.fadeOut = 0.1;
				player.loop = true;
				player.toMaster();
				player.start(0).stop(0.1);
			}, 0.3).then(function(rms){
				//fade in
				expect(rms.getValueAtTime(0.01)).to.be.gt(0);
				expect(rms.getValueAtTime(0.05)).to.be.gt(0);
				//fade out
				expect(rms.getValueAtTime(0.1)).to.be.gt(0);
				expect(rms.getValueAtTime(0.15)).to.be.gt(0);
				expect(rms.getValueAtTime(0.19)).to.be.gt(0);
				//end of ramp
				expect(rms.getValueAtTime(0.21)).to.equal(0);
			});
		});

		it("can be scheduled to stop with a ramp", function(){
			return Meter(function(){
				var player = new BufferSource(buffer).toMaster();
				player.start(0).stop(0.1, 0.05);
			}, 0.6).then(function(rms){
				rms.forEach(function(level, time){
					if (time > 0.01 && time < 0.09){
						expect(level).to.be.gt(0);
					} else if (time > 0.1){
						expect(level).to.equal(0);
					}
				});
			});
		});

		it("fade is applied after the stop time", function(){
			return Offline(function(){
				var player = new BufferSource(onesBuffer).toMaster();
				player.fadeOut = 0.1;
				player.start(0).stop(0.2);
			}, 0.32).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.equal(1);
				expect(buffer.getValueAtTime(0.1)).to.equal(1);
				expect(buffer.getValueAtTime(0.2)).to.equal(1);
				expect(buffer.getValueAtTime(0.25)).to.be.closeTo(0.5, 0.01);
				expect(buffer.getValueAtTime(0.29)).to.be.closeTo(0.1, 0.01);
				expect(buffer.getValueAtTime(0.3)).to.be.closeTo(0, 0.01);
				expect(buffer.getValueAtTime(0.31)).to.equal(0);
			});
		});

		it("can fade with an exponential curve", function(){
			var player = new BufferSource(onesBuffer).toMaster();
			player.curve = "exponential";
			expect(player.curve).to.equal("exponential");
			player.dispose();
		});

		it("fades in and out exponentially", function(){
			return Offline(function(){
				var player = new BufferSource(onesBuffer).toMaster();
				player.curve = "exponential";
				player.fadeIn = 0.1;
				player.fadeOut = 0.1;
				player.start(0).stop(0.4);
			}, 0.51).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.equal(0);
				expect(buffer.getValueAtTime(0.05)).to.be.closeTo(0.93, 0.01);
				expect(buffer.getValueAtTime(0.1)).to.be.closeTo(1, 0.01);
				expect(buffer.getValueAtTime(0.4)).to.be.closeTo(1, 0.01);
				expect(buffer.getValueAtTime(0.45)).to.be.closeTo(0.06, 0.01);
				expect(buffer.getValueAtTime(0.5)).to.equal(0);
			});
		});

		it("can be scheduled to start at a lower gain", function(){
			return Offline(function(){
				var player = new BufferSource(buffer).toMaster();
				player.start(0, 0, undefined, 0.5);
			}, 0.5).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.lte(0.5);
				expect(buffer.getValueAtTime(0.1)).to.be.lte(0.5);
				expect(buffer.getValueAtTime(0.2)).to.be.lte(0.5);
				expect(buffer.getValueAtTime(0.3)).to.be.lte(0.5);
				expect(buffer.getValueAtTime(0.4)).to.be.lte(0.5);
			});
		});

		it("cannot be started more than once", function(){
			var player = new BufferSource(buffer);
			player.start();
			expect(function(){
				player.start();
			}).to.throw(Error);
			player.dispose();
		});

		it("stops playing if invoked with 'stop' at a sooner time", function(){
			return Offline(function(){
				var player = new BufferSource(buffer);
				player.toMaster();
				player.start(0).stop(0.1).stop(0.05);
			}, 0.3).then(function(buffer){
				expect(buffer.getLastSoundTime()).to.be.closeTo(0.05, 0.02);
			});
		});

		it("does not play if the stop time is at the start time", function(){
			return Offline(function(){
				var player = new BufferSource(buffer);
				player.toMaster();
				player.start(0).stop(0);
			}, 0.3).then(function(buffer){
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("does not play if the stop time is at before start time", function(){
			return Offline(function(){
				var player = new BufferSource(buffer);
				player.toMaster();
				player.start(0.1).stop(0);
			}, 0.3).then(function(buffer){
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("stops playing at the last scheduled stop time", function(){
			return Offline(function(){
				var player = new BufferSource(buffer);
				player.toMaster();
				player.start(0).stop(0.1).stop(0.2);
			}, 0.3).then(function(buffer){
				expect(buffer.getLastSoundTime()).to.be.closeTo(0.2, 0.02);
			});
		});

	});

});

