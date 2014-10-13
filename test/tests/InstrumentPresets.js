/* global it, describe, maxTimeout */

define(["tests/Core", "chai", "tests/Common", "Tone/instrument/MonoSynth", "Tone/instrument/preset/MonoSynth.preset",
	"Tone/instrument/DuoSynth", "Tone/instrument/preset/DuoSynth.preset",
	"Tone/instrument/FMSynth", "Tone/instrument/preset/FMSynth.preset"], 
function(Tone, chai, Test, MonoSynth, MonoSynthPresets, DuoSynth, DuoSynthPresets, FMSynth, FMSynthPresets){

	var expect = chai.expect;

	describe("Tone.MonoSynth Presets", function(){
		this.timeout(maxTimeout);

		it ("has valid presets", function(){
			var mono = new MonoSynth();
			Test.validatePresets(mono);
			mono.dispose();
		});
	});

	describe("Tone.DuoSynth Presets", function(){
		this.timeout(maxTimeout);

		it ("has valid presets", function(){
			var synth = new DuoSynth();
			Test.validatePresets(synth);
			synth.dispose();
		});
	});

	describe("Tone.FMSynth Presets", function(){
		this.timeout(maxTimeout);

		it ("has valid presets", function(){
			var synth = new FMSynth();
			Test.validatePresets(synth);
			synth.dispose();
		});
	});
});
