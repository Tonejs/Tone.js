/* global it, describe, after, maxTimeout, beforeEach */

define(["chai", "Tone/source/Player", "Tone/core/Master", "Tone/source/Oscillator", 
	"Recorder", "Tone/source/Noise", "tests/Core", "Tone/source/PulseOscillator", "tests/Common", 
	"Tone/source/PWMOscillator", "Tone/source/OmniOscillator", "Tone/source/Microphone", "Tone/core/Buffer", 
	"Tone/core/Transport"], 
function(chai, Player, Master, Oscillator, Recorder, Noise, core, PulseOscillator, Test, 
	PWMOscillator, OmniOscillator, Microphone, Buffer, Transport){

	var expect = chai.expect;

	describe("Tone.Player", function(){
		this.timeout(maxTimeout);

		beforeEach(function(){
			Test.onlineContext();
		});

		it("can be created and disposed", function(){
			var p = new Player();
			p.dispose();
			Test.wasDisposed(p);
		});

		it("handles output connections", function(){
			var p = new Player();
			Test.acceptsOutput(p);
			p.dispose();
		});

		it("loads a file", function(done){
			var player = new Player("./testAudio/kick.mp3", function(){
				player.dispose();
				done();
			});
		});

		it("invokes a callback onend", function(done){
			var player = new Player("./testAudio/kick.mp3", function(){
				player.start();
				expect(player.state).to.equal("started");
			});
			player.onended = function(){
				setTimeout(function(){
					expect(player.state).to.equal("stopped");
					player.dispose();
					done();
				}, 100);
			};
			player.toMaster();
		});

		it("can handle multiple restarts", function(done){
			var player = new Player("./testAudio/kick.mp3");
			Buffer.onload = function(){
				expect(player.state).to.equal("stopped");
				player.start();
				player.start();
				player.stop();
				player.stop();
				expect(player.state).to.equal("stopped");
				player.dispose();
				done();
			};
		});

		it("can be created with an options object", function(done){
			var player = new Player({
				"url" : "./testAudio/kick.mp3",
				"loop" : true
			});
			Buffer.onload = function(){
				expect(player.loop).to.be.true;
				player.dispose();
				done();
			};
		});

		it("can be set with an options object", function(){
			var player = new Player();
			expect(player.loop).to.be.false;
			expect(player.loopStart).to.equal(0);
			player.set({
				"loop" : true,
				"loopStart" : 0.4
			});
			expect(player.loop).to.be.true;
			expect(player.loopStart).to.equal(0.4);
			player.dispose();
		});

		it("can sync to the Transport", function(done){
			var player = new Player("./testAudio/kick.mp3");
			player.sync();
			Buffer.onload = function(){
				expect(player.state).to.equal("stopped");
				Transport.start();
				setTimeout(function(){
					expect(player.state).to.equal("started");
					Transport.stop();
					setTimeout(function(){
						expect(player.state).to.equal("stopped");
						player.dispose();
						player = null;
						done();
					}, 100);
				}, 100);
			};
		});
	});

	describe("Tone.Oscillator", function(){
		this.timeout(maxTimeout);

		beforeEach(function(){
			Test.onlineContext();
		});

		it("can be created and disposed", function(){
			var o = new Oscillator();
			o.dispose();
			Test.wasDisposed(o);
		});

		it("outputs a sound", function(done){
			var osc;
			Test.outputsAudio(function(dest){
				osc = new Oscillator();
				osc.connect(dest);
				osc.start();
			}, function(){
				osc.dispose();
				done();
			});
		});		

		it("handles output connections", function(){
			var osc = new Oscillator();
			Test.acceptsOutput(osc);
			osc.dispose();
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

		it("invokes the onended callback on stop", function(done){
			var oscillator = new Oscillator();
			oscillator.toMaster();
			oscillator.onended = function(){
				oscillator.dispose();
				done();
			};
			oscillator.start();
			oscillator.stop("+0.2");
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
			var oscillator = new Oscillator();
			oscillator.frequency.value = 110;
			expect(oscillator.frequency.value).to.equal(110);
			oscillator.start();
			oscillator.frequency.value = 220;
			expect(oscillator.frequency.value).to.equal(220);
			oscillator.dispose();
		});

		it("can be created with an options object", function(){
			var osc = new Oscillator({
				"frequency" : 200,
				"detune" : -20
			});
			expect(osc.frequency.value).to.equal(200);
			expect(osc.detune.value).to.equal(-20);
			osc.dispose();
		});

		it("can be set with an options object", function(){
			var osc = new Oscillator();
			osc.set({
				"frequency" : 231,
				"detune" : -21,
				"type" : "square"
			});
			expect(osc.frequency.value).to.equal(231);
			expect(osc.detune.value).to.equal(-21);
			expect(osc.type).to.equal("square");
			osc.dispose();
		});

		it("can sync the frequency to Transport", function(done){
			var osc;
			Test.offlineTest(0.1, function(dest){
				Transport.bpm.value = 120;
				osc = new Oscillator(2);
				osc.frequency.connect(dest);
				osc.syncFrequency();
				Transport.bpm.value = 240;
			}, function(freq){
				expect(freq).to.be.closeTo(4, 0.001);
			}, function(){
				osc.dispose();
				done();
			});
		});

		it("can unsync the frequency to Transport", function(done){
			var osc;
			Test.offlineTest(0.1, function(dest){
				Transport.bpm.value = 120;
				osc = new Oscillator(2);
				osc.frequency.connect(dest);
				osc.syncFrequency();
				Transport.bpm.value = 240;
				osc.unsyncFrequency();
			}, function(freq){
				expect(freq).to.be.closeTo(2, 0.001);
			}, function(){
				osc.dispose();
				done();
			});
		});
	});

	describe("Tone.Noise", function(){
		this.timeout(maxTimeout);

		beforeEach(function(){
			Test.onlineContext();
		});

		it("can be created and disposed", function(){
			var n = new Noise();
			n.dispose();
			Test.wasDisposed(n);
		});

		it("handles output connections", function(){
			var n = new Noise();
			Test.acceptsOutput(n);
			n.dispose();
		});

		it("outputs a sound", function(done){
			var noise;
			Test.outputsAudio(function(dest){
				noise = new Noise();
				noise.connect(dest);
				noise.start();
			}, function(){
				noise.dispose();
				done();
			});
		});		

		it("starts and stops", function(done){
			var noise = new Noise();
			expect(noise.state).to.equal("stopped");
			noise.start();
			expect(noise.state).to.equal("started");
			setTimeout(function(){
				noise.stop();
				noise.dispose();
				done();
			}, 100);
		});

		it("invokes the onended callback on stop", function(done){
			var noise = new Noise();
			noise.toMaster();
			noise.onended = function(){
				noise.dispose();
				done();
			};
			noise.start();
			noise.stop("+0.2");
		});

		it("can be scheduled to stop", function(done){
			var noise = new Noise();
			noise.toMaster();
			expect(noise.state).to.equal("stopped");
			noise.start();
			expect(noise.state).to.equal("started");
			noise.stop("+0.05");
			setTimeout(function(){
				expect(noise.state).to.equal("stopped");
				noise.dispose();
				done();
			}, 100);
		});

		it("won't start again before stopping", function(){
			var noise = new Noise();
			expect(noise.state).to.equal("stopped");
			noise.start();
			noise.start();
			noise.stop();
			noise.stop();
			expect(noise.state).to.equal("stopped");
			noise.dispose();
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
			var noise = new Noise();
			noise.type = "brown";
			noise.type = "white";
			noise.type = "pink";
			//even after started
			noise.start();
			noise.type = "brown";
			noise.type = "white";
			noise.type = "pink";
			noise.stop();
			noise.dispose();
		});

		it("can be created with an options object", function(){
			var noise = new Noise({
				"type" : "brown"
			});
			expect(noise.type).to.equal("brown");
			noise.dispose();
		});

		it("can be set with an options object", function(){
			var noise = new Noise();
			noise.set({
				"type" : "pink"
			});
			expect(noise.type).to.equal("pink");
			noise.dispose();
		});
	});

	describe("Tone.PulseOscillator", function(){
		this.timeout(maxTimeout);

		beforeEach(function(){
			Test.onlineContext();
		});

		it("can be created and disposed", function(){
			var o = new PulseOscillator();
			o.dispose();
			Test.wasDisposed(o);
		});

		it("handles output connections", function(){
			var o = new PulseOscillator();
			Test.acceptsOutput(o);
			o.dispose();
		});

		it("outputs a sound", function(done){
			var osc;
			Test.outputsAudio(function(dest){
				osc = new PulseOscillator();
				osc.connect(dest);
				osc.start();
			}, function(){
				osc.dispose();
				done();
			});
		});		

		it("can set the width", function(){
			var pulse = new PulseOscillator();
			pulse.width.value = 0.2;
			pulse.dispose();
		});

		it("can set the frequency", function(){
			var pulse = new PulseOscillator();
			pulse.frequency.value = 220;
			pulse.dispose();
		});

		it("invokes the onended callback on stop", function(done){
			var oscillator = new PulseOscillator();
			oscillator.toMaster();
			oscillator.onended = function(){
				oscillator.dispose();
				done();
			};
			oscillator.start();
			oscillator.stop("+0.2");
		});

		it("can be created with an options object", function(){
			var osc = new PulseOscillator({
				"frequency" : 200,
				"detune" : -20,
			});
			expect(osc.frequency.value).to.equal(200);
			expect(osc.detune.value).to.equal(-20);
			osc.dispose();
		});

		it("can be set with an options object", function(){
			var osc = new PulseOscillator();
			osc.set({
				"frequency" : 231,
				"detune" : -21,
				"width" : 0.2
			});
			expect(osc.frequency.value).to.equal(231);
			expect(osc.detune.value).to.equal(-21);
			expect(osc.width.value).to.be.closeTo(0.2, 0.001);
			osc.dispose();
		});
	});

	describe("Tone.PWMOscillator", function(){
		this.timeout(maxTimeout);

		beforeEach(function(){
			Test.onlineContext();
		});

		it("can be created and disposed", function(){
			var pwm = new PWMOscillator();
			pwm.dispose();
			Test.wasDisposed(pwm);
		});

		it("handles output connections", function(){
			var pwm = new PWMOscillator();
			Test.acceptsOutput(pwm);
			pwm.dispose();
		});

		it("outputs a sound", function(done){
			var osc;
			Test.outputsAudio(function(dest){
				osc = new PWMOscillator();
				osc.connect(dest);
				osc.start();
			}, function(){
				osc.dispose();
				done();
			});
		});		

		it("can set the modulation frequency", function(){
			var pwm = new PWMOscillator();
			pwm.modulationFrequency.value = 0.2;
			pwm.dispose();
		});

		it("can set the frequency", function(){
			var pwm = new PWMOscillator();
			pwm.frequency.value = 220;
			pwm.dispose();
		});

		it("invokes the onended callback on stop", function(done){
			var oscillator = new PWMOscillator();
			oscillator.toMaster();
			oscillator.onended = function(){
				oscillator.dispose();
				done();
			};
			oscillator.start();
			oscillator.stop("+0.2");
		});

		it("can be created with an options object", function(){
			var osc = new PWMOscillator({
				"frequency" : 200,
				"detune" : -20,
			});
			expect(osc.frequency.value).to.equal(200);
			expect(osc.detune.value).to.equal(-20);
			osc.dispose();
		});

		it("can be set with an options object", function(){
			var osc = new PWMOscillator();
			osc.set({
				"frequency" : 231,
				"detune" : -21,
				"modulationFrequency" : 0.2
			});
			expect(osc.frequency.value).to.equal(231);
			expect(osc.detune.value).to.equal(-21);
			expect(osc.modulationFrequency.value).to.be.closeTo(0.2, 0.001);
			osc.dispose();
		});
	});

	describe("Tone.OmniOscillator", function(){
		this.timeout(maxTimeout);

		beforeEach(function(){
			Test.onlineContext();
		});

		it("can be created and disposed", function(){
			var omni = new OmniOscillator();
			omni.dispose();
			Test.wasDisposed(omni);
		});

		it("outputs a sound", function(done){
			var osc;
			Test.outputsAudio(function(dest){
				osc = new OmniOscillator();
				osc.connect(dest);
				osc.start();
			}, function(){
				osc.dispose();
				done();
			});
		});		

		it("outputs a sound when set to a square wave", function(done){
			var osc;
			Test.outputsAudio(function(dest){
				osc = new OmniOscillator();
				osc.connect(dest);
				osc.type = "square";
				osc.start();
			}, function(){
				osc.dispose();
				done();
			});
		});		

		it("outputs a sound when set to a pwm wave", function(done){
			var osc;
			Test.outputsAudio(function(dest){
				osc = new OmniOscillator();
				osc.connect(dest);
				osc.type = "pwm";
				osc.start();
			}, function(){
				osc.dispose();
				done();
			});
		});		

		it("handles output connections", function(){
			var omni = new OmniOscillator();
			Test.acceptsOutput(omni);
			omni.dispose();
		});

		it("invokes the onended callback on stop", function(done){
			var omni = new OmniOscillator();
			omni.toMaster();
			omni.onended = function(){
				omni.dispose();
				done();
			};
			omni.start();
			omni.stop("+0.2");
		});

		it("can set the modulation frequency only when type is pwm", function(){
			var omni = new OmniOscillator();
			omni.type = "pwm";
			expect(function(){
				omni.modulationFrequency.value = 0.2;
			}).to.not.throw(Error);
			omni.type = "pulse";
			expect(function(){
				omni.modulationFrequency.value = 0.2;
			}).to.throw(Error);
			omni.dispose();
		});

		it("can set the modulation width only when type is pulse", function(){
			var omni = new OmniOscillator();
			omni.type = "pulse";
			expect(function(){
				omni.width.value = 0.2;
			}).to.not.throw(Error);
			omni.type = "sine";
			expect(function(){
				omni.width.value = 0.2;
			}).to.throw(Error);
			omni.dispose();
		});

		it("can be created with an options object", function(){
			var osc = new OmniOscillator({
				"frequency" : 210,
				"detune" : -30,
				"type" : "square"
			});
			expect(osc.frequency.value).to.equal(210);
			expect(osc.detune.value).to.equal(-30);
			expect(osc.type).to.equal("square");
			osc.dispose();
		});

		it("can be set with an options object", function(){
			var osc = new OmniOscillator();
			osc.set({
				"type" : "pwm",
				"frequency" : 231,
				"detune" : -21,
			});
			expect(osc.frequency.value).to.equal(231);
			expect(osc.detune.value).to.equal(-21);
			expect(osc.type).to.equal("pwm");
			osc.dispose();
		});
	});

	describe("Tone.Microphone", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var mic = new Microphone();
			mic.dispose();
			Test.wasDisposed(mic);
		});
	});
});