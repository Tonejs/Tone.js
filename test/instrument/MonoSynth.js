import MonoSynth from "Tone/instrument/MonoSynth";
import Basic from "helper/Basic";
import InstrumentTest from "helper/InstrumentTests";
import CompareToFile from "helper/CompareToFile";
import Supports from "helper/Supports";
import Offline from "helper/Offline";

describe("MonoSynth", function(){

	Basic(MonoSynth);
	InstrumentTest(MonoSynth, "C4");

	if (Supports.CHROME_AUDIO_RENDERING){
		it("matches a file", function(){
			return CompareToFile(function(){
				var synth = new MonoSynth().toMaster();
				synth.triggerAttackRelease("C4", 0.1, 0.05);
			}, "monoSynth.wav", 1.75);
		});
	}

	context("API", function(){

		it("can get and set oscillator attributes", function(){
			var monoSynth = new MonoSynth();
			monoSynth.oscillator.type = "triangle";
			expect(monoSynth.oscillator.type).to.equal("triangle");
			monoSynth.dispose();
		});

		it("can get and set envelope attributes", function(){
			var monoSynth = new MonoSynth();
			monoSynth.envelope.attack = 0.24;
			expect(monoSynth.envelope.attack).to.equal(0.24);
			monoSynth.dispose();
		});

		it("can get and set filter attributes", function(){
			var monoSynth = new MonoSynth();
			monoSynth.filter.Q.value = 0.4;
			expect(monoSynth.filter.Q.value).to.be.closeTo(0.4, 0.001);
			monoSynth.dispose();
		});

		it("can get and set filterEnvelope attributes", function(){
			var monoSynth = new MonoSynth();
			monoSynth.filterEnvelope.baseFrequency = 400;
			expect(monoSynth.filterEnvelope.baseFrequency).to.equal(400);
			monoSynth.dispose();
		});

		it("can be constructed with an options object", function(){
			var monoSynth = new MonoSynth({
				"envelope" : {
					"sustain" : 0.3
				}
			});
			expect(monoSynth.envelope.sustain).to.equal(0.3);
			monoSynth.dispose();
		});

		it("can get/set attributes", function(){
			var monoSynth = new MonoSynth();
			monoSynth.set({
				"envelope.decay" : 0.24
			});
			expect(monoSynth.get().envelope.decay).to.equal(0.24);
			monoSynth.dispose();
		});

		it("is silent after triggerAttack if sustain is 0", function(){
			return Offline(function(){
				var synth = new MonoSynth({
					envelope : {
						attack : 0.1,
						decay : 0.1,
						sustain : 0,
					}
				}).toMaster();
				synth.triggerAttack("C4", 0);
			}, 0.5).then(function(buffer){
				expect(buffer.getLastSoundTime()).to.be.closeTo(0.2, 0.01);
			});
		});

	});
});

