import BasicTests from "helper/Basic";
import GrainPlayer from "Tone/source/GrainPlayer";
import Offline from "helper/Offline";
import SourceTests from "helper/SourceTests";
import Buffer from "Tone/core/Buffer";
import Test from "helper/Test";
import Tone from "Tone/core/Tone";
import CompareToFile from "helper/CompareToFile";

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

	it("matches a file", function(){
		return CompareToFile(function(){
			var player = new GrainPlayer(buffer).toMaster();
			player.start(0.1).stop(0.2);
			player.detune = -100,
			player.playbackRate = 2;
		}, "grainPlayer.wav", 0.16);
	});

	it("matches another file", function(){
		return CompareToFile(function(){
			var player = new GrainPlayer(buffer).toMaster();
			player.start(0.1, 0.2);
			player.loop = true;
			player.overlap = 0.005;
			player.grainSize = 0.05;
			player.detune = 1200,
			player.playbackRate = 0.5;
		}, "grainPlayer2.wav", 0.2);
	});

	context("Constructor", function(){

		it("can be constructed with a Tone.Buffer", function(done){
			var player = new GrainPlayer(buffer);
			expect(player.buffer.get()).to.equal(buffer.get());
			player.dispose();
			done();
		});

		it("can be constructed with an AudioBuffer", function(done){
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
				expect(player.loaded).to.be.true;
				player.dispose();
				done();
			});
		});

		it("can be created with an options object", function(done){
			var player = new GrainPlayer({
				"url" : "./audio/sine.wav",
				"loop" : true,
				"onload" : function(grain){
					expect(grain.loop).to.be.true;
					player.dispose();
					done();
				}
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

