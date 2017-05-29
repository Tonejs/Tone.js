define(["helper/Basic", "Tone/source/GrainPlayer", "helper/Offline", "helper/SourceTests", 
	"Tone/core/Buffer", "Test", "Tone/core/Tone"], 
	function (BasicTests, GrainPlayer, Offline, SourceTests, Buffer, Test, Tone) {

	if (window.__karma__){
		Buffer.baseUrl = "/base/test/";
	}

	describe("GrainPlayer", function(){

		var buffer = new Buffer();

		beforeEach(function(done){
			buffer.load("./audio/sine.wav", function(){
				done();
			});
		});

		//run the common tests
		BasicTests(GrainPlayer, buffer);
		SourceTests(GrainPlayer, buffer);

		context("Constructor", function(){

			it ("can be constructed with a Tone.Buffer", function(done){
				var player = new GrainPlayer(buffer);
				expect(player.buffer.get()).to.equal(buffer.get());
				player.dispose();
				done();
			});

			it ("can be constructed with an AudioBuffer", function(done){
				var player = new GrainPlayer(buffer.get());
				expect(player.buffer.get()).to.equal(buffer.get());
				player.dispose();
				done();
			});

			it("makes a sound", function(){
				return Offline(function(){
					var player = new GrainPlayer(buffer).toMaster();
					player.start();
				}).then(function(buffer){
					expect(buffer.isSilent()).to.be.false;
				});
			});
		});

		context("Loading", function(){

			it("loads a url which was passed in", function(done){
				var player = new GrainPlayer("./audio/sine.wav", function(){
					player.dispose();
					done();
				});
			});

			it("can be created with an options object", function(){
				var player = new GrainPlayer({
					"url" : "./audio/sine.wav",
					"loop" : true
				});
				player.dispose();
			});

		});

		context("Looping", function(){

			beforeEach(function(done){
				buffer.load("./audio/short_sine.wav", function(){
					done();
				});
			});

			it("can be set to loop", function(){
				var player = new GrainPlayer();
				player.loop = true;
				expect(player.loop).to.be.true;
				player.dispose();
			});

		});

		context("start/stop", function(){

			beforeEach(function(done){
				buffer.load("./audio/short_sine.wav", function(){
					done();
				});
			});

			it("can be play for a specific duration", function(){
				return Offline(function(){
					var player = new GrainPlayer(buffer);
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
					expect(buffer.getLastSoundTime()).to.be.closeTo(0.1, 0.02);
				});
			});

			it("can be play for a specific duration passed in the 'start' method", function(){
				return Offline(function(){
					var player = new GrainPlayer(buffer);
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

			it("can seek to a position at the given time", function(){
				return Offline(function(){
					var ramp = new Float32Array(Math.floor(Tone.context.sampleRate * 0.3));
					for (var i = 0; i < ramp.length; i++){
						ramp[i] = (i / (ramp.length)) * 0.3;
					}
					var buff = new Buffer().fromArray(ramp);
					var player = new GrainPlayer(buff).toMaster();
					player.overlap = 0;
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

		});

		context("Get/Set", function(){

			it("can be set with an options object", function(){
				var player = new GrainPlayer();
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
				var player = new GrainPlayer({
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
				var player = new GrainPlayer();
				player.playbackRate = 0.5;
				expect(player.playbackRate).to.equal(0.5);
				player.dispose();
			});
			
		});

	});
});