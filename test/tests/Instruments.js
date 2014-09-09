/* global it, describe, wasDisposed */

define(["tests/Core", "chai", "Tone/instrument/DuoSynth", "Tone/instrument/MonoSynth", "Tone/instrument/FMSynth",
	"Tone/instrument/PolySynth", "Tone/instrument/Sampler", "Tone/instrument/MultiSampler"], 
function(Tone, chai, DuoSynth, MonoSynth, FMSynth, PolySynth, Sampler, MultiSampler){

	var expect = chai.expect;

	describe("Tone.MonoSynth", function(){
		it("can be created and disposed", function(){
			var ms = new MonoSynth();
			ms.dispose();
			wasDisposed(ms, expect);
		});
	});

	describe("Tone.DuoSynth", function(){
		it("can be created and disposed", function(){
			var ds = new DuoSynth();
			ds.dispose();
			wasDisposed(ds, expect);
		});
	});

	describe("Tone.FMSynth", function(){
		it("can be created and disposed", function(){
			var fms = new FMSynth();
			fms.dispose();
			wasDisposed(fms, expect);
		});
	});

	describe("Tone.PolySynth", function(){
		it("can be created and disposed", function(){
			var ps = new PolySynth();
			ps.dispose();
			wasDisposed(ps, expect);
		});
	});

	describe("Tone.Sampler", function(){
		it("can be created and disposed", function(){
			var samp = new Sampler();
			samp.dispose();
			wasDisposed(samp, expect);
		});
	});

	describe("Tone.MultiSampler", function(){
		it("can be created and disposed", function(){
			var samp = new MultiSampler();
			samp.dispose();
			wasDisposed(samp, expect);
		});
	});
});