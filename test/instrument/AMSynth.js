import AMSynth from "Tone/instrument/AMSynth";
import Basic from "helper/Basic";
import InstrumentTest from "helper/InstrumentTests";
import CompareToFile from "helper/CompareToFile";

describe("AMSynth", function(){

	Basic(AMSynth);
	InstrumentTest(AMSynth, "C4");

	it("matches a file", function(){
		return CompareToFile(function(){
			var synth = new AMSynth().toMaster();
			synth.triggerAttackRelease("C5", 0.1, 0.1);
		}, "amSynth.wav", 0.15);
	});

	context("API", function(){

		it("can get and set carrier attributes", function(){
			var amSynth = new AMSynth();
			amSynth.oscillator.type = "triangle";
			expect(amSynth.oscillator.type).to.equal("triangle");
			amSynth.dispose();
		});

		it("can get and set modulator attributes", function(){
			var amSynth = new AMSynth();
			amSynth.envelope.attack = 0.24;
			expect(amSynth.envelope.attack).to.equal(0.24);
			amSynth.dispose();
		});

		it("can get and set harmonicity", function(){
			var amSynth = new AMSynth();
			amSynth.harmonicity.value = 2;
			expect(amSynth.harmonicity.value).to.equal(2);
			amSynth.dispose();
		});

		it("can be constructed with an options object", function(){
			var amSynth = new AMSynth({
				"oscillator" : {
					"type" : "square"
				},
				"modulationEnvelope" : {
					"attack" : 0.3
				}
			});
			expect(amSynth.modulationEnvelope.attack).to.equal(0.3);
			expect(amSynth.oscillator.type).to.equal("square");
			amSynth.dispose();
		});

		it("can get/set attributes", function(){
			var amSynth = new AMSynth();
			amSynth.set({
				"harmonicity" : 1.5,
				"detune" : 1200
			});
			expect(amSynth.get().harmonicity).to.equal(1.5);
			expect(amSynth.get().detune).to.be.closeTo(1200, 1);
			amSynth.dispose();
		});

	});
});

