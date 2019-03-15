import NoiseSynth from "Tone/instrument/NoiseSynth";
import Basic from "helper/Basic";
import InstrumentTest from "helper/InstrumentTests";
import CompareToFile from "helper/CompareToFile";

describe("NoiseSynth", function(){

	Basic(NoiseSynth);
	InstrumentTest(NoiseSynth, undefined, {
		envelope : {
			release : 0.2,
			decay : 0.1,
			sustain : 0.5
		}
	});

	it("matches a file", function(){
		return CompareToFile(function(){
			var synth = new NoiseSynth({
				envelope : {
					attack : 0.01,
					decay : 0.4
				}
			}).toMaster();
			synth.triggerAttack(0);
			synth.triggerAttack(0.3);
		}, "noiseSynth.wav", 4);
	});

	it("matches another file", function(){
		return CompareToFile(function(){
			var synth = new NoiseSynth({
				envelope : {
					attack : 0.01,
					decay : 0.4
				}
			}).toMaster();
			synth.triggerAttackRelease(0.1, 0);
		}, "noiseSynthRelease.wav", 4);
	});

	context("API", function(){

		it("can get and set noise type", function(){
			var noiseSynth = new NoiseSynth();
			noiseSynth.noise.type = "pink";
			expect(noiseSynth.noise.type).to.equal("pink");
			noiseSynth.dispose();
		});

		it("can get and set envelope attributes", function(){
			var noiseSynth = new NoiseSynth();
			noiseSynth.envelope.attack = 0.24;
			expect(noiseSynth.envelope.attack).to.equal(0.24);
			noiseSynth.dispose();
		});

		it("can be constructed with an options object", function(){
			var noiseSynth = new NoiseSynth({
				"envelope" : {
					"sustain" : 0.3
				}
			});
			expect(noiseSynth.envelope.sustain).to.equal(0.3);
			noiseSynth.dispose();
		});

		it("can get/set attributes", function(){
			var noiseSynth = new NoiseSynth();
			noiseSynth.set({
				"envelope.decay" : 0.24
			});
			expect(noiseSynth.get().envelope.decay).to.equal(0.24);
			noiseSynth.dispose();
		});

	});
});

