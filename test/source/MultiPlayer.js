define(["helper/Basic", "Tone/source/MultiPlayer", "helper/Offline", "helper/SourceTests", 
	"Tone/core/Buffer", "helper/Meter", "helper/OutputAudioStereo"], 
	function (BasicTests, MultiPlayer, Offline, SourceTests, Buffer, Meter, OutputAudioStereo) {

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

			it("produces sound in both channels", function(done){
				var player;
				OutputAudioStereo(function(dest){
					player = new MultiPlayer().add("buffer", buffer);
					player.connect(dest);
					player.start("buffer");
				}, function(){
					player.dispose();
					done();
				});
			});	

			it("be scheduled to start in the future", function(done){
				var player;
				var meter = new Meter(0.3);
				meter.before(function(dest){
					player = new MultiPlayer().add("buffer", buffer);
					player.connect(dest);
					player.start("buffer", 0.1);
				});
				meter.test(function(sample, time){
					if (sample > 0){
						expect(time).to.be.at.least(0.1);
					}
				});
				meter.after(function(){
					player.dispose();
					done();
				});
				meter.run();
			});

			it("can be repitched", function(done){
				var player;
				var meter = new Meter(0.3);
				meter.before(function(dest){
					player = new MultiPlayer().add("buffer", buffer);
					player.connect(dest);
					player.start("buffer", 0, 0, 0.3, -1);
				});
				meter.test(function(value, time){
					if (time > 0){
						expect(value).to.be.at.least(0.1);
					}
				});
				meter.after(function(){
					player.dispose();
					done();
				});
				meter.run();
			});

			it("can be played at a different gain", function(done){
				var player;
				var meter = new Meter(0.3);
				meter.before(function(dest){
					player = new MultiPlayer().add("buffer", buffer);
					player.connect(dest);
					player.start("buffer", 0, 0, 0.3, 0, 0.1);
				});
				meter.test(function(value){
					expect(value).to.be.at.most(0.1);
				});
				meter.after(function(){
					player.dispose();
					done();
				});
				meter.run();
			});

			it("can be stopped", function(done){
				var player;
				var meter = new Meter(0.3);
				meter.before(function(dest){
					player = new MultiPlayer().add("buffer", buffer);
					player.connect(dest);
					player.start("buffer", 0).stop("buffer", 0.1);
				});
				meter.test(function(value, time){
					if (time > 0 && time < 0.1){
						expect(value).to.be.at.least(0.1);
					} else if (time > 0.11){
						expect(value).to.equal(0);
					}
				});
				meter.after(function(){
					player.dispose();
					done();
				});
				meter.run();
			});

			it("can stop all sources", function(done){
				var player;
				var meter = new Meter(0.3);
				meter.before(function(dest){
					player = new MultiPlayer().add("buffer", buffer);
					player.connect(dest);
					player.start("buffer", 0).start("buffer", 0.02).stopAll(0.1);
				});
				meter.test(function(value, time){
					if (time > 0 && time < 0.1){
						expect(value).to.be.at.least(0.1);
					} else if (time > 0.12){
						expect(value).to.equal(0);
					}
				});
				meter.after(function(){
					player.dispose();
					done();
				});
				meter.run();
			});

		});

	});
});