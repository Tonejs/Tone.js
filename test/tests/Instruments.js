/* global it, describe */

define(["tests/Core", "chai", "Tone/instrument/DuoSynth", "Tone/instrument/MonoSynth", "Tone/instrument/FMSynth",
	"Tone/instrument/PolySynth", "Tone/instrument/Sampler", "Tone/instrument/MultiSampler", 
	"tests/Common", "Tone/instrument/Instrument", "Tone/instrument/PluckSynth"], 
function(Tone, chai, DuoSynth, MonoSynth, FMSynth, PolySynth, Sampler, MultiSampler, Test, Instrument, PluckSynth){

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
	});

	describe("Tone.MultiSampler", function(){
		it("can be created and disposed", function(){
			var samp = new MultiSampler();
			samp.dispose();
			Test.wasDisposed(samp);
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
	});
});