import BasicTests from "helper/Basic";
import Players from "Tone/source/Players";
import Offline from "helper/Offline";
import Buffer from "Tone/core/Buffer";
import Meter from "helper/Meter";
import Test from "helper/Test";
import Tone from "Tone/core/Tone";
import Player from "Tone/source/Player";
import OutputAudio from "helper/OutputAudio";

describe("Players", function(){

	var buffer = new Buffer();

	beforeEach(function(done){
		buffer.load("./audio/sine.wav", function(){
			done();
		});
	});

	BasicTests(Players, { "test" : buffer });

	context("Constructor", function(){

		it("can be constructed with an object containing multiple Tone.Buffer", function(){
			var player = new Players({
				"test" : buffer
			});
			expect(player.get("test").buffer.get()).to.equal(buffer.get());
			player.dispose();
		});

		it("can be constructed with an AudioBuffer", function(){
			var player = new Players({
				"test" : buffer.get()
			});
			expect(player.get("test").buffer.get()).to.equal(buffer.get());
			player.dispose();
		});

		it("can be constructed with a url", function(done){
			var player = new Players({
				"test0" : "./audio/sine.wav",
				"test1" : "./audio/sine.wav",
			}, function(){
				expect(player.get("test0")).to.be.instanceOf(Player);
				expect(player.get("test0").buffer.loaded).to.be.true;
				expect(player.get("test1")).to.be.instanceOf(Player);
				expect(player.get("test1").buffer.loaded).to.be.true;
				expect(player.loaded).to.be.true;
				player.dispose();
				done();
			});
		});

		it("can pass in additional args in the second parameters", function(done){
			var player = new Players({
				"test" : "./audio/sine.wav",
			}, {
				"volume" : -12,
				"onload" : function(){
					expect(player.get("test").buffer.loaded).to.be.true;
					expect(player.volume.value).to.be.closeTo(-12, 0.1);
					player.dispose();
					done();
				}
			});
		});

		it("can get and set fadeIn/Out", function(){
			var players = new Players({
				"test" : "./audio/sine.wav",
			}, {
				"fadeIn" : 0.1,
				"fadeOut" : 0.2,
			});
			expect(players.fadeIn).to.equal(0.1);
			expect(players.fadeOut).to.equal(0.2);
			expect(players.get("test").fadeIn).to.equal(0.1);
			players.fadeIn = 0.2;
			players.fadeOut = 0.3;
			expect(players.fadeIn).to.equal(0.2);
			expect(players.fadeOut).to.equal(0.3);
			expect(players.get("test").fadeOut).to.equal(0.3);
			players.dispose();
		});
	});

	context("get/has/add buffers", function(){

		it("says it 'has' a sample", function(){
			var players = new Players({
				"test" : buffer
			});
			expect(players.has("test")).to.be.true;
			expect(players.has("nope")).to.be.false;
			players.dispose();
		});

		it("can get a sample", function(){
			var players = new Players({
				"test" : buffer
			});
			expect(players.get("test")).to.be.instanceOf(Player);
			players.dispose();
		});

		it("throws an error if it tries to get a sample which is not there", function(){
			var players = new Players({
				"test" : buffer
			});
			expect(function(){
				players.get("nope");
			}).to.throw(Error);
			players.dispose();
		});

		it("can add a player with a buffer", function(){
			var players = new Players();
			expect(players.has("test")).to.be.false;
			players.add("test", buffer);
			expect(players.has("test")).to.be.true;
			players.dispose();
		});

		it("can add a player with a url", function(done){
			var players = new Players();
			expect(players.has("test")).to.be.false;
			players.add("test", "./audio/sine.wav", function(){
				expect(players.has("test")).to.be.true;
				players.dispose();
				done();
			});
		});

		it("can add a player with an unloaded Tone.Buffer", function(done){
			var players = new Players();
			var buffer = new Buffer("./audio/sine.wav");
			players.add("test", buffer, function(){
				expect(players.has("test")).to.be.true;
				expect(players.get("test").loaded).to.be.true;
				players.dispose();
				done();
			});
		});
	});

	context("start/stop players", function(){

		it("makes a sound", function(){
			return OutputAudio(function(){
				var players = new Players({
					"test" : buffer
				}).toMaster();
				players.get("test").start(0);
			});
		});

		it("can be muted", function(){
			return Offline(function(){
				var players = new Players({
					"test" : buffer
				}).toMaster();
				players.get("test").start(0);
				players.mute = true;
				expect(players.mute).to.be.true;
			}, 0.3).then(function(buffer){
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("be scheduled to start in the future", function(){
			return Offline(function(){
				var players = new Players({
					"test" : buffer
				}).toMaster();
				players.get("test").start(0.1);
			}, 0.3).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (sample > 0){
						expect(time).to.be.at.least(0.099);
					}
				});
			});
		});

		it("be scheduled to stop in the future", function(){
			return Offline(function(){
				var players = new Players({
					"test" : buffer
				}).toMaster();
				players.get("test").start(0).stop(0.2);
			}, 0.3).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time > 0.2){
						expect(sample).to.equal(0);
					}
				});
			});
		});

		it("if any of the players are playing, reports state as 'started'", function(){
			return Offline(function(){
				var players = new Players({
					"test0" : buffer,
					"test1" : buffer
				}).toMaster();
				players.get("test0").start(0).stop(0.05);
				players.get("test1").start(0).stop(0.1);
				return function(time){
					if (time <= 0.1){
						expect(players.state).to.equal("started");
					} else {
						expect(players.state).to.equal("stopped");
					}
				};
			}, 0.2);
		});

		it("can start multiple samples", function(){
			return OutputAudio(function(){
				var players = new Players({
					"test0" : buffer,
					"test1" : buffer,
				}).toMaster();
				players.get("test0").start(0).stop(0.01);
				players.get("test1").start(0);
			});
		});

		it("can stop all of the samples in the future", function(){
			return Offline(function(){
				var players = new Players({
					"test0" : buffer,
					"test1" : buffer,
				}).toMaster();
				players.get("test0").start(0);
				players.get("test1").start(0);
				players.stopAll(0.2);
			}, 0.3).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time > 0.2){
						expect(sample).to.equal(0);
					}
				});
			});
		});

		it("fades in and out correctly", function(){
			return Offline(function(){
				var onesArray = new Float32Array(buffer.context.sampleRate * 0.5);
				onesArray.forEach(function(sample, index){
					onesArray[index] = 1;
				});
				var onesBuffer = Buffer.fromArray(onesArray);
				var players = new Players({
					"test" : onesBuffer
				}, {
					"fadeIn" : 0.1,
					"fadeOut" : 0.1,
				}).toMaster();
				players.get("test").start(0);
			}, 0.6).then(function(buffer){
				buffer.forEach(function(sample, time){
					if (time < 0.1){
						expect(sample).to.be.within(0, 1);
					} else if (time < 0.4){
						expect(sample).to.equal(1);
					} else if (time < 0.5){
						expect(sample).to.be.within(0, 1);
					} else {
						expect(sample).to.equal(0);
					}
				});
			});
		});
	});
});

