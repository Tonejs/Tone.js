/* global it, describe, maxTimeout */

define(["tests/Core", "chai", "tests/Common", "Tone/effect/AutoWah", "Tone/effect/preset/AutoWah.preset", 
	"Tone/effect/Chorus", "Tone/effect/preset/Chorus.preset", "Tone/effect/Freeverb", "Tone/effect/preset/Freeverb.preset",
	"Tone/effect/Phaser", "Tone/effect/preset/Phaser.preset"], 
function(Tone, chai, Test, AutoWah, AutoWahPresets, Chorus, ChorusPresets, Freeverb, FreeverbPresets,
	Phaser, PhaserPresets){

	var expect = chai.expect;

	describe("Tone.Autowah Presets", function(){
		this.timeout(maxTimeout);

		it ("has valid presets", function(){
			var aw = new AutoWah();
			Test.validatePresets(aw);
			aw.dispose();
		});
	});

	describe("Tone.Chorus Presets", function(){
		this.timeout(maxTimeout);

		it ("has valid presets", function(){
			var chorus = new Chorus();
			Test.validatePresets(chorus);
			chorus.dispose();
		});
	});

	describe("Tone.Freeverb Presets", function(){
		this.timeout(maxTimeout);

		it ("has valid presets", function(){
			var fv = new Freeverb();
			Test.validatePresets(fv);
			fv.dispose();
		});
	});

	describe("Tone.Phaser Presets", function(){
		this.timeout(maxTimeout);

		it ("has valid presets", function(){
			var phase = new Phaser();
			Test.validatePresets(phase);
			phase.dispose();
		});
	});
});
