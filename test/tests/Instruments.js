/* global it, describe */

define(["tests/Core", "chai", "Tone/instrument/DuoSynth", "Tone/instrument/MonoSynth", "Tone/instrument/FMSynth",
	"Tone/instrument/PolySynth", "Tone/instrument/Sampler", "Tone/instrument/MultiSampler", 
	"tests/Common", "Tone/instrument/Instrument", "Tone/instrument/PluckSynth", "Tone/instrument/AMSynth"], 
function(Tone, chai, DuoSynth, MonoSynth, FMSynth, PolySynth, Sampler, MultiSampler, Test, Instrument, 
	PluckSynth, AMSynth){

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
	});

	describe("Tone.MultiSampler", function(){
		it("can be created and disposed", function(){
			var samp = new MultiSampler();
			samp.dispose();
			Test.wasDisposed(samp);
		});

		it("handles output connections", function(){
			var samp = new MultiSampler();
			Test.acceptsOutput(samp);
			samp.dispose();
		});

		it("extends Instrument", function(){
			extendsInstrument(MultiSampler);
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
	});
});