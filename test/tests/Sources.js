define(["chai", "Tone/source/Player", "Tone/core/Master", "Tone/source/Oscillator", "Tone/component/Recorder", "Tone/source/Noise", "tests/Core"], 
function(chai, Player, Master, Oscillator, Recorder, Noise){

	var expect = chai.expect;

	Master.mute();	

	describe("Tone.Player", function(){
		this.timeout(1000);
		var player = new Player("./testAudio/kick.mp3");
		player.toMaster();
		
		after(function(){
			player.dispose();
		});

		it("can be created and disposed", function(){
			var p = new Player();
			p.dispose();
		});

		it("loads a file", function(done){
			expect(player.state).to.equal("stopped");
			player.load(function(){
				done();
			});
		});

		it("has a duration", function(){
			expect(player.duration).to.be.closeTo(0.23, 0.01);
		});

		it("invokes a callback onend", function(done){
			player.onended = function(){
				expect(player.state).to.equal("stopped");
				done();
			};
			player.start();
			expect(player.state).to.equal("started");
		});

		it("can be scheduled", function(done){
			player.onended = function(){
				var diff = player.now() - now - player.duration;
				expect(diff).to.be.closeTo(0.5, 0.1);
				done();
			};
			var now = player.now();
			player.start("+.5");
		});

		it("can handle multiple restarts", function(){
			expect(player.state).to.equal("stopped");
			player.start();
			player.start();
			player.stop();
			player.stop();
			expect(player.state).to.equal("stopped");
		});

	});

	describe("Tone.Oscillator", function(){
		this.timeout(1000);

		var oscillator = new Oscillator();
		oscillator.toMaster();
		
		after(function(){
			oscillator.dispose();
		});

		it("can be created and disposed", function(){
			var o = new Oscillator();
			o.dispose();
		});

		it("starts and stops", function(done){
			expect(oscillator.state).to.equal("stopped");
			oscillator.start();
			expect(oscillator.state).to.equal("started");
			setTimeout(function(){
				oscillator.stop();
				done();
			}, 100);
		});

		it("can be scheduled to stop", function(done){
			expect(oscillator.state).to.equal("stopped");
			oscillator.start();
			expect(oscillator.state).to.equal("started");
			oscillator.stop("+0.05");
			setTimeout(function(){
				expect(oscillator.state).to.equal("stopped");
				done();
			}, 200);
		});

		it("won't start again before stopping", function(){
			expect(oscillator.state).to.equal("stopped");
			oscillator.start();
			oscillator.start();
			oscillator.stop();
			oscillator.stop();
			expect(oscillator.state).to.equal("stopped");
		});

		it("be scheduled to start in the future", function(done){
			var recorder = new Recorder();
			oscillator.connect(recorder);
			oscillator.start("+.05");
			recorder.record(0.1, 0.05, function(buffers){
				oscillator.stop();
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					if (buffer[i] !== 0){
						expect(oscillator.samplesToSeconds(i)).to.be.closeTo(0.05, 0.01);
						break;
					}
				}
				done();
			});
		});

		it("can set the frequency", function(done){
			oscillator.setFrequency(110);
			expect(oscillator.frequency.getValue()).to.equal(110);
			oscillator.start();
			oscillator.setFrequency(220, 0.05);
			setTimeout(function(){
				expect(oscillator.frequency.getValue()).to.equal(220);
				oscillator.stop();
				done();
			}, 100);
		});
	});

	describe("Tone.Noise", function(){
		this.timeout(1000);

		var noise = new Noise();
		noise.toMaster();

		after(function(){
			noise.dispose();
		});

		it("can be created and disposed", function(){
			var n = new Noise();
			n.dispose();
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
			var recorder = new Recorder();
			noise.connect(recorder);
			noise.start("+.05");
			recorder.record(0.1, 0.05, function(buffers){
				noise.stop();
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					if (buffer[i] !== 0){
						expect(noise.samplesToSeconds(i)).to.be.closeTo(0.05, 0.01);
						break;
					}
				}
				done();
			});
		});

		it("can set the noise types", function(){
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

});