define(["helper/Basic", "Tone/source/BufferSource", "helper/Offline",
	"Tone/core/Buffer", "helper/Meter", "Tone/core/Tone"],
function(BasicTests, BufferSource, Offline, Buffer, Meter, Tone){

	if (window.__karma__){
		Buffer.baseUrl = "/base/test/";
	}

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

			/*it("schedules the onended callback in online context", function(done){
				var player = new BufferSource(buffer);
				player.start().stop("+0.1");

				var wasCalled = false;
				player.onended = function(plyr){
					expect(plyr).to.equal(player);
					expect(player.state).to.equal("stopped");
					player.dispose();
					done();
				};
			});*/

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

			it("schedules the onended callback when the buffer is done without scheduling stop", function(done){

				Offline(function(){
					var player = new BufferSource(buffer).toMaster();
					player.start(0);
					player.onended = function(){
						done();
					};
				}, buffer.duration * 1.1);
			});

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
				}, 0.4).then(function(buffer){
					buffer.forEach(function(level, time){
						if (time >= 0 && time < 0.09){
							expect(level).to.be.greaterThan(0);
						} else if (time > 0.1){
							expect(level).to.equal(0);
						}
					});
				});
			});

			it("plays correctly when playbackRate is < 1", function(){
				return Meter(function(){
					var player = new BufferSource(buffer).toMaster();
					player.start(0);
					player.playbackRate.value = 0.75;
				}, buffer.duration * 1.3).then(function(rms){
					rms.forEach(function(level, time){
						if (time > 0.01){
							expect(level).to.be.gt(0);
						}
					});
				});
			});

			it("plays correctly when playbackRate is > 1", function(){
				return Meter(function(){
					var player = new BufferSource(buffer).toMaster();
					player.start(0);
					player.playbackRate.value = 2;
				}, buffer.duration).then(function(rms){
					rms.forEach(function(level, time){
						if (time > 0.02 && time < buffer.duration * 0.45){
							expect(level).to.be.gt(0);
						} else if (time > buffer.duration * 0.5){
							expect(level).to.closeTo(0, 0.01);
						}
					});
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
				}, 0.4).then(function(buffer){
					buffer.forEach(function(level, time){
						if (time >= 0 && time < 0.09){
							expect(level).to.be.greaterThan(0);
						} else if (time > 0.11){
							expect(level).to.equal(0);
						}
					});
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

			it("won't play for longer than the buffer's duration minus the offset", function(){
				return Offline(function(){
					var player = new BufferSource(buffer).toMaster();
					player.start(0, 0.1, buffer.duration);
					return function(time){
						if (time > buffer.duration - 0.1){
							expect(player.state).to.equal("stopped");
						}
					};
				}, buffer.duration);
			});

			it("does not play for shorter than the ramp in time", function(){
				return Meter(function(){
					var player = new BufferSource(buffer);
					player.toMaster();
					player.start(0, 0, undefined, 1, 0.1).stop(0.05);
				}, 0.2).then(function(buffer){
					buffer.forEach(function(level, time){
						if (time >= 0 && time < 0.09){
							expect(level).to.be.greaterThan(0);
						} else if (time > 0.1){
							expect(level).to.equal(0);
						}
					});
				});
			});

			it("can be scheduled to stop", function(){
				return Meter(function(){
					var player = new BufferSource(buffer).toMaster();
					player.start(0).stop(0.1);
				}, 0.6).then(function(rms){
					rms.forEach(function(level, time){
						if (time > 0.01 && time < 0.09){
							expect(level).to.be.gt(0);
						} else if (time > 0.11){
							expect(level).to.equal(0);
						}
					});
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

			it("fades from the end when passed into the stop call", function(){
				return Offline(function(){
					var player = new BufferSource(onesBuffer).toMaster();
					player.start(0).stop(0.2, 0.1);
				}, 0.3).then(function(buffer){
					buffer.forEach(function(sample, time){
						if (time < 0.101){
							expect(sample).to.be.closeTo(1, 0.01);
						} else if (time < 0.2){
							expect(sample).to.be.lessThan(1);
						} else {
							expect(sample).to.equal(0);
						}
					});
				});
			});

			it("cant fade for shorter than the fade in time", function(){
				return Offline(function(){
					var player = new BufferSource(onesBuffer).toMaster();
					player.fadeIn = 0.15;
					player.start(0).stop(0.2, 0.1);
				}, 0.3).then(function(buffer){
					buffer.forEach(function(sample, time){
						if (time < 0.14){
							expect(sample).to.be.lessThan(1);
						} else if (Math.abs(time - 0.15) < 1e-4){
							expect(sample).to.be.closeTo(1, 0.05);
						} else if (time < 0.2){
							expect(sample).to.be.lessThan(1);
						}
					});
				});
			});

			it("the fade out can shorten to fit the duration of the sample", function(){
				return Offline(function(){
					var player = new BufferSource(onesBuffer).toMaster();
					player.fadeOut = 1;
					player.start(0).stop(0.5);
				}, 0.51).then(function(buffer){
					expect(buffer.getValueAtTime(0)).to.equal(1);
					expect(buffer.getValueAtTime(0.25)).to.be.closeTo(0.5, 0.01);
					expect(buffer.getValueAtTime(0.5)).to.be.closeTo(0, 0.01);
				});
			});

			it("the fade out will only start after the fade in", function(){
				return Offline(function(){
					var player = new BufferSource(onesBuffer).toMaster();
					player.fadeIn = 0.1;
					player.fadeOut = 1;
					player.start(0).stop(0.5);
				}, 0.51).then(function(buffer){
					expect(buffer.getValueAtTime(0)).to.equal(0);
					expect(buffer.getValueAtTime(0.05)).to.be.closeTo(0.5, 0.01);
					expect(buffer.getValueAtTime(0.1)).to.be.closeTo(1, 0.01);
					expect(buffer.getValueAtTime(0.3)).to.be.closeTo(0.5, 0.01);
					expect(buffer.getValueAtTime(0.5)).to.be.closeTo(0, 0.01);
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
					player.fadeOut = 1;
					player.start(0).stop(0.5);
				}, 0.51).then(function(buffer){
					expect(buffer.getValueAtTime(0)).to.equal(0);
					expect(buffer.getValueAtTime(0.05)).to.be.closeTo(0.93, 0.01);
					expect(buffer.getValueAtTime(0.1)).to.be.closeTo(1, 0.01);
					expect(buffer.getValueAtTime(0.3)).to.be.closeTo(0.05, 0.01);
					expect(buffer.getValueAtTime(0.5)).to.be.closeTo(0, 0.01);
				});
			});

			it("can be scheduled to start at a lower gain", function(){
				return Offline(function(){
					var player = new BufferSource(buffer).toMaster();
					player.start(0, 0, undefined, 0.5);
				}, 0.5).then(function(buffer){
					buffer.forEach(function(sample){
						expect(sample).to.be.lte(0.5);
					});
				});
			});

			it("can be scheduled to start with a ramp", function(){
				return Offline(function(){
					var player = new BufferSource(buffer).toMaster();
					player.start(0, 0, undefined, 1, 0.1);
				}, 0.5).then(function(buffer){
					buffer.forEach(function(sample, time){
						if (time < 0.1){
							expect(sample).to.be.lte(time * 10);
						}
					});
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

			it("stops playing at the earlier time if invoked with 'stop' at a later time", function(){
				return Offline(function(){
					var player = new BufferSource(buffer);
					player.toMaster();
					player.start(0).stop(0.1).stop(0.2);
				}, 0.3).then(function(buffer){
					expect(buffer.getLastSoundTime()).to.be.closeTo(0.1, 0.02);
				});
			});
		});

	});
});
