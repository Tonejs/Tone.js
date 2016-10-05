define(["helper/Basic", "Tone/source/Player", "helper/Offline", 
	"helper/SourceTests", "Tone/core/Buffer", "helper/Meter", "helper/Offline2"], 
	function (BasicTests, Player, Offline, SourceTests, Buffer, Meter, Offline2) {

	if (window.__karma__){
		Buffer.baseUrl = "/base/test/";
	}

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

		context("Constructor", function(){

			it ("can be constructed with a Tone.Buffer", function(done){
				var player = new Player(buffer);
				expect(player.buffer.get()).to.equal(buffer.get());
				player.dispose();
				done();
			});

			it ("can be constructed with an AudioBuffer", function(done){
				var player = new Player(buffer.get());
				expect(player.buffer.get()).to.equal(buffer.get());
				player.dispose();
				done();
			});
		});

		context("Loading", function(){

			it("loads a url which was passed in", function(done){
				var player = new Player("./audio/sine.wav", function(){
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

			it("can be played in reverse", function(done){
				var player;
				var offline = new Offline();
				var audioBuffer = buffer.get().getChannelData(0);
				var lastSample = audioBuffer[audioBuffer.length - 1];
				offline.before(function(dest){
					player = new Player(buffer.get()).connect(dest);
					player.reverse = true;
					player.start(0);
				});
				offline.test(function(sample, time){
					if (time === 0){
						expect(sample).to.equal(lastSample);
					}
				});
				offline.after(function(){
					player.dispose();
					buffer.reverse = false;
					done();
				});
				offline.run();
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

			it("loops the audio", function(done){
				var player;
				var meter = new Meter(buffer.duration * 2);
				meter.before(function(dest){
					player = new Player(buffer);
					player.loop = true;
					player.connect(dest);
					player.start(0);
				});
				meter.test(function(sample, time){
					if (time > 0.01){
						expect(sample).to.be.above(0);
					}
				});
				meter.after(function(){
					player.dispose();
					done();
				});
				meter.run();
			});

		});

		context("Get/Set", function(){

			it("can be set with an options object", function(){
				var player = new Player();
				expect(player.loop).to.be.false;
				player.set({
					"loop" : true,
					"loopStart" : 0.4
				});
				expect(player.loop).to.be.true;
				expect(player.loopStart).to.equal(0.4);
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

			it("can be start with an offset", function(done){
				var player;
				var offline = new Offline(0.4, 1);
				var audioBuffer = buffer.get().getChannelData(0);
				var testSample = audioBuffer[Math.floor(0.1 * buffer.context.sampleRate)];
				offline.before(function(dest){
					player = new Player(buffer.get());
					player.connect(dest);
					player.start(0, 0.1);
				});
				offline.test(function(sample, time){
					if (time === 0){
						expect(sample).to.equal(testSample);
					}
				});
				offline.after(function(){
					player.dispose();
					done();
				});
				offline.run();
			});

			it("can seek to a position at the given time", function(done){
				Offline2(function(output, test, after){

					var ramp = new Float32Array(Math.floor(44100 * 0.3));
					for (var i = 0; i < ramp.length; i++){
						ramp[i] = (i / (ramp.length)) * 0.3;
					}

					var buff = new Buffer().fromArray(ramp);
					var player = new Player(buff).connect(output);

					player.start(0);
					player.seek(0.2, 0.1);

					test(function(sample, time){
						if (time < 0.1){
							expect(sample).to.be.within(0, 0.1);
						} else if (time > 0.1 && time < 0.2){
							expect(sample).to.be.within(0.2, 0.3);
						}
					});

					after(function(){
						buff.dispose();
						player.dispose();
						done();
					});

				}, 0.3);
			});

			it("can be play for a specific duration", function(done){
				var player;
				var meter = new Meter(0.4);
				meter.before(function(dest){
					player = new Player(buffer);
					player.connect(dest);
					player.start(0).stop(0.1);
				});
				meter.test(function(sample, time){
					if (sample < 0.001){
						expect(time).to.at.least(0.1);
						expect(player.state).to.equal("stopped");
					}
				});
				meter.after(function(){
					player.dispose();
					done();
				});
				meter.run();
			});

			it("can be play for a specific duration passed in the 'start' method", function(done){
				var player;
				var meter = new Meter(0.4);
				meter.before(function(dest){
					player = new Player(buffer);
					player.connect(dest);
					player.start(0, 0.1);
				});
				meter.test(function(sample, time){
					if (sample < 0.001){
						expect(time).to.at.least(0.1);
						expect(player.state).to.equal("stopped");
					}
				});
				meter.after(function(){
					player.dispose();
					done();
				});
				meter.run();
			});

			it("reports itself as stopped after a single iterations of the buffer", function(done){
				var player = new Player("./audio/short_sine.wav", function(){
					var duration = player.buffer.duration;
					player.start();
					setTimeout(function(){
						expect(player.state).to.equal("stopped");
						done();
					}, duration * 1000 + 200);
				});
			});

		});

	});
});