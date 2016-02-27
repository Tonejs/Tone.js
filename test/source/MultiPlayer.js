define(["helper/Basic", "Tone/source/MultiPlayer", "helper/Offline", "helper/SourceTests", 
	"Tone/core/Buffer", "helper/Meter", "helper/OutputAudioStereo"], 
	function (BasicTests, MultiPlayer, Offline, SourceTests, Buffer, Meter, OutputAudioStereo) {

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
				expect(player._buffers.buffer).to.equal(buffer);
				player.dispose();
			});

			it ("can be constructed with no arguments", function(){
				var player = new MultiPlayer();
				player.dispose();
			});
		});

		context("Loading", function(){

			it("invokes callback when a single buffer is added", function(done){
				var player = new MultiPlayer().addBuffer("sine", "./audio/sine.wav", function(){
					player.dispose();
					done();
				});
			});

			it("invokes callback when a multiple buffers are added", function(done){
				var player = new MultiPlayer().addBuffer({
					"sine": "./audio/sine.wav", 
					"hh": "./audio/hh.mp3", 
					"kick": "./audio/kick.mp3", 
				}, function(){
					player.dispose();
					done();
				});
			});
		});

		context("Makes Sound", function(){

			it("produces sound in both channels", function(done){
				var player;
				OutputAudioStereo(function(dest){
					player = new MultiPlayer().addBuffer("buffer", buffer);
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
					player = new MultiPlayer().addBuffer("buffer", buffer);
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

		});

	});
});