define(["helper/Basic", "Tone/source/GrainPlayer", "helper/Offline", "helper/SourceTests", "Tone/core/Buffer", "Tone/component/Meter"], 
	function (BasicTests, GrainPlayer, Offline, SourceTests, Buffer, Meter) {

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

			it("makes a sound", function(done){
				var player = new GrainPlayer(buffer);
				var meter = new Meter();
				player.connect(meter);
				player.start();
				setTimeout(function(){
					expect(meter.value).to.be.above(0.1);
					player.dispose();
					meter.dispose();
					done();
				}, 500);
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