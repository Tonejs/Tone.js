/* global it, describe, mocha*/

require.config({
	baseUrl:"./",
	paths : {
		"Tone" : "../Tone",
		"chai" : "./testDeps/chai",
	}
});


require(["Tone/core/Master", "Tone/instrument/MonoSynth", "Tone/instrument/DuoSynth", 
	"Tone/instrument/FMSynth", "Tone/instrument/AMSynth", "Tone/instrument/NoiseSynth", 
	"Tone/source/Oscillator", "Tone/source/PulseOscillator", "Tone/source/PWMOscillator", 
	"Tone/source/Noise", "Tone/instrument/PluckSynth", "Tone/effect/AutoPanner", 
	"Tone/effect/AutoWah", "Tone/effect/BitCrusher", "Tone/effect/Chebyshev",
	"Tone/effect/Chorus", "Tone/effect/Distortion", "Tone/effect/FeedbackDelay",
	"Tone/effect/Freeverb", "Tone/effect/JCReverb", "Tone/effect/Phaser", 
	"Tone/effect/PingPongDelay"], 
function(Master, MonoSynth, DuoSynth, FMSynth, AMSynth, NoiseSynth, Oscillator, 
	PulseOscillator, PWMOscillator, Noise, PluckSynth, AutoPanner, AutoWah, BitCrusher,
	Chebyshev, Chorus, Distortion, FeedbackDelay, Freeverb, JCReverb, Phaser, PingPongDelay){

	var noteDuration = 1;

	describe("Tone.Oscillator", function(){
		it("makes sound", function(done){
			var source = new Oscillator();
			source.toMaster();
			source.start();
			source.stop("+"+ (noteDuration * 0.5));
			setTimeout(function(){
				source.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.PulseOscillator", function(){
		it("makes sound", function(done){
			var source = new PulseOscillator();
			source.toMaster();
			source.start();
			source.stop("+"+ (noteDuration * 0.5));
			setTimeout(function(){
				source.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.PWMOscillator", function(){
		it("makes sound", function(done){
			var source = new PWMOscillator();
			source.toMaster();
			source.start();
			source.stop("+"+ (noteDuration * 0.5));
			setTimeout(function(){
				source.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.Noise", function(){
		it("makes sound", function(done){
			var source = new Noise();
			source.toMaster();
			source.start();
			source.stop("+"+ (noteDuration * 0.5));
			setTimeout(function(){
				source.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.MonoSynth", function(){
		it("makes sound", function(done){
			var synth = new MonoSynth();
			synth.toMaster();
			synth.triggerAttackRelease("C4", noteDuration * 0.5);
			setTimeout(function(){
				synth.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.DuoSynth", function(){
		it("makes sound", function(done){
			var synth = new DuoSynth();
			synth.toMaster();
			synth.triggerAttackRelease("C4", noteDuration * 0.5);
			setTimeout(function(){
				synth.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.FMSynth", function(){
		it("makes sound", function(done){
			var synth = new FMSynth();
			synth.toMaster();
			synth.triggerAttackRelease("C4", noteDuration * 0.5);
			setTimeout(function(){
				synth.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.AMSynth", function(){
		it("makes sound", function(done){
			var synth = new AMSynth();
			synth.toMaster();
			synth.triggerAttackRelease("C4", noteDuration * 0.5);
			setTimeout(function(){
				synth.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.NoiseSynth", function(){
		it("makes sound", function(done){
			var synth = new NoiseSynth();
			synth.toMaster();
			synth.triggerAttack();
			setTimeout(function(){
				synth.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.PluckSynth", function(){
		it("makes sound", function(done){
			var synth = new PluckSynth();
			synth.volume.value = 12;
			synth.toMaster();
			synth.triggerAttack("C3");
			setTimeout(function(){
				synth.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.AutoPanner", function(){
		it("effects sound", function(done){
			var synth = new MonoSynth();
			var effect = new AutoPanner(10);
			effect.start();
			synth.connect(effect);
			effect.toMaster();
			synth.triggerAttackRelease("C4", noteDuration * 0.75);
			setTimeout(function(){
				synth.dispose();
				effect.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.AutoWah", function(){
		it("effects sound", function(done){
			var synth = new MonoSynth();
			var effect = new AutoWah({
				"baseFrequency" : 100,
				"octaves" : 4,
				"sensitivity" : 0,
				"Q" : 2,
				"gain" : 10,
				"rolloff" : -12,
				"follower" : {
					"attack" : 0.05,
					"release" : 0.2
				}
			});
			synth.connect(effect);
			effect.toMaster();
			synth.triggerAttackRelease("C4", noteDuration * 0.75);
			setTimeout(function(){
				synth.dispose();
				effect.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.BitCrusher", function(){
		it("effects sound", function(done){
			var synth = new MonoSynth();
			var effect = new BitCrusher(4);
			synth.connect(effect);
			effect.toMaster();
			synth.triggerAttackRelease("C4", noteDuration * 0.75);
			setTimeout(function(){
				synth.dispose();
				effect.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.Chebyshev", function(){
		it("effects sound", function(done){
			var synth = new MonoSynth();
			var effect = new Chebyshev(50);
			synth.connect(effect);
			effect.toMaster();
			synth.triggerAttackRelease("C4", noteDuration * 0.75);
			setTimeout(function(){
				synth.dispose();
				effect.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.Chorus", function(){
		it("effects sound", function(done){
			var synth = new MonoSynth();
			var effect = new Chorus();
			synth.connect(effect);
			effect.toMaster();
			synth.triggerAttackRelease("C4", noteDuration * 0.75);
			setTimeout(function(){
				synth.dispose();
				effect.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.Distortion", function(){
		it("effects sound", function(done){
			var synth = new MonoSynth();
			var effect = new Distortion();
			synth.connect(effect);
			effect.toMaster();
			synth.triggerAttackRelease("C4", noteDuration * 0.75);
			setTimeout(function(){
				synth.dispose();
				effect.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.FeedbackDelay", function(){
		it("effects sound", function(done){
			var synth = new MonoSynth();
			var effect = new FeedbackDelay();
			synth.connect(effect);
			effect.toMaster();
			synth.triggerAttackRelease("C4", noteDuration * 0.1);
			setTimeout(function(){
				synth.dispose();
				effect.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.Freeverb", function(){
		it("effects sound", function(done){
			var synth = new MonoSynth();
			var effect = new Freeverb();
			synth.connect(effect);
			effect.toMaster();
			synth.triggerAttackRelease("C4", noteDuration * 0.1);
			setTimeout(function(){
				synth.dispose();
				effect.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.JCReverb", function(){
		it("effects sound", function(done){
			var synth = new MonoSynth();
			var effect = new JCReverb();
			synth.connect(effect);
			effect.toMaster();
			synth.triggerAttackRelease("C4", noteDuration * 0.1);
			setTimeout(function(){
				synth.dispose();
				effect.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.Phaser", function(){
		it("effects sound", function(done){
			var synth = new MonoSynth();
			var effect = new Phaser();
			synth.connect(effect);
			effect.toMaster();
			synth.triggerAttackRelease("C4", noteDuration * 0.75);
			setTimeout(function(){
				synth.dispose();
				effect.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	describe("Tone.PingPongDelay", function(){
		it("effects sound", function(done){
			var synth = new MonoSynth();
			var effect = new PingPongDelay();
			synth.connect(effect);
			effect.toMaster();
			synth.triggerAttackRelease("C4", noteDuration * 0.1);
			setTimeout(function(){
				synth.dispose();
				effect.dispose();
				done();
			}, noteDuration * 1000);
		});
	});

	//run the tests
	mocha.run(); 
});