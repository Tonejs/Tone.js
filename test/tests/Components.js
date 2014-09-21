/* global it, describe, maxTimeout, after*/

define(["tests/Core", "chai", "Tone/component/DryWet", "Tone/core/Master", "Tone/signal/Signal", 
"Tone/component/Recorder", "Tone/component/Panner", "Tone/component/LFO", "Tone/component/Gate", 
"Tone/component/Follower", "Tone/component/Envelope", "Tone/component/Filter", "Tone/component/EQ", 
"Tone/component/Merge", "Tone/component/Split", "tests/Common", "Tone/component/AmplitudeEnvelope", 
"Tone/component/LowpassCombFilter", "Tone/component/FeedbackCombFilter", "Tone/component/Mono"],
function(coreTest, chai, DryWet, Master, Signal, Recorder, Panner, LFO, Gate, Follower, Envelope, 
	Filter, EQ, Merge, Split, Test, AmplitudeEnvelope, LowpassCombFilter, FeedbackCombFilter, Mono){
	var expect = chai.expect;

	Master.mute();

	describe("Tone.DryWet", function(){
		this.timeout(maxTimeout);

		var dryWet, drySignal, wetSignal, recorder;

		it("can be created and disposed", function(){
			var dw = new DryWet();
			dw.dispose();
			Test.wasDisposed(dw);
		});

		it("pass 100% dry signal", function(done){
			Test.offlineTest(0.1, function(dest){
				dryWet = new DryWet();
				drySignal = new Signal(10);
				wetSignal = new Signal(20);
				drySignal.connect(dryWet.dry);
				wetSignal.connect(dryWet.wet);
				recorder = new Recorder();
				dryWet.setDry(1);
				dryWet.connect(dest);
			}, function(sample){
				expect(sample).to.equal(10);
			}, function(){
				dryWet.dispose();
				drySignal.dispose();
				wetSignal.dispose();
				done();
			});
		});


		it("pass 100% wet signal", function(done){
			Test.offlineTest(0.1, function(dest){
				dryWet = new DryWet();
				drySignal = new Signal(10);
				wetSignal = new Signal(20);
				drySignal.connect(dryWet.dry);
				wetSignal.connect(dryWet.wet);
				recorder = new Recorder();
				dryWet.setWet(1);
				dryWet.connect(dest);
			}, function(sample){
				expect(sample).to.equal(20);
			}, function(){
				dryWet.dispose();
				drySignal.dispose();
				wetSignal.dispose();
				done();
			});
		});
		
		it("can mix two signals", function(done){
			Test.offlineTest(0.1, function(dest){
				dryWet = new DryWet();
				drySignal = new Signal(10);
				wetSignal = new Signal(20);
				drySignal.connect(dryWet.dry);
				wetSignal.connect(dryWet.wet);
				recorder = new Recorder();
				dryWet.setWet(0.5);
				dryWet.connect(dest);
			}, function(sample){
				expect(sample).to.equal(15);
			}, function(){
				dryWet.dispose();
				drySignal.dispose();
				wetSignal.dispose();
				done();
			});
		});
	});

	describe("Tone.Recorder", function(){
		this.timeout(maxTimeout);

		var recorder = new Recorder();

		after(function(){
			recorder.dispose();
		});

		it("can be created and disposed", function(){
			var rec = new Recorder();
			rec.dispose();
			Test.wasDisposed(rec);
		});

		it("can record an incoming signal", function(done){
			Test.onlineContext();
			var sig = new Signal(1);
			sig.connect(recorder);
			recorder.record(0.1, 0.1, function(buffers){
				var buffer = buffers[0];
				for (var i = 0; i < buffer.length; i++){
					expect(buffer[i]).to.equal(1);
				}
				sig.dispose();
				done();
			});
		});
	});

	describe("Tone.Panner", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var panner = new Panner();
			panner.dispose();
			Test.wasDisposed(panner);
		});

		it("can pan an incoming signal", function(done){
			//pan hard right
			var signal, panner;
			Test.offlineStereoTest(0.1, function(dest){
				signal = new Signal(1);
				panner = new Panner();
				signal.connect(panner);
				panner.setPan(1);
				panner.connect(dest);
			}, function(L, R){
				expect(L).to.equal(0);
				expect(R).to.equal(1);
			}, function(){
				panner.dispose();
				signal.dispose();
				done();
			});
		});
	});

	describe("Tone.LFO", function(){
		
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var l = new LFO();
			l.dispose();
			Test.wasDisposed(l);
		});

		it("can be started and stopped", function(){
			Test.onlineContext();
			var lfo = new LFO();
			lfo.start();
			lfo.stop();
			lfo.dispose();
		});

		it("can be creates an oscillation in a specific range", function(done){
			var lfo;
			Test.offlineTest(0.1, function(dest){
				lfo = new LFO(100, 10, 20);
				lfo.connect(dest);
				lfo.start();
			}, function(sample){
				expect(sample).to.be.within(10, 20);
			}, function(){
				lfo.dispose();
				done();
			});
		});

		it("can change the oscillation range", function(done){
			var lfo;
			Test.offlineTest(0.1, function(dest){
				lfo = new LFO(100, 10, 20);
				lfo.connect(dest);
				lfo.start();
				lfo.setMin(15);
				lfo.setMax(18);
			}, function(sample){
				expect(sample).to.be.within(15, 18);
			}, function(){
				lfo.dispose();
				done();
			});
		});
	});

	describe("Tone.Gate", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var g = new Gate();
			g.dispose();
			Test.wasDisposed(g);
		});

		it("won't let signals below a db thresh through", function(done){
			var gate, sig;
			Test.offlineTest(0.5, function(dest){
				gate = new Gate(-10, 0.01);
				sig = new Signal(gate.dbToGain(-11));
				sig.connect(gate);
				gate.connect(dest);
			}, function(sample){
				expect(sample).to.equal(0);
			}, function(){
				gate.dispose();
				sig.dispose();
				done();
			});
		});

		it("lets signals above the db thresh through", function(done){
			var gate, sig, level;
			Test.offlineTest(0.5, function(dest){
				gate = new Gate(-8, 0.01);
				level = gate.dbToGain(-6);
				sig = new Signal(level);
				sig.connect(gate);
				gate.connect(dest);
			}, function(sample, time){
				if (time >= 0.1){
					expect(sample).to.equal(level);
				} 
			}, function(){
				gate.dispose();
				sig.dispose();
				done();
			});
		});
	});

	describe("Tone.Follower", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var f = new Follower();
			f.dispose();
			Test.wasDisposed(f);
		});

		it("smoothes the incoming signal", function(done){
			var foll, sig;
			Test.offlineTest(0.1, function(dest){
				foll = new Follower(0.1, 0.5);
				sig = new Signal(0);
				sig.connect(foll);
				foll.connect(dest);
				sig.setValueAtTime(1, "+0.1");
			}, function(sample){
				expect(sample).to.lessThan(1);
			}, function(){
				foll.dispose();
				sig.dispose();
				done();
			});
		});

	});


	describe("Tone.Envelope", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var e = new Envelope();
			e.dispose();
			Test.wasDisposed(e);
		});

		it ("can take parameters as both an object and as arguments", function(){
			var e0 = new Envelope({
				"attack" : 0,
				"decay" : 0.5,
				"sustain" : 1
			});
			expect(e0.attack).to.equal(0);
			expect(e0.decay).to.equal(0.5);
			expect(e0.sustain).to.equal(1);
			e0.dispose();
			var e1 = new Envelope(0.1, 0.2, 0.3);
			expect(e1.attack).to.equal(0.1);
			expect(e1.decay).to.equal(0.2);
			expect(e1.sustain).to.equal(0.3);
			e1.dispose();
		});

		it ("can schedule an ADSR envelope", function(done){
			var env;
			Test.offlineTest(0.7, function(dest){
				env = new Envelope(0.1, 0.2, 0.5, 0.1);
				env.connect(dest);
				env.triggerAttack(0);
				env.triggerRelease(0.4);
			}, function(sample, time){
				if (time < 0.1){
					expect(sample).to.be.within(0, 1);
				} else if (time < 0.3){
					expect(sample).to.be.within(0.5, 1);
				} else if (time < 0.4){
					expect(sample).to.be.within(0.5, 0.51);
				} else if (time < 0.5){
					expect(sample).to.be.within(0, 0.51);
				} else {
					expect(sample).to.be.below(0.1);
				}
			}, function(){
				env.dispose();
				done();
			});
		});

		it ("can scale the range", function(done){
			var env;
			Test.offlineTest(0.7, function(dest){
				env = new Envelope(0.1, 0.2, 0.5, 0.1);
				env.connect(dest);
				env.setMin(5);
				env.setMax(10);
				env.triggerAttack(0.1);
			}, function(sample, time){
				if (time < 0.1){
					expect(sample).to.be.closeTo(5, 0.1);
				} else if (time < 0.2){
					expect(sample).to.be.within(5, 10);
				}
			}, function(){
				env.dispose();
				done();
			});
		});

	});


	describe("Tone.Filter", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var f = new Filter();
			f.dispose();
			Test.wasDisposed(f);
		});

		it ("can take parameters as both an object and as arguments", function(){
			Test.onlineContext();
			var f0 = new Filter({
				"frequency" : 1000,
				"type" : "highpass"
			});
			expect(f0.frequency.getValue()).to.equal(1000);
			expect(f0.getType()).to.equal("highpass");
			f0.dispose();
			var f1 = new Filter(200, "bandpass");
			expect(f1.frequency.getValue()).to.equal(200);
			expect(f1.getType()).to.equal("bandpass");
			f1.dispose();
		});
	});

	describe("Tone.EQ", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var eq = new EQ();
			eq.dispose();
			Test.wasDisposed(eq);
		});

	});

	//MERGE
	describe("Tone.Merge", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var mer = new Merge();
			mer.dispose();
			Test.wasDisposed(mer);
		});

		it("merge two signal into one stereo signal", function(done){
			//make an oscillator to drive the signal
			var sigL, sigR, merger;
			Test.offlineStereoTest(0.1, function(dest){
				sigL = new Signal(1);
				sigR = new Signal(2);
				merger = new Merge();
				sigL.connect(merger.left);
				sigR.connect(merger.right);
				merger.connect(dest);
			}, function(L, R){
				expect(L).to.equal(1);
				expect(R).to.equal(2);
			}, function(){
				sigL.dispose();
				sigR.dispose();
				merger.dispose();
				done();
			});
		});
	});

	describe("Tone.Split", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var split = new Split();
			split.dispose();
			Test.wasDisposed(split);
		});

		it("merges two signal into one stereo signal and then split them back into two signals on left side", function(done){
			var sigL, sigR, merger, split;			
			Test.offlineTest(0.1, function(dest){
				sigL = new Signal(1);
				sigR = new Signal(2);
				merger = new Merge();
				split = new Split();
				sigL.connect(merger.left);
				sigR.connect(merger.right);
				merger.connect(split);
				split.connect(dest, 0, 0);
			}, function(sample){
				expect(sample).to.equal(1);
			}, function(){
				sigL.dispose();
				sigR.dispose();
				merger.dispose();
				split.dispose();
				done();
			});
		});

		it("merges two signal into one stereo signal and then split them back into two signals on right side", function(done){
			var sigL, sigR, merger, split;			
			Test.offlineTest(0.1, function(dest){
				sigL = new Signal(1);
				sigR = new Signal(2);
				merger = new Merge();
				split = new Split();
				sigL.connect(merger.left);
				sigR.connect(merger.right);
				merger.connect(split);
				split.connect(dest, 1, 0);
			}, function(sample){
				expect(sample).to.equal(2);
			}, function(){
				sigL.dispose();
				sigR.dispose();
				merger.dispose();
				split.dispose();
				done();
			});
		});
	});

	describe("Tone.AmplitudeEnvelope", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var ampEnv = new AmplitudeEnvelope();
			ampEnv.dispose();
			Test.wasDisposed(ampEnv);
		});

		it("inherits all methods from Envelope", function(){
			var ampEnv = new AmplitudeEnvelope();
			expect(ampEnv).to.be.instanceOf(Envelope);
			ampEnv.dispose();
		});
	});

	describe("Tone.LowpassCombFilter", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var lfcf = new LowpassCombFilter();
			lfcf.dispose();
			Test.wasDisposed(lfcf);
		});
	});

	describe("Tone.FeedbackCombFilter", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var fbcf = new FeedbackCombFilter();
			fbcf.dispose();
			Test.wasDisposed(fbcf);
		});
	});

	describe("Tone.Mono", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var mono = new Mono();
			mono.dispose();
			Test.wasDisposed(mono);
		});
	});
});