define(["chai", "Tone/source/Player", "Tone/core/Master", "Tone/source/Oscillator", "Tone/component/Recorder", "tests/WebAudio"], 
function(chai, Player, Master, Oscillator, Recorder){

	var expect = chai.expect;

	Master.mute();	

	describe("Tone.Player", function(){
		this.timeout(1000);
		var player = new Player("./testAudio/kick.mp3");
		player.toMaster();
		
		after(function(){
			player.dispose();
		});

		it("loads a file", function(done){
			expect(player.state).to.equal("stopped");
			player.load(function(){
				done();
			});
		});

		it("has a duration", function(){
			expect(player.duration).to.equal(0.2361678034067154);
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
			recorder.record(0.1);
			oscillator.start("+.05");
			setTimeout(function(){
				oscillator.stop();
				var buffer = recorder.getFloat32Array()[0];
				for (var i = 0; i < buffer.length; i++){
					if (buffer[i] !== 0){
						expect(oscillator.samplesToSeconds(i)).to.be.closeTo(0.05, 0.001);
						break;
					}
				}
				done();
			}, 200);
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

	

});