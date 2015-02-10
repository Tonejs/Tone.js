/* global it, describe */

define(["tests/Core", "chai", "Tone/instrument/DuoSynth", "Tone/instrument/MonoSynth", "Tone/instrument/FMSynth",
	"Tone/instrument/PolySynth", "Tone/instrument/Sampler", 
	"tests/Common", "Tone/instrument/Instrument", "Tone/instrument/PluckSynth", "Tone/instrument/AMSynth", 
	"Tone/instrument/NoiseSynth", "Tone/core/Buffer"], 
function(Tone, chai, DuoSynth, MonoSynth, FMSynth, PolySynth, Sampler, Test, Instrument, 
	PluckSynth, AMSynth, NoiseSynth, Buffer){

	var expect = chai.expect;

	Test.onlineContext();

	function extendsInstrument(InstrumentFactory){
		var inst = new InstrumentFactory();
		expect(inst).to.be.instanceOf(Instrument);
		inst.dispose();
	}

	describe("Tone.MonoSynth", function(){
		it("can be created and disposed", function(){
			var ms = new MonoSynth();
			ms.dispose();
			Test.wasDisposed(ms);
		});

		it("extends Instrument", function(){
			extendsInstrument(MonoSynth);
		});

		it("handles output connections", function(){
			var ms = new MonoSynth();
			Test.acceptsOutput(ms);
			ms.dispose();
		});

		it("outputs a sound", function(done){
			var ms;
			Test.outputsAudio(function(dest){
				ms = new MonoSynth();
				ms.connect(dest);
				ms.triggerAttack("C4");
			}, function(){
				ms.dispose();
				done();
			});
		});		

		it("can be get/set", function(){
			var ms = new MonoSynth();
			var values = {
				"oscillator" : {
					"type" : "triangle"
				},
				"filter" : {
					"Q" : 8,
				},
			};
			ms.set(values);
			expect(ms.get()).to.contain.keys(Object.keys(values));
			expect(ms.oscillator.type).to.equal(values.oscillator.type);
			expect(ms.filter.Q.value).to.equal(values.filter.Q);
			ms.dispose();
		});
	});

	describe("Tone.DuoSynth", function(){
		it("can be created and disposed", function(){
			var ds = new DuoSynth();
			ds.dispose();
			Test.wasDisposed(ds);
		});

		it("extends Instrument", function(){
			extendsInstrument(DuoSynth);
		});

		it("handles output connections", function(){
			var ds = new DuoSynth();
			Test.acceptsOutput(ds);
			ds.dispose();
		});

		it("outputs a sound", function(done){
			var ds;
			Test.outputsAudio(function(dest){
				ds = new DuoSynth();
				ds.connect(dest);
				ds.triggerAttack("C4");
			}, function(){
				ds.dispose();
				done();
			});
		});		
		it("can be get/set", function(){
			var ds = new DuoSynth();
			var values = {
				"voice0" : {
					"oscillator" : {
						"type" : "triangle"
					},
				},
				"voice1" : {
					"oscillator" : {
						"type" : "sine"
					},
				}
			};
			ds.set(values);
			expect(ds.get()).to.contain.keys(Object.keys(values));
			expect(ds.voice0.oscillator.type).to.equal(values.voice0.oscillator.type);
			expect(ds.voice1.oscillator.type).to.equal(values.voice1.oscillator.type);
			ds.dispose();
		});
	});

	describe("Tone.FMSynth", function(){
		it("can be created and disposed", function(){
			var fms = new FMSynth();
			fms.dispose();
			Test.wasDisposed(fms);
		});

		it("extends Instrument", function(){
			extendsInstrument(FMSynth);
		});

		it("handles output connections", function(){
			var fms = new FMSynth();
			Test.acceptsOutput(fms);
			fms.dispose();
		});

		it("outputs a sound", function(done){
			var fms;
			Test.outputsAudio(function(dest){
				fms = new FMSynth();
				fms.connect(dest);
				fms.triggerAttack("C4");
			}, function(){
				fms.dispose();
				done();
			});
		});	

		it("can be get/set", function(){
			var fms = new FMSynth();
			var values = {
				"carrier" : {
					"oscillator" : {
						"type" : "triangle"
					},
				},
				"modulator" : {
					"oscillator" : {
						"type" : "sine"
					},
				}
			};
			fms.set(values);
			expect(fms.get()).to.contain.keys(Object.keys(values));
			expect(fms.carrier.oscillator.type).to.equal(values.carrier.oscillator.type);
			expect(fms.modulator.oscillator.type).to.equal(values.modulator.oscillator.type);
			fms.dispose();
		});	
	});

	describe("Tone.PolySynth", function(){
		it("can be created and disposed", function(){
			var ps = new PolySynth();
			ps.dispose();
			Test.wasDisposed(ps);
		});

		it("extends Instrument", function(){
			extendsInstrument(PolySynth);
		});

		it("handles output connections", function(){
			var psynth = new PolySynth();
			Test.acceptsOutput(psynth);
			psynth.dispose();
		});

		it("outputs a sound", function(done){
			var psynth;
			Test.outputsAudio(function(dest){
				psynth = new PolySynth();
				psynth.connect(dest);
				psynth.triggerAttack("C4");
			}, function(){
				psynth.dispose();
				done();
			});
		});		

		it("accepts a chord", function(done){
			var psynth;
			Test.outputsAudio(function(dest){
				psynth = new PolySynth(4, DuoSynth);
				psynth.connect(dest);
				psynth.triggerAttackRelease(["C4", "E4", "G4"], "8n");
			}, function(){
				psynth.dispose();
				done();
			});
		});		
	});

	describe("Tone.Sampler", function(){
		it("can be created and disposed", function(){
			var samp = new Sampler();
			samp.dispose();
			Test.wasDisposed(samp);
		});

		it("extends Instrument", function(){
			extendsInstrument(Sampler);
		});

		it("handles output connections", function(){
			var samp = new Sampler();
			Test.acceptsOutput(samp);
			samp.dispose();
		});

		it("flattens a nested object of samples", function(done){
			var samp = new Sampler({
				"A" : {
					"1" : "./testAudio/kick.mp3"
				},
				"B" : "./testAudio/hh.mp3"
			});
			Buffer.onload = function(){
				samp.sample = "A.1";
				samp.dispose();
				done();
			};
		});
	});

	describe("Tone.PluckSynth", function(){
		it("can be created and disposed", function(){
			var pluck = new PluckSynth();
			pluck.dispose();
			Test.wasDisposed(pluck);
		});

		it("extends Instrument", function(){
			extendsInstrument(PluckSynth);
		});

		it("handles output connections", function(){
			var psynth = new PluckSynth();
			Test.acceptsOutput(psynth);
			psynth.dispose();
		});

		it("outputs a sound", function(done){
			var psynth;
			Test.outputsAudio(function(dest){
				psynth = new PluckSynth();
				psynth.connect(dest);
				psynth.triggerAttack("C4");
			}, function(){
				psynth.dispose();
				done();
			});
		});	

		it("handles getter/setter", function(){
			var psynth = new PluckSynth();
			var values = {
				"attackNoise" : 3,
				"dampening" : 5000,
				"resonance" : 0.3
			};
			psynth.set(values);
			expect(psynth.get()).to.contain.keys(Object.keys(values));
			expect(psynth.attackNoise).to.equal(values.attackNoise);
			expect(psynth.dampening.value).to.equal(values.dampening);
			expect(psynth.resonance.value).to.be.closeTo(values.resonance, 0.05);
			psynth.dispose();
		});	
	});

	describe("Tone.AMSynth", function(){
		it("can be created and disposed", function(){
			var ams = new AMSynth();
			ams.dispose();
			Test.wasDisposed(ams);
		});

		it("extends Instrument", function(){
			extendsInstrument(AMSynth);
		});

		it("handles output connections", function(){
			var ams = new AMSynth();
			Test.acceptsOutput(ams);
			ams.dispose();
		});

		it("outputs a sound", function(done){
			var ams;
			Test.outputsAudio(function(dest){
				ams = new AMSynth();
				ams.connect(dest);
				ams.triggerAttack("C4");
			}, function(){
				ams.dispose();
				done();
			});
		});	

		it("handles getters/setters", function(){
			var ams = new AMSynth();
			var values = {
				"harmonicity" : 3,
				"carrier" : {
					"filterEnvelope" : {
						"min" : 20,
					}
				},
				"modulator" : {
					"filterEnvelope" : {
						"min" : 400,
					}
				}
			};
			ams.set(values);
			expect(ams.get()).to.contain.keys(Object.keys(values));
			expect(ams.harmonicity).to.be.closeTo(values.harmonicity, 0.05);
			expect(ams.carrier.filterEnvelope.min).to.be.closeTo(values.carrier.filterEnvelope.min, 0.05);
			expect(ams.modulator.filterEnvelope.min).to.be.closeTo(values.modulator.filterEnvelope.min, 0.05);
			ams.dispose();
		});	
	});

	describe("Tone.NoiseSynth", function(){
		it("can be created and disposed", function(){
			var noiseSynth = new NoiseSynth();
			noiseSynth.dispose();
			Test.wasDisposed(noiseSynth);
		});

		it("extends Instrument", function(){
			extendsInstrument(NoiseSynth);
		});

		it("handles output connections", function(){
			var noiseSynth = new NoiseSynth();
			Test.acceptsOutput(noiseSynth);
			noiseSynth.dispose();
		});

		it("outputs a sound", function(done){
			var noiseSynth;
			Test.outputsAudio(function(dest){
				noiseSynth = new NoiseSynth();
				noiseSynth.connect(dest);
				noiseSynth.triggerAttack();
			}, function(){
				noiseSynth.dispose();
				done();
			});
		});		
	});
});