import Synth from "Tone/instrument/Synth";
import Basic from "helper/Basic";
import InstrumentTest from "helper/InstrumentTests";
import APITest from "helper/APITest";
import Offline from "helper/Offline";
import Frequency from "Tone/type/Frequency";
import CompareToFile from "helper/CompareToFile";

describe("Synth", function(){

	Basic(Synth);
	InstrumentTest(Synth, "C4");

	it("matches a file basic", function(){
		return CompareToFile(function(){
			var synth = new Synth().toMaster();
			synth.triggerAttackRelease("C4", 0.1, 0.05);
		}, "synth_basic.wav", 0.3);
	});

	it("matches a file melody", function(){
		return CompareToFile(function(){
			var synth = new Synth().toMaster();
			synth.triggerAttack("C4", 0);
			synth.triggerAttack("E4", 0.1, 0.5);
			synth.triggerAttackRelease("G4", 0.5, 0.3);
			synth.triggerAttackRelease("B4", 0.5, 0.5, 0.2);
		}, "synth_melody.wav", 0.3);
	});

	context("API", function(){

		it("can get and set oscillator attributes", function(){
			var simple = new Synth();
			simple.oscillator.type = "triangle";
			expect(simple.oscillator.type).to.equal("triangle");
			simple.dispose();
		});

		it("can get and set envelope attributes", function(){
			var simple = new Synth();
			simple.envelope.attack = 0.24;
			expect(simple.envelope.attack).to.equal(0.24);
			simple.dispose();
		});

		it("can be constructed with an options object", function(){
			var simple = new Synth({
				"envelope" : {
					"sustain" : 0.3
				}
			});
			expect(simple.envelope.sustain).to.equal(0.3);
			simple.dispose();
		});

		it("can get/set attributes", function(){
			var simple = new Synth();
			simple.set({
				"envelope.decay" : 0.24
			});
			expect(simple.get().envelope.decay).to.equal(0.24);
			simple.dispose();
		});

		it("can be trigged with a Tone.Frequency", function(){
			return Offline(function(){
				var synth = new Synth().toMaster();
				synth.triggerAttack(Frequency("C4"), 0);
			}).then(function(buffer){
				expect(buffer.isSilent()).to.be.false;
			});
		});

		it("is silent after triggerAttack if sustain is 0", function(){
			return Offline(function(){
				var synth = new Synth({
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

		APITest.method(Synth, "triggerAttack", ["Frequency", "Time=", "NormalRange="]);
		APITest.method(Synth, "triggerRelease", ["Time="]);
		APITest.method(Synth, "triggerAttackRelease", ["Frequency", "Time=", "Time=", "NormalRange="]);

	});

	context("Portamento", function(){
		it("can play notes with a portamento", function(){
			return Offline(function(){
				var synth = new Synth({
					"portamento" : 0.1
				});
				expect(synth.portamento).to.equal(0.1);
				synth.frequency.toMaster();
				synth.triggerAttack(440, 0);
				synth.triggerAttack(880, 0.1);
			}, 0.2).then(function(buffer){
				buffer.forEach(function(val, time){
					if (time < 0.1){
						expect(val).to.be.closeTo(440, 1);
					} else if (time < 0.2){
						expect(val).to.within(440, 880);
					} else {
						expect(val).to.be.closeTo(880, 1);
					}
				});
			});
		});
	});
});

