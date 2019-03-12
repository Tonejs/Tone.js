import BasicTests from "helper/Basic";
import Player from "Tone/source/Player";
import Offline from "helper/Offline";
import SourceTests from "helper/SourceTests";
import Buffer from "Tone/core/Buffer";
import Meter from "helper/Meter";
import Test from "helper/Test";
import Tone from "Tone/core/Tone";
import CompareToFile from "helper/CompareToFile";

describe("Player", function(){

	var buffer = new Buffer();

	beforeEach(function(done){
		buffer.load("./audio/sine.wav", function(){
			done();
		});
	});

	//run the common tests
	BasicTests(Player, buffer);
	SourceTests(Player, buffer);

	it("matches a file", function(){
		return CompareToFile(function(){
			var player = new Player(buffer).toMaster();
			player.start(0.1).stop(0.2);
			player.playbackRate = 2;
		}, "player.wav", 0.005);
	});

	context("Constructor", function(){

		it("can be constructed with a Tone.Buffer", function(){
			var player = new Player(buffer);
			expect(player.buffer.get()).to.equal(buffer.get());
			player.dispose();
		});

		it("can be constructed with an AudioBuffer", function(){
			var player = new Player(buffer.get());
			expect(player.buffer.get()).to.equal(buffer.get());
			player.dispose();
		});

		it("can be constructed with an unloaded Tone.Buffer", function(done){
			var buffer = new Buffer("./audio/sine.wav");
			var player = new Player(buffer, function(){
				expect(player.buffer.get()).to.equal(buffer.get());
				player.dispose();
				done();
			});
		});
	});

	context("Loading", function(){

		it("loads a url which was passed in", function(done){
			var player = new Player("./audio/sine.wav", function(){
				expect(player.loaded).to.be.true;
				player.dispose();
				done();
			});
		});

		it("loads a url using the load method", function(done){
			var player = new Player();
			player.load("./audio/sine.wav", function(){
				expect(player._buffer).to.be.instanceof(Buffer);
				done();
			});
		});

		it("returns a promise", function(done){
			var player = new Player();
			var promise = player.load("./audio/sine.wav");
			expect(promise).to.be.instanceof(Promise);
			promise.then(function(){
				done();
			});
		});

		it("can be created with an options object", function(){
			var player = new Player({
				"url" : "./audio/sine.wav",
				"loop" : true
			});
			player.dispose();
		});

		it("can autostart after loading", function(done){
			var player = new Player({
				"url" : "./audio/sine.wav",
				"autostart" : true,
				"onload" : function(){
					setTimeout(function(){
						expect(player.state).to.be.equal("started");
						done();
					}, 10);
				}
			});
		});

	});

	context("Reverse", function(){

		it("can be played in reverse", function(){
			var audioBuffer = buffer.get().getChannelData(0);
			var jump = 441;
			var lastSample = audioBuffer[audioBuffer.length - 1 - jump];
			return Offline(function(){
				var player = new Player({
					url : buffer.get(),
					reverse : true
				}).toMaster();
				player.start(0);
			}).then(function(buffer){
				var firstSample = buffer.toArray()[jump];
				expect(firstSample).to.equal(lastSample);
			});
		});

	});

	context("Looping", function(){

		beforeEach(function(done){
			buffer.load("./audio/short_sine.wav", function(){
				done();
			});
		});

		it("can be set to loop", function(){
			var player = new Player();
			player.loop = true;
			expect(player.loop).to.be.true;
			player.dispose();
		});

		it("can set the loop points", function(){
			var player = new Player();
			player.loopStart = 0.4;
			expect(player.loopStart).to.equal(0.4);
			player.loopEnd = 0.5;
			expect(player.loopEnd).to.equal(0.5);
			player.setLoopPoints(0, 0.2);
			expect(player.loopStart).to.equal(0);
			expect(player.loopEnd).to.equal(0.2);
			player.dispose();
		});

		it("loops the audio", function(){
			return Meter(function(){
				var player = new Player(buffer);
				player.loop = true;
				player.toMaster();
				player.start(0);
			}, buffer.duration * 1.5).then(function(rms){
				rms.forEach(function(level){
					expect(level).to.be.above(0);
				});
			});
		});

		it("loops the audio when loop is set after start", function(){
			return Meter(function(){
				var player = new Player(buffer);
				player.toMaster();
				player.start(0);
				player.loop = true;
			}, buffer.duration * 1.5).then(function(rms){
				rms.forEach(function(level){
					expect(level).to.be.above(0);
				});
			});
		});

		it("offset is the loopStart when set to loop", function(){
			var testSample = buffer.toArray()[Math.floor(0.1 * buffer.context.sampleRate)];
			return Offline(function(){
				var player = new Player(buffer);
				player.loopStart = 0.1;
				player.loop = true;
				player.toMaster();
				player.start(0);
			}, 0.05).then(function(buffer){
				expect(buffer.toArray()[0]).to.equal(testSample);
			});
		});

		it("loops the audio for the specific duration", function(){
			var playDur = buffer.duration * 1.5;
			return Meter(function(){
				var player = new Player(buffer);
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

		it("correctly compensates if the offset is greater than the loopEnd", function(){
			return Offline(function(){
				//make a ramp between 0-1
				var ramp = new Float32Array(Math.floor(Tone.context.sampleRate * 0.3));
				for (var i = 0; i < ramp.length; i++){
					ramp[i] = (i / (ramp.length)) * 0.3;
				}
				var buff = Buffer.fromArray(ramp);
				var player = new Player(buff).toMaster();
				player.loopStart = 0.1;
				player.loopEnd = 0.2;
				player.loop = true;
				player.start(0, 0.35);
			}, 0.05).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time < 0.04){
						expect(sample).to.be.within(0.15, 0.2);
					} else if (time > 0.05 && time < 0.09){
						expect(sample).to.be.within(0.1, 0.15);
					}
				});
			});
		});

	});

	context("Get/Set", function(){

		it("can be set with an options object", function(){
			var player = new Player();
			expect(player.loop).to.be.false;
			player.set({
				"loop" : true,
				"loopStart" : 0.4,
				"fadeIn" : 0.1,
				"fadeOut" : 0.2,
			});
			expect(player.loop).to.be.true;
			expect(player.loopStart).to.equal(0.4);
			expect(player.fadeIn).to.equal(0.1);
			expect(player.fadeOut).to.equal(0.2);
			player.dispose();
		});

		it("can set attributes after player is started", function(){
			var player = new Player(buffer);
			expect(player.loop).to.be.false;
			player.start();
			player.set({
				"loopStart" : 0.2,
				"loopEnd" : 0.3,
				"loop" : true,
				"playbackRate" : 0.9
			});
			expect(player.loop).to.be.true;
			expect(player.loopStart).to.equal(0.2);
			expect(player.loopEnd).to.equal(0.3);
			expect(player.playbackRate).to.equal(0.9);
			player.dispose();
		});

		it("can get an options object", function(){
			var player = new Player({
				"url" : "./audio/sine.wav",
				"loopStart" : 0.2,
				"loopEnd" : 0.3,
				"loop" : true,
				"reverse" : true
			});
			expect(player.get().loopStart).to.equal(0.2);
			expect(player.get().loopEnd).to.equal(0.3);
			expect(player.get().loop).to.be.true;
			expect(player.get().reverse).to.be.true;
			player.dispose();
		});

		it("can get/set the playbackRate", function(){
			var player = new Player();
			player.playbackRate = 0.5;
			expect(player.playbackRate).to.equal(0.5);
			player.dispose();
		});

	});

	context("Start Scheduling", function(){

		it("can be start with an offset", function(){
			var testSample = buffer.toArray()[Math.floor(0.1 * buffer.context.sampleRate)];
			return Offline(function(){
				var player = new Player(buffer.get());
				player.toMaster();
				player.start(0, 0.1);
			}).then(function(buffer){
				expect(buffer.toArray()[0]).to.equal(testSample);
			});
		});

		it("is stopped and restarted if retrigger=false", function(){
			return Offline(function(){
				//make a ramp between 0-1
				var ramp = new Float32Array(Math.floor(Tone.context.sampleRate * 0.3));
				for (var i = 0; i < ramp.length; i++){
					ramp[i] = (i / (ramp.length-1));
				}
				var buff = new Buffer().fromArray(ramp);
				var player = new Player(buff).toMaster();
				player.retrigger = false;
				player.start(0);
				player.start(0.1);
			}, 0.31).then(function(buffer){
				expect(buffer.max()).to.be.lessThan(1);
			});
		});

		it("only seeks if player is started", function(){
			return Offline(function(){
				var player = new Player(buffer).toMaster();
				player.seek(0.2, 0.01);
			}, 0.05).then(function(buffer){
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("can seek to a position at the given time", function(){
			return Offline(function(){
				var ramp = new Float32Array(Math.floor(Tone.context.sampleRate * 0.3));
				for (var i = 0; i < ramp.length; i++){
					ramp[i] = (i / (ramp.length)) * 0.3;
				}
				var buff = new Buffer().fromArray(ramp);
				var player = new Player(buff).toMaster();
				player.start(0);
				player.seek(0.2, 0.1);
			}, 0.3).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time < 0.09){
						expect(sample).to.be.within(0, 0.1);
					} else if (time > 0.1 && time < 0.19){
						expect(sample).to.be.within(0.2, 0.3);
					}
				});
			});
		});

		it("can be play for a specific duration", function(){
			return Offline(function(){
				var player = new Player(buffer);
				player.toMaster();
				player.start(0).stop(0.1);
				return function(time){
					Test.whenBetween(time, 0.1, Infinity, function(){
						expect(player.state).to.equal("stopped");
					});
					Test.whenBetween(time, 0, 0.1, function(){
						expect(player.state).to.equal("started");
					});
				};
			}, 0.3).then(function(buffer){
				buffer.forEach(function(sample){
					expect(sample).to.equal(0);
				}, 0.11, 0.15);
			});
		});

		it("stops playing if invoked with 'stop' at a sooner time", function(){
			return Offline(function(){
				var player = new Player(buffer);
				player.toMaster();
				player.start(0).stop(0.1).stop(0.05);
			}, 0.3).then(function(buffer){
				expect(buffer.getLastSoundTime()).to.be.closeTo(0.05, 0.02);
			});
		});

		it("stops playing if at the last scheduled 'stop' time", function(){
			return Offline(function(){
				var player = new Player(buffer);
				player.toMaster();
				player.start(0, 0, 0.05).start(0.1, 0, 0.05).start(0.2, 0, 0.05);
				player.stop(0.1);
			}, 0.3).then(function(buffer){
				expect(buffer.getLastSoundTime()).to.be.closeTo(0.1, 0.02);
			});
		});

		it("can retrigger multiple sources which all stop at the stop time", function(){
			return Offline(function(){
				var player = new Player(buffer);
				player.toMaster();
				player.loop = true;
				player.retrigger = true;
				player.start(0).start(0.1).start(0.2).stop(0.25);
			}, 0.4).then(function(buffer){
				expect(buffer.getLastSoundTime()).to.be.closeTo(0.25, 0.02);
			});
		});

		it("can be play for a specific duration passed in the 'start' method", function(){
			return Offline(function(){
				var player = new Player(buffer);
				player.toMaster();
				player.start(0, 0, 0.1);
				return function(time){
					Test.whenBetween(time, 0.1, Infinity, function(){
						expect(player.state).to.equal("stopped");
					});
					Test.whenBetween(time, 0, 0.1, function(){
						expect(player.state).to.equal("started");
					});
				};
			}, 0.3).then(function(buffer){
				expect(buffer.getLastSoundTime()).to.be.closeTo(0.1, 0.02);
			});
		});

		it("reports itself as stopped after a single iterations of the buffer", function(){
			return Offline(function(){
				var player = new Player(buffer).toMaster();
				player.start();

				return function(time){
					Test.whenBetween(time, buffer.duration, Infinity, function(){
						expect(player.state).to.equal("stopped");
					});
					Test.whenBetween(time, 0, buffer.duration, function(){
						expect(player.state).to.equal("started");
					});
				};
			}, buffer.duration * 1.1);
		});

		it("offsets correctly when started by the Transport", function(){
			var testSample = buffer.toArray()[Math.floor(0.13125 * buffer.context.sampleRate)];
			return Offline(function(Transport){
				var player = new Player(buffer).sync().start(0, 0.1).toMaster();
				Transport.start(0, 0.03125);
			}, 0.05).then(function(buffer){
				expect(buffer.toArray()[0]).to.equal(testSample);
			});
		});

		it("starts at the correct position when Transport is offset and playbackRate is not 1", function(){
			return Offline(function(Transport){
				//make a ramp between 0-1
				var ramp = new Float32Array(Math.floor(Tone.context.sampleRate * 0.3));
				for (var i = 0; i < ramp.length; i++){
					ramp[i] = (i / (ramp.length));
				}
				var buff = Buffer.fromArray(ramp);
				var player = new Player(buff).toMaster();
				player.playbackRate = 0.5;
				player.sync().start(0);
				//start halfway through
				Transport.start(0, 0.15);
			}, 0.05).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(0.25, 0.03);
			});
		});

		it("starts with an offset when synced and started after Transport is running", function(){
			return Offline(function(Transport){
				var ramp = new Float32Array(Math.floor(Tone.context.sampleRate * 0.3));
				for (var i = 0; i < ramp.length; i++){
					ramp[i] = (i / (ramp.length)) * 0.3;
				}
				var buff = new Buffer().fromArray(ramp);
				var player = new Player(buff).toMaster();
				Transport.start(0);
				return Test.atTime(0.1, function(){
					player.sync().start(0);
				});
			}, 0.3).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.equal(0);
				expect(buffer.getValueAtTime(0.05)).to.equal(0);
				expect(buffer.getValueAtTime(0.11)).to.be.closeTo(0.11, 0.01);
				expect(buffer.getValueAtTime(0.2)).to.be.closeTo(0.2, 0.01);
			});
		});

		it("can pass in an offset when synced and started after Transport is running", function(){
			return Offline(function(Transport){
				var ramp = new Float32Array(Math.floor(Tone.context.sampleRate * 0.3));
				for (var i = 0; i < ramp.length; i++){
					ramp[i] = (i / (ramp.length)) * 0.3;
				}
				var buff = new Buffer().fromArray(ramp);
				var player = new Player(buff).toMaster();
				player.loop = true;
				Transport.start(0);
				return Test.atTime(0.1, function(){
					player.sync().start(0, 0.1);
				});
			}, 0.3).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.equal(0);
				expect(buffer.getValueAtTime(0.05)).to.equal(0);
				expect(buffer.getValueAtTime(0.11)).to.be.closeTo(0.21, 0.01);
				expect(buffer.getValueAtTime(0.15)).to.be.closeTo(0.25, 0.01);
				expect(buffer.getValueAtTime(0.2)).to.be.closeTo(0.0, 0.01);
				expect(buffer.getValueAtTime(0.25)).to.be.closeTo(0.05, 0.01);
			});
		});

		it("fades in and out correctly", function(){
			var duration = 0.5;
			return Offline(function(){
				var onesArray = new Float32Array(buffer.context.sampleRate * duration);
				onesArray.forEach(function(sample, index){
					onesArray[index] = 1;
				});
				var onesBuffer = Buffer.fromArray(onesArray);
				var player = new Player({ "url" : onesBuffer, "fadeOut" : 0.1, "fadeIn" : 0.1 }).toMaster();
				player.start(0);
			}, 0.6).then(function(buffer){
				expect(buffer.getRmsAtTime(0)).to.be.closeTo(0, 0.1);
				expect(buffer.getRmsAtTime(0.05)).to.be.closeTo(0.5, 0.1);
				expect(buffer.getRmsAtTime(0.1)).to.be.closeTo(1, 0.1);
				duration -= 0.1;
				expect(buffer.getRmsAtTime(duration)).to.be.closeTo(1, 0.1);
				expect(buffer.getRmsAtTime(duration + 0.05)).to.be.closeTo(0.5, 0.1);
				expect(buffer.getRmsAtTime(duration + 0.1)).to.be.closeTo(0, 0.1);
			});
		});
	});
});

