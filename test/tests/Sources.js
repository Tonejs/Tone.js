/* global it, describe, after, maxTimeout */

define(["chai", "Tone/source/Player", "Tone/core/Master", "Tone/source/Oscillator", 
	"Tone/component/Recorder", "Tone/source/Noise", "tests/Core", "Tone/source/PulseOscillator", "tests/Common"], 
function(chai, Player, Master, Oscillator, Recorder, Noise, core, PulseOscillator, Test){

	var expect = chai.expect;

	describe("Tone.Player", function(){
		this.timeout(maxTimeout);

		Test.onlineContext();

		it("can be created and disposed", function(){
			var p = new Player();
			p.dispose();
			Test.wasDisposed(p, expect);
		});

		it("loads a file", function(done){
			var player = new Player("./testAudio/kick.mp3", function(){
				player.dispose();
				done();
			});
		});

		it("has a duration", function(done){
			var player = new Player("./testAudio/kick.mp3", function(){
				expect(player.duration).to.be.closeTo(0.23, 0.01);
				player.dispose();
				done();
			});
		});
/*
		it("invokes a callback onend", function(done){
			var player = new Player("./testAudio/kick.mp3", function(){
				player.onended = function(){
					expect(player.state).to.equal("stopped");
					console.log("hihi");
					player.dispose();
					done();
				};
				console.log("here");
				player.start();
				expect(player.state).to.equal("started");
			});
		});*/

		it("can handle multiple restarts", function(done){
			var player = new Player("./testAudio/kick.mp3", function(){
				expect(player.state).to.equal("stopped");
				player.start();
				player.start();
				player.stop();
				player.stop();
				expect(player.state).to.equal("stopped");
				done();
			});
		});

	});

	describe("Tone.Oscillator", function(){
		this.timeout(maxTimeout);

		Test.onlineContext();

		it("can be created and disposed", function(){
			var o = new Oscillator();
			o.dispose();
			Test.wasDisposed(o, expect);
		});

		it("starts and stops", function(done){
			var oscillator = new Oscillator();
			expect(oscillator.state).to.equal("stopped");
			oscillator.start();
			expect(oscillator.state).to.equal("started");
			setTimeout(function(){
				oscillator.stop();
				oscillator.dispose();
				done();
			}, 100);
		});

		it("can be scheduled to stop", function(done){
			var oscillator = new Oscillator();
			expect(oscillator.state).to.equal("stopped");
			oscillator.start();
			oscillator.stop("+0.05");
			setTimeout(function(){
				// expect(oscillator.state).to.equal("stopped");
				oscillator.dispose();
				done();
			}, 200);
		});

		it("won't start again before stopping", function(){
			var oscillator = new Oscillator();
			expect(oscillator.state).to.equal("stopped");
			oscillator.start();
			oscillator.start();
			oscillator.stop();
			oscillator.stop();
			expect(oscillator.state).to.equal("stopped");
			oscillator.dispose();
		});

		it("be scheduled to start in the future", function(done){
			var osc;
			Test.offlineTest(1, function(dest){
				osc = new Oscillator(440);
				osc.connect(dest);
				osc.start("+0.1");
			}, function(sample, time){
				if (sample !== 0){
					expect(time).to.be.at.least(0.1);
				}
			}, function(){
				osc.dispose();
				done();
			});
		});

		it("can set the frequency", function(){
			Test.onlineContext();
			var oscillator = new Oscillator();
			oscillator.setFrequency(110);
			expect(oscillator.frequency.getValue()).to.equal(110);
			oscillator.start();
			oscillator.setFrequency(220);
			expect(oscillator.frequency.getValue()).to.equal(220);
			oscillator.dispose();
		});
	});

	describe("Tone.Noise", function(){
		this.timeout(maxTimeout);

		var noise = new Noise();
		noise.toMaster();

		after(function(){
			noise.dispose();
		});

		it("can be created and disposed", function(){
			var n = new Noise();
			n.dispose();
			Test.wasDisposed(n, expect);
		});

		it("starts and stops", function(done){
			expect(noise.state).to.equal("stopped");
			noise.start();
			expect(noise.state).to.equal("started");
			setTimeout(function(){
				noise.stop();
				done();
			}, 100);
		});

		it("can be scheduled to stop", function(done){
			expect(noise.state).to.equal("stopped");
			noise.start();
			expect(noise.state).to.equal("started");
			noise.stop("+0.05");
			setTimeout(function(){
				expect(noise.state).to.equal("stopped");
				done();
			}, 100);
		});

		it("won't start again before stopping", function(){
			expect(noise.state).to.equal("stopped");
			noise.start();
			noise.start();
			noise.stop();
			noise.stop();
			expect(noise.state).to.equal("stopped");
		});

		it("be scheduled to start in the future", function(done){
			var noi;
			Test.offlineTest(1, function(dest){
				noi = new Noise();
				noi.connect(dest);
				noi.start("+0.1");
			}, function(sample, time){
				if (sample !== 0){
					expect(time).to.be.at.least(0.1);
				}
			}, function(){
				noi.dispose();
				done();
			});
		});

		it("can set the noise types", function(){
			Test.onlineContext();
			noise.setType("brown");
			noise.setType("white");
			noise.setType("pink");
			//even after started
			noise.start();
			noise.setType("brown");
			noise.setType("white");
			noise.setType("pink");
			noise.stop();
		});
	});

	describe("Tone.PulseOscillator", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var o = new PulseOscillator();
			o.dispose();
			Test.wasDisposed(o, expect);
		});
	});

});