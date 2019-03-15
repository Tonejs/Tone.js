import MetalSynth from "Tone/instrument/MetalSynth";
import Basic from "helper/Basic";
import InstrumentTest from "helper/InstrumentTests";
import CompareToFile from "helper/CompareToFile";
import Supports from "helper/Supports";

describe("MetalSynth", function(){

	Basic(MetalSynth);
	InstrumentTest(MetalSynth);

	if (Supports.CHROME_AUDIO_RENDERING){
		it("matches a file", function(){
			return CompareToFile(function(){
				var synth = new MetalSynth().toMaster();
				synth.triggerAttackRelease(0.1, 0.05);
			}, "metalSynth.wav", 7.4);
		});
	}

	context("API", function(){

		it("can be constructed with octave and harmonicity values", function(){
			var cymbal = new MetalSynth({
				"octaves" : 0.4,
				"resonance" : 2300,
				"harmonicity" : 3.1
			});
			expect(cymbal.harmonicity).to.be.closeTo(3.1, 0.01);
			expect(cymbal.resonance).to.be.closeTo(2300, 0.01);
			expect(cymbal.octaves).to.be.closeTo(0.4, 0.01);
			cymbal.dispose();
		});

		it("can get and set envelope attributes", function(){
			var cymbal = new MetalSynth();
			cymbal.envelope.attack = 0.024;
			cymbal.envelope.decay = 0.9;
			expect(cymbal.envelope.attack).to.equal(0.024);
			expect(cymbal.envelope.decay).to.equal(0.9);
			cymbal.dispose();
		});

		it("can set the modulationIndex", function(){
			var cymbal = new MetalSynth();
			cymbal.modulationIndex = 82;
			expect(cymbal.modulationIndex).to.be.closeTo(82, 0.01);
			cymbal.dispose();
		});

		it("can get/set attributes", function(){
			var cymbal = new MetalSynth();
			cymbal.set({
				"frequency" : 120
			});
			expect(cymbal.get().frequency).to.be.closeTo(120, 0.01);
			cymbal.harmonicity = 2;
			expect(cymbal.harmonicity).to.be.closeTo(2, 0.01);
			cymbal.resonance = 2222;
			expect(cymbal.resonance).to.be.closeTo(2222, 1);
			cymbal.dispose();
		});

	});
});

