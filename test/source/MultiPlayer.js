define(["helper/Basic", "Tone/source/MultiPlayer", "helper/Offline", "helper/SourceTests", 
	"Tone/core/Buffer", "helper/OutputAudioStereo", "helper/Meter"], 
	function (BasicTests, MultiPlayer, Offline, SourceTests, Buffer, OutputAudioStereo, Meter) {

	if (window.__karma__){
		Buffer.baseUrl = "/base/test/";
	}

	describe("MultiPlayer", function(){

		var buffer = new Buffer();

		beforeEach(function(done){
			buffer.load("./audio/sine.wav", function(){
				done();
			});
		});

		//run the common tests
		BasicTests(MultiPlayer);

		context("Constructor", function(){

			it ("can be constructed with a Tone.Buffer", function(){
				var player = new MultiPlayer({
					"buffer" : buffer
				});
				player.dispose();
			});

			it ("can be constructed with no arguments", function(){
				var player = new MultiPlayer();
				player.dispose();
			});

			it ("can be constructed an options object", function(){
				var player = new MultiPlayer({
					buffers : ["./audio/sine.wav"],
					fadeOut : 0.1
				});
				expect(player.fadeOut).to.equal(0.1);
				player.dispose();
			});

			it("invokes callback when a single buffer is added", function(done){
				var player = new MultiPlayer().add("sine", "./audio/sine.wav", function(){
					player.dispose();
					done();
				});
			});
		});

		context("Makes Sound", function(){

			it("produces sound in both channels", function(){
				return OutputAudioStereo(function(){
					var player = new MultiPlayer().add("buffer", buffer);
					player.toMaster();
					player.start("buffer");
				});
			});	

			it("be scheduled to start in the future", function(){
				return Offline(function(){
					var player = new MultiPlayer().add("buffer", buffer).toMaster();
					player.start("buffer", 0.1);
				}, 0.3).then(function(buffer){
					buffer.forEach(function(sample, time){
						if (sample > 0){
							expect(time).to.be.at.least(0.099);
						}
					});
				});
			});

			it("can be repitched", function(){
				return Meter(function(){
					var player = new MultiPlayer().add("buffer", buffer).toMaster();
					player.start("buffer", 0, 0, 0.3, -1);
				}, 0.3).then(function(buffer){
					buffer.forEach(function(level, time){
						if (time > 0){
							expect(level).to.be.at.least(0.1);
						}
					});
				});
			});

			it("can be played at a different gain", function(){
				return Offline(function(){
					var player = new MultiPlayer().add("buffer", buffer).toMaster();
					player.start("buffer", 0, 0, 0.3, 0, 0.1);
				}, 0.3).then(function(buffer){
					expect(buffer.max()).to.be.at.most(0.1);
				});
			});

			it("can be stopped", function(){
				return Meter(function(){
					var player = new MultiPlayer().add("buffer", buffer);
					player.toMaster();
					player.start("buffer", 0).stop("buffer", 0.1);
				}, 0.3).then(function(rms){
					rms.forEach(function(level, time){
						if (time > 0 && time < 0.1){
							expect(level).to.be.at.least(0.1);
						} else if (time > 0.11){
							expect(level).to.equal(0);
						}
					});
				});
			});

			it("can stop all sources", function(){
				return Meter(function(){
					var player = new MultiPlayer().add("buffer", buffer);
					player.toMaster();
					player.start("buffer", 0).start("buffer", 0.02).stopAll(0.1);
				}, 0.3).then(function(rms){
					rms.forEach(function(level, time){
						if (time > 0 && time < 0.1){
							expect(level).to.be.at.least(0.1);
						} else if (time > 0.12){
							expect(level).to.equal(0);
						}
					});
				});
			});

			it("can start and stop a loop", function(){
				var stopTime = buffer.duration * 1.1;
				return Meter(function(){
					var player = new MultiPlayer().add("buffer", buffer);
					player.toMaster();
					player.startLoop("buffer", 0).stop("buffer", stopTime);
				}, buffer.duration * 1.5).then(function(rms){
					rms.forEach(function(level, time){
						if (time > 0 && time < stopTime){
							expect(level).to.be.at.least(0.1);
						} else if (time > stopTime + 0.01){
							expect(level).to.equal(0);
						}
					});
				});
			});


		});

	});
});