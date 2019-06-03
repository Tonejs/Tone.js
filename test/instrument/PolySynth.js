import PolySynth from "Tone/instrument/PolySynth";
import Basic from "helper/Basic";
import InstrumentTests from "helper/InstrumentTests";
import OutputAudioStereo from "helper/OutputAudioStereo";
import Instrument from "Tone/instrument/Instrument";
import Test from "helper/Test";
import OutputAudio from "helper/OutputAudio";
import MonoSynth from "Tone/instrument/MonoSynth";
import Offline from "helper/Offline";
import Sampler from "Tone/instrument/Sampler";
import Frequency from "Tone/type/Frequency";
import CompareToFile from "helper/CompareToFile";

describe("PolySynth", function(){

	Basic(PolySynth);
	InstrumentTests(PolySynth, "C4");

	it("matches a file", function(){
		return CompareToFile(function(){
			var synth = new PolySynth(2).toMaster();
			synth.triggerAttackRelease("C4", 0.2, 0);
			synth.triggerAttackRelease("C4", 0.1, 0.1);
			synth.triggerAttackRelease("E4", 0.1, 0.2);
			synth.triggerAttackRelease("E4", 0.1, 0.3);
			synth.triggerAttackRelease("G4", 0.1, 0.4);
			synth.triggerAttackRelease("B4", 0.1, 0.4);
			synth.triggerAttackRelease("C4", 0.2, 0.5);
		}, "polySynth.wav", 0.6);
	});

	it("matches another file", function(){
		return CompareToFile(function(){
			var synth = new PolySynth(4).toMaster();
			synth.triggerAttackRelease(["C4", "E4", "G4", "B4"], 0.2, 0);
			synth.triggerAttackRelease(["C4", "E4", "G4", "B4"], 0.2, 0.3);
		}, "polySynth2.wav", 0.6);
	});

	it("matches a file and chooses the right voice", function(){
		return CompareToFile(function(){
			var synth = new PolySynth(3).toMaster();
			synth.triggerAttackRelease(["C4", "E4"], 1, 0);
			synth.triggerAttackRelease("G4", 0.1, 0.2);
			synth.triggerAttackRelease("B4", 0.1, 0.4);
			synth.triggerAttackRelease("G4", 0.1, 0.6);
		}, "polySynth3.wav", 0.5);
	});

	context("PolySynth Tests", function(){

		it("extends Tone.Instrument", function(){
			var polySynth = new PolySynth();
			expect(polySynth).to.be.an.instanceof(Instrument);
			polySynth.dispose();
		});

		it("can connect the output", function(){
			var polySynth = new PolySynth();
			polySynth.connect(Test);
			polySynth.dispose();
		});

		it("can be trigged with an array of Tone.Frequency", function(){
			return OutputAudio(function(){
				var polySynth = new PolySynth(2);
				polySynth.toMaster();
				polySynth.triggerAttackRelease(Frequency("C4").harmonize([0, 2]), 0.1, 0);
			});
		});

		it("triggerAttackRelease can take an array of durations", function(){
			return OutputAudio(function(){
				var polySynth = new PolySynth(2);
				polySynth.toMaster();
				polySynth.triggerAttackRelease(["C4", "D4"], [0.1, 0.2]);
			});
		});

		it("triggerAttack and triggerRelease can be invoked without arrays", function(){
			return Offline(function(){
				var polySynth = new PolySynth(2);
				polySynth.set("envelope.release", 0.1);
				polySynth.toMaster();
				polySynth.triggerAttack("C4", 0);
				polySynth.triggerRelease("C4", 0.1);
			}, 0.3).then(function(buffer){
				expect(buffer.getFirstSoundTime()).to.be.closeTo(0, 0.01);
				expect(buffer.getValueAtTime(0.2)).to.be.closeTo(0, 0.01);
			});
		});

		it("can stop all of the currently playing sounds", function(){
			return Offline(function(){
				var polySynth = new PolySynth(4);
				polySynth.set("envelope.release", 0.1);
				polySynth.toMaster();
				polySynth.triggerAttack(["C4", "E4", "G4", "B4"], 0);
				polySynth.releaseAll(0.1);
			}, 0.3).then(function(buffer){
				expect(buffer.getFirstSoundTime()).to.be.closeTo(0, 0.01);
				expect(buffer.getValueAtTime(0.2)).to.be.closeTo(0, 0.01);
			});
		});

		it("is silent before being triggered", function(){
			return Offline(function(){
				var polySynth = new PolySynth(2);
				polySynth.toMaster();
			}).then(function(buffer){
				expect(buffer.isSilent()).to.be.true;
			});
		});

		it("can be scheduled to start in the future", function(){
			return Offline(function(){
				var polySynth = new PolySynth(2);
				polySynth.toMaster();
				polySynth.triggerAttack("C4", 0.1);
			}, 0.3).then(function(buffer){
				expect(buffer.getFirstSoundTime()).to.be.closeTo(0.1, 0.01);
			});
		});

	});

	context("API", function(){

		it("can be constructed with an options object", function(){
			var polySynth = new PolySynth(4, MonoSynth, {
				"envelope" : {
					"sustain" : 0.3
				}
			});
			expect(polySynth.get().envelope.sustain).to.equal(0.3);
			polySynth.dispose();
		});

		it("throws an error if voice type is not Monophonic", function(){
			expect(function(){
				var polySynth = new PolySynth(4, Sampler);
			}).to.throw(Error);
		});

		it("can be set the detune", function(){
			var polySynth = new PolySynth();
			polySynth.detune.value = -1200;
			expect(polySynth.detune.value).to.equal(-1200);
			polySynth.dispose();
		});

		it("can pass in the volume and detune", function(){
			var polySynth = new PolySynth({
				"volume" : -12,
				"detune" : 120,
			});
			expect(polySynth.volume.value).to.be.closeTo(-12, 0.1);
			expect(polySynth.detune.value).to.be.closeTo(120, 1);
			polySynth.dispose();
		});

		it("can get/set attributes", function(){
			var polySynth = new PolySynth();
			polySynth.set({
				"envelope.decay" : 0.24
			});
			expect(polySynth.get().envelope.decay).to.equal(0.24);
			polySynth.dispose();
		});

	});
});

