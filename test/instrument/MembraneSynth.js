import MembraneSynth from "Tone/instrument/MembraneSynth";
import Basic from "helper/Basic";
import InstrumentTest from "helper/InstrumentTests";
import CompareToFile from "helper/CompareToFile";

describe("MembraneSynth", function(){

	Basic(MembraneSynth);
	InstrumentTest(MembraneSynth, "C2");

	it("matches a file", function(){
		return CompareToFile(function(){
			var synth = new MembraneSynth().toMaster();
			synth.triggerAttackRelease("F#2", 0.1, 0.05);
		}, "membraneSynth.wav", 0.5);
	});

	it("matches another file", function(){
		return CompareToFile(function(){
			var synth = new MembraneSynth({
				envelope : {
					sustain : 0
				}
			}).toMaster();
			synth.triggerAttackRelease("C2", 0.1);
		}, "membraneSynth2.wav", 0.5);
	});

	context("API", function(){

		it("can get and set oscillator attributes", function(){
			var drumSynth = new MembraneSynth();
			drumSynth.oscillator.type = "triangle";
			expect(drumSynth.oscillator.type).to.equal("triangle");
			drumSynth.dispose();
		});

		it("can get and set envelope attributes", function(){
			var drumSynth = new MembraneSynth();
			drumSynth.envelope.attack = 0.24;
			expect(drumSynth.envelope.attack).to.equal(0.24);
			drumSynth.dispose();
		});

		it("can get and set the octaves and pitch decay", function(){
			var drumSynth = new MembraneSynth();
			drumSynth.octaves = 12;
			drumSynth.pitchDecay = 0.2;
			expect(drumSynth.pitchDecay).to.equal(0.2);
			expect(drumSynth.octaves).to.equal(12);
			drumSynth.dispose();
		});

		it("can be constructed with an options object", function(){
			var drumSynth = new MembraneSynth({
				"envelope" : {
					"sustain" : 0.3
				}
			});
			expect(drumSynth.envelope.sustain).to.equal(0.3);
			drumSynth.dispose();
		});

		it("can get/set attributes", function(){
			var drumSynth = new MembraneSynth();
			drumSynth.set({
				"envelope.decay" : 0.24
			});
			expect(drumSynth.get().envelope.decay).to.equal(0.24);
			drumSynth.dispose();
		});

	});
});

