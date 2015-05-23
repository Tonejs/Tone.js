/* global it, describe, maxTimeout*/

define(["tests/Core", "chai", "Tone/component/CrossFade", "Tone/core/Master", "Tone/signal/Signal", 
"Recorder", "Tone/component/Panner", "Tone/component/LFO", "Tone/component/Gate", 
"Tone/component/Follower", "Tone/component/Envelope", "Tone/component/Filter", "Tone/component/EQ3", 
"Tone/component/Merge", "Tone/component/Split", "tests/Common", "Tone/component/AmplitudeEnvelope", 
"Tone/component/LowpassCombFilter", "Tone/component/FeedbackCombFilter", "Tone/component/Mono", 
"Tone/component/MultibandSplit", "Tone/component/Compressor", "Tone/component/PanVol",
"Tone/component/MultibandCompressor", "Tone/component/ScaledEnvelope", "Tone/component/Limiter", 
"Tone/core/Transport", "Tone/component/Volume", "Tone/component/MidSideSplit",
"Tone/component/MidSideMerge", "Tone/component/MidSideCompressor"],
function(coreTest, chai, CrossFade, Master, Signal, Recorder, Panner, LFO, Gate, Follower, Envelope, 
	Filter, EQ3, Merge, Split, Test, AmplitudeEnvelope, LowpassCombFilter, FeedbackCombFilter,
	Mono, MultibandSplit, Compressor, PanVol, MultibandCompressor, ScaledEnvelope, Limiter, Transport, 
	Volume, MidSideSplit, MidSideMerge, MidSideCompressor){
	var expect = chai.expect;

	Master.mute = true;

	describe("Tone.CrossFade", function(){
		this.timeout(maxTimeout);

		var crossFade, drySignal, wetSignal, recorder;

		it("can be created and disposed", function(){
			var dw = new CrossFade();
			dw.dispose();
			Test.wasDisposed(dw);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var crossFade = new CrossFade();
			Test.acceptsInput(crossFade, 0);
			Test.acceptsInput(crossFade, 1);
			Test.acceptsOutput(crossFade);
			crossFade.dispose();
		});

		it("pass 100% dry signal", function(done){
			Test.offlineTest(0.1, function(dest){
				crossFade = new CrossFade();
				drySignal = new Signal(10);
				wetSignal = new Signal(20);
				drySignal.connect(crossFade, 0, 0);
				wetSignal.connect(crossFade, 0, 1);
				recorder = new Recorder();
				crossFade.fade.value = 0;
				crossFade.connect(dest);
			}, function(sample){
				expect(sample).to.closeTo(10, 0.01);
			}, function(){
				crossFade.dispose();
				drySignal.dispose();
				wetSignal.dispose();
				done();
			});
		});

		it("pass 100% wet signal", function(done){
			Test.offlineTest(0.1, function(dest){
				crossFade = new CrossFade();
				drySignal = new Signal(10);
				wetSignal = new Signal(20);
				drySignal.connect(crossFade, 0, 0);
				wetSignal.connect(crossFade, 0, 1);
				recorder = new Recorder();
				crossFade.fade.value = 1;
				crossFade.connect(dest);
			}, function(sample){
				expect(sample).to.closeTo(20, 0.01);
			}, function(){
				crossFade.dispose();
				drySignal.dispose();
				wetSignal.dispose();
				done();
			});
		});
		
		it("can mix two signals", function(done){
			Test.offlineTest(0.1, function(dest){
				crossFade = new CrossFade();
				drySignal = new Signal(0.5);
				wetSignal = new Signal(0.5);
				drySignal.connect(crossFade, 0, 0);
				wetSignal.connect(crossFade, 0, 1);
				recorder = new Recorder();
				crossFade.fade.value = 0.5;
				crossFade.connect(dest);
			}, function(sample){
				expect(sample).to.closeTo(0.707, 0.01);
			}, function(){
				crossFade.dispose();
				drySignal.dispose();
				wetSignal.dispose();
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

		it("handles input and output connections", function(){
			Test.onlineContext();
			var panner = new Panner();
			Test.acceptsInputAndOutput(panner);
			panner.dispose();
		});

		it("passes the incoming signal through", function(done){
			var panner;
			Test.passesAudio(function(input, output){
				panner = new Panner();
				input.connect(panner);
				panner.connect(output);
			}, function(){
				panner.dispose();
				done();
			});
		});

		it("can pan an incoming signal", function(done){
			//pan hard right
			var signal, panner;
			Test.offlineStereoTest(0.1, function(dest){
				panner = new Panner();
				signal = new Signal(1);
				signal.connect(panner);
				panner.pan.value = 1;
				panner.connect(dest);
			}, function(L, R){
				expect(L).to.be.closeTo(0, 0.01);
				expect(R).to.be.closeTo(1, 0.01);
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

		it("handles output connections", function(){
			Test.onlineContext();
			var lfo = new LFO();
			Test.acceptsOutput(lfo);
			lfo.dispose();
		});

		it("can sync to Transport", function(done){
			var lfo;
			Test.offlineTest(0.1, function(dest){
				Transport.bpm.value = 120;
				lfo = new LFO(2);
				lfo.frequency.connect(dest);
				lfo.sync();
				Transport.bpm.value = 240;
			}, function(freq){
				expect(freq).to.be.closeTo(4, 0.001);
			}, function(){
				lfo.dispose();
				done();
			});
		});

		it("can unsync to Transport", function(done){
			var lfo;
			Test.offlineTest(0.1, function(dest){
				Transport.bpm.value = 120;
				lfo = new LFO(2);
				lfo.frequency.connect(dest);
				lfo.sync();
				Transport.bpm.value = 240;
				lfo.unsync();
			}, function(freq){
				expect(freq).to.be.closeTo(2, 0.001);
			}, function(){
				lfo.dispose();
				done();
			});
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
				lfo.min = 15;
				lfo.max  = 18;
			}, function(sample){
				expect(sample).to.be.within(15, 18);
			}, function(){
				lfo.dispose();
				done();
			});
		});

		it("handles getters/setters as objects", function(){
			var lfo = new LFO();
			var values = {
				"type" : "square",
				"min" : -1,
				"max" : 2,
				"phase" : 180,
				"frequency" : "8n",
			};
			lfo.set(values);
			expect(lfo.get()).to.contain.keys(Object.keys(values));
			expect(lfo.type).to.equal(values.type);
			expect(lfo.min).to.equal(values.min);
			expect(lfo.max).to.equal(values.max);
			expect(lfo.phase).to.equal(values.phase);
			lfo.dispose();
		});
	});

	describe("Tone.Gate", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var g = new Gate();
			g.dispose();
			Test.wasDisposed(g);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var gate = new Gate();
			Test.acceptsInputAndOutput(gate);
			gate.dispose();
		});

		it("handles getter/setters", function(){
			Test.onlineContext();
			var gate = new Gate();
			var values = {
				"attack" : "4n",
				"release" : "8n",
				"threshold" : -25,
			};
			gate.set(values);
			expect(gate.get()).to.have.keys(["attack", "release", "threshold"]);
			expect(gate.attack).to.equal(values.attack);
			expect(gate.decay).to.equal(values.decay);
			expect(gate.threshold).to.be.closeTo(values.threshold, 0.1);
			gate.dispose();
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
					expect(sample).to.be.closeTo(level, 0.001);
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

		it("handles input and output connections", function(){
			Test.onlineContext();
			var foll = new Follower(0.1, 0.5);
			Test.acceptsInputAndOutput(foll);
			foll.dispose();
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

		it("handles getter/setter as Object", function(){
			var foll = new Follower();
			var values = {
				"attack" : "8n",
				"release" : "4n"
			};
			foll.set(values);
			expect(foll.get()).to.have.keys(["attack", "release"]);
			expect(foll.get()).to.deep.equal(values);
			foll.dispose();
		});
	});


	describe("Tone.Envelope", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var e = new Envelope();
			e.dispose();
			Test.wasDisposed(e);
		});

		it("handles output connections", function(){
			Test.onlineContext();
			var e = new Envelope();
			Test.acceptsOutput(e);
			e.dispose();
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
					expect(sample).to.be.within(0.499, 0.51);
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

		it ("can get and set values an Objects", function(){
			var env = new Envelope();
			var values = {
				"attack" : 0,
				"decay" : 0.5,
				"sustain" : 1,
				"release" : "4n"
			};
			env.set(values);
			expect(env.get()).to.contain.keys(Object.keys(values));
			env.dispose();
		});

		it ("can schedule an attackRelease", function(done){
			var env;
			Test.offlineTest(0.7, function(dest){
				env = new Envelope(0.1, 0.2, 0.5, 0.1);
				env.connect(dest);
				env.triggerAttackRelease(0.4, 0);
			}, function(sample, time){
				if (time < 0.1){
					expect(sample).to.be.within(0, 1);
				} else if (time < 0.3){
					expect(sample).to.be.within(0.5, 1);
				} else if (time < 0.4){
					expect(sample).to.be.within(0.499, 0.51);
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
	});


	describe("Tone.Filter", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var f = new Filter();
			f.dispose();
			Test.wasDisposed(f);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var f = new Filter();
			Test.acceptsInputAndOutput(f);
			f.dispose();
		});

		it("can set/get values as an Object", function(){
			var f = new Filter();
			var values = {
				"type" : "highpass",
				"frequency" : 440,
				"rolloff" : -24,
				"Q" : 2,
				"gain" : -6,
			};
			f.set(values);
			expect(f.get()).to.have.keys(["type", "frequency", "rolloff", "Q", "gain"]);
			expect(f.type).to.equal(values.type);
			expect(f.frequency.value).to.equal(values.frequency);
			expect(f.rolloff).to.equal(values.rolloff);
			expect(f.Q.value).to.equal(values.Q);
			expect(f.gain.value).to.be.closeTo(values.gain, 0.04);
			f.dispose();
		});

		it("passes the incoming signal through", function(done){
			var filter;
			Test.passesAudio(function(input, output){
				filter = new Filter();
				input.connect(filter);
				filter.connect(output);
			}, function(){
				filter.dispose();
				done();
			});
		});

		it ("can take parameters as both an object and as arguments", function(){
			Test.onlineContext();
			var f0 = new Filter({
				"frequency" : 1000,
				"type" : "highpass"
			});
			expect(f0.frequency.value).to.equal(1000);
			expect(f0.type).to.equal("highpass");
			f0.dispose();
			var f1 = new Filter(200, "bandpass");
			expect(f1.frequency.value).to.equal(200);
			expect(f1.type).to.equal("bandpass");
			f1.dispose();
		});
	});

	describe("Tone.EQ33", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var eq = new EQ3();
			eq.dispose();
			Test.wasDisposed(eq);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var eq = new EQ3();
			Test.acceptsInputAndOutput(eq);
			eq.dispose();
		});

		it("passes the incoming signal through", function(done){
			var eq;
			Test.passesAudio(function(input, output){
				eq = new EQ3();
				input.connect(eq);
				eq.connect(output);
			}, function(){
				eq.dispose();
				done();
			});
		});

		it("can set/get values as an Object", function(){
			Test.onlineContext();
			var eq = new EQ3();
			var values = {
				"high" : -12,
				"mid" : -24,
				"low" : -1
			};
			eq.set(values);
			expect(eq.high.value).to.be.closeTo(values.high, 0.1);
			expect(eq.mid.value).to.be.closeTo(values.mid, 0.1);
			expect(eq.low.value).to.be.closeTo(values.low, 0.1);
			eq.dispose();
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

		it("handles input and output connections", function(){
			Test.onlineContext();
			var mer = new Merge();
			Test.acceptsInput(mer.left);
			Test.acceptsInput(mer.right);
			Test.acceptsOutput(mer);
			mer.dispose();
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

		it("handles input and output connections", function(){
			Test.onlineContext();
			var split = new Split();
			Test.acceptsInput(split);
			Test.acceptsOutput(split.left);
			Test.acceptsOutput(split.right);
			split.dispose();
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

		it("handles input and output connections", function(){
			Test.onlineContext();
			var ampEnv = new AmplitudeEnvelope();
			Test.acceptsInputAndOutput(ampEnv);
			ampEnv.dispose();
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

		it("handles input and output connections", function(){
			Test.onlineContext();
			var lfcf = new LowpassCombFilter();
			Test.acceptsInputAndOutput(lfcf);
			lfcf.dispose();
		});

		it("passes the incoming signal through", function(done){
			var lfcf;
			Test.passesAudio(function(input, output){
				lfcf = new LowpassCombFilter();
				input.connect(lfcf);
				lfcf.connect(output);
			}, function(){
				lfcf.dispose();
				done();
			});
		});

		it("handles getters/setters", function(){
			Test.onlineContext();
			var lfcf = new LowpassCombFilter();
			var values = {
				"resonance" : 0.4,
				"dampening" : 4000,
				"delayTime" : "4n"
			};
			lfcf.set(values);
			expect(lfcf.get()).to.have.keys(["resonance", "dampening", "delayTime"]);
			lfcf.dispose();
		});
	});

	describe("Tone.FeedbackCombFilter", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var fbcf = new FeedbackCombFilter();
			fbcf.dispose();
			Test.wasDisposed(fbcf);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var fbcf = new FeedbackCombFilter();
			Test.acceptsInputAndOutput(fbcf);
			fbcf.dispose();
		});

		it("can set delayTime", function(){
			Test.onlineContext();
			var fbcf = new FeedbackCombFilter();
			fbcf.delayTime.value = "4n";
			var quarterSeconds = fbcf.toSeconds("4n");
			expect(fbcf.delayTime.value).to.equal(quarterSeconds);
			fbcf.dispose();
		});

		it("passes the incoming signal through", function(done){
			var fbcf;
			Test.passesAudio(function(input, output){
				fbcf = new FeedbackCombFilter();
				input.connect(fbcf);
				fbcf.connect(output);
			}, function(){
				fbcf.dispose();
				done();
			});
		});
	});

	describe("Tone.Mono", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var mono = new Mono();
			mono.dispose();
			Test.wasDisposed(mono);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var mono = new Mono();
			Test.acceptsInputAndOutput(mono);
			mono.dispose();
		});

		it("passes the incoming signal through", function(done){
			var mono;
			Test.passesAudio(function(input, output){
				mono = new FeedbackCombFilter();
				input.connect(mono);
				mono.connect(output);
			}, function(){
				mono.dispose();
				done();
			});
		});
	});

	describe("Tone.MultibandSplit", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var mband = new MultibandSplit();
			mband.dispose();
			Test.wasDisposed(mband);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var mband = new MultibandSplit();
			Test.acceptsInput(mband);
			Test.acceptsOutput(mband.low);
			Test.acceptsOutput(mband, 1);
			Test.acceptsOutput(mband, 2);
			mband.dispose();
		});
	});

	describe("Tone.Compressor", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var comp = new Compressor();
			comp.dispose();
			Test.wasDisposed(comp);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var comp = new Compressor();
			Test.acceptsInputAndOutput(comp);
			comp.dispose();
		});

		it("passes the incoming signal through", function(done){
			var comp;
			Test.passesAudio(function(input, output){
				comp = new Compressor();
				input.connect(comp);
				comp.connect(output);
			}, function(){
				comp.dispose();
				done();
			});
		});

		it("can be get and set through object", function(){
			var comp = new Compressor();
			var values = {
				"ratio" : 22,
				"threshold" : -30,
				"release" : 0.5,
				"attack" : 0.03,
				"knee" : 20
			};
			comp.set(values);
			expect(comp.get()).to.have.keys(["ratio", "threshold", "release", "attack", "ratio"]);
			comp.dispose();
		});

		it("can get/set all interfaces", function(){
			var comp = new Compressor();
			var values = {
				"ratio" : 22,
				"threshold" : -30,
				"release" : 0.5,
				"attack" : 0.03,
				"knee" : 20
			};
			comp.ratio.value = values.ratio;
			comp.threshold.value = values.threshold;
			comp.release.value = values.release;
			comp.attack.value = values.attack;
			comp.knee.value = values.knee;
			expect(comp.ratio.value).to.equal(values.ratio);
			expect(comp.threshold.value).to.equal(values.threshold);
			expect(comp.release.value).to.equal(values.release);
			expect(comp.attack.value).to.be.closeTo(values.attack, 0.01);
			expect(comp.knee.value).to.equal(values.knee);
			comp.dispose();
		});
	});

	describe("Tone.PanVol", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var panvol = new PanVol();
			panvol.dispose();
			Test.wasDisposed(panvol);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var panvol = new PanVol();
			Test.acceptsInputAndOutput(panvol);
			panvol.dispose();
		});

		it("passes the incoming signal through", function(done){
			var panvol;
			Test.passesAudio(function(input, output){
				panvol = new PanVol();
				input.connect(panvol);
				panvol.connect(output);
			}, function(){
				panvol.dispose();
				done();
			});
		});

		it("can set the pan and volume", function(){
			var panvol = new PanVol();
			panvol.volume.value = -12;
			panvol.pan.value = 0;
			expect(panvol.volume.value).to.be.closeTo(-12, 0.1);
			expect(panvol.pan.value).to.be.equal(0);
		});
	});

	describe("Tone.MultibandCompressor", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var comp = new MultibandCompressor();
			comp.dispose();
			Test.wasDisposed(comp);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var comp = new MultibandCompressor();
			Test.acceptsInputAndOutput(comp);
			comp.dispose();
		});

		it("passes the incoming signal through", function(done){
			var comp;
			Test.passesAudio(function(input, output){
				comp = new MultibandCompressor();
				input.connect(comp);
				comp.connect(output);
			}, function(){
				comp.dispose();
				done();
			});
		});

		it("handles getters/setters", function(){
			Test.onlineContext();
			var comp = new MultibandCompressor();
			var values = {
				"low" : {
					"attack" : 0.3
				},
				"mid" : {
					"threshold" : -12
				}
			};
			comp.set(values);
			expect(comp.get()).to.have.deep.property("low.attack");
			expect(comp.get()).to.have.deep.property("mid.threshold");
			expect(comp.low.attack.value).to.be.closeTo(0.3, 0.05);
			expect(comp.mid.threshold.value).to.be.closeTo(-12, 0.05);
			comp.dispose();
		});
	});

	describe("Tone.ScaledEnvelope", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var e = new ScaledEnvelope();
			e.dispose();
			Test.wasDisposed(e);
		});

		it("handles output connections", function(){
			Test.onlineContext();
			var e = new ScaledEnvelope();
			Test.acceptsOutput(e);
			e.dispose();
		});

		it ("can take parameters as an object", function(){
			var e0 = new ScaledEnvelope({
				"attack" : 0,
				"decay" : 0.5,
				"sustain" : 1,
				"min" : 10,
				"max": 5
			});
			expect(e0.attack).to.equal(0);
			expect(e0.decay).to.equal(0.5);
			expect(e0.sustain).to.equal(1);
			e0.dispose();
		});

		it ("can schedule an ADSR envelope", function(done){
			var env;
			Test.offlineTest(0.7, function(dest){
				env = new ScaledEnvelope({
					"attack" : 0.1,
					"decay" : 0.2,
					"sustain" : 0.5,
					"release" : 0.1,
					"min" : 0,
					"max": 100
				});
				env.connect(dest);
				env.triggerAttack(0);
				env.triggerRelease(0.4);
			}, function(sample, time){
				if (time < 0.1){
					expect(sample).to.be.within(0, 100);
				} else if (time < 0.3){
					expect(sample).to.be.within(0.5, 100);
				} else if (time < 0.4){
					expect(sample).to.be.within(0.5, 51);
				} else if (time < 0.5){
					expect(sample).to.be.within(0, 51);
				} else {
					expect(sample).to.be.below(1);
				}
			}, function(){
				env.dispose();
				done();
			});
		});

		it ("can scale the range", function(done){
			var env;
			Test.offlineTest(0.7, function(dest){
				env = new ScaledEnvelope(0.1, 0.2, 0.5, 0.1);
				env.connect(dest);
				env.min = 5;
				env.max = 10;
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

	describe("Tone.Limiter", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var lim = new Limiter();
			lim.dispose();
			Test.wasDisposed(lim);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var lim = new Limiter();
			Test.acceptsInputAndOutput(lim);
			lim.dispose();
		});

		it("can get and set values", function(){
			Test.onlineContext();
			var lim = new Limiter();
			lim.threshold.value = -12;
			expect(lim.threshold.value).to.be.closeTo(-12, 0.05);
			lim.dispose();
		});

		it("passes the incoming signal through", function(done){
			var lim;
			Test.passesAudio(function(input, output){
				lim = new Limiter();
				input.connect(lim);
				lim.connect(output);
			}, function(){
				lim.dispose();
				done();
			});
		});
	});

	describe("Tone.Volume", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var vol = new Volume();
			vol.dispose();
			Test.wasDisposed(vol);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var vol = new Volume();
			Test.acceptsInputAndOutput(vol);
			vol.dispose();
		});

		it("can get and set values", function(){
			Test.onlineContext();
			var vol = new Volume();
			vol.volume.value = -12;
			expect(vol.volume.value).to.be.closeTo(-12, 0.05);
			vol.dispose();
		});

		it("passes the incoming signal through", function(done){
			var vol;
			Test.passesAudio(function(input, output){
				vol = new Volume();
				input.connect(vol);
				vol.connect(output);
			}, function(){
				vol.dispose();
				done();
			});
		});
	});

	describe("Tone.MidSideSplit", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var split = new MidSideSplit();
			split.dispose();
			Test.wasDisposed(split);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var split = new MidSideSplit();
			Test.acceptsInput(split);
			Test.acceptsOutput(split.mid);
			Test.acceptsOutput(split.side);
			split.dispose();
		});
	});

	describe("Tone.MidSideMerge", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var merge = new MidSideMerge();
			merge.dispose();
			Test.wasDisposed(merge);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var merge = new MidSideMerge();
			Test.acceptsInput(merge.side);
			Test.acceptsInput(merge.mid);
			Test.acceptsOutput(merge);
			merge.dispose();
		});

		it("passes the mid signal through", function(done){
			var merge;
			Test.passesAudio(function(input, output){
				merge = new MidSideMerge();
				input.connect(merge.mid);
				merge.connect(output);
			}, function(){
				merge.dispose();
				done();
			});
		});

		it("passes the side signal through", function(done){
			var merge;
			Test.passesAudio(function(input, output){
				merge = new MidSideMerge();
				input.connect(merge.side);
				merge.connect(output);
			}, function(){
				merge.dispose();
				done();
			});
		});
	});

	describe("Tone.MidSideCompressor", function(){
		this.timeout(maxTimeout);

		it("can be created and disposed", function(){
			var comp = new MidSideCompressor();
			comp.dispose();
			Test.wasDisposed(comp);
		});

		it("handles input and output connections", function(){
			Test.onlineContext();
			var comp = new MidSideCompressor();
			Test.acceptsInput(comp);
			Test.acceptsOutput(comp);
			comp.dispose();
		});

		it("passes signal through", function(done){
			var comp;
			Test.passesAudio(function(input, output){
				comp = new MidSideCompressor();
				input.connect(comp);
				comp.connect(output);
			}, function(){
				comp.dispose();
				done();
			});
		});
	});
});