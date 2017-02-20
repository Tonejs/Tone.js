define(["Tone/instrument/PolySynth", "helper/Basic", "helper/InstrumentTests", "helper/OutputAudioStereo", 
	"Tone/instrument/Instrument", "Test", "helper/OutputAudio", "Tone/instrument/MonoSynth", "helper/Offline"], 
function (PolySynth, Basic, InstrumentTests, OutputAudioStereo, Instrument, Test, OutputAudio, MonoSynth, Offline) {

	describe("PolySynth", function(){

		Basic(PolySynth);
		InstrumentTests(PolySynth, "C4");

		context("PolySynth Tests", function(){

			it ("extends Tone.Instrument", function(){
				var polySynth = new PolySynth();
				expect(polySynth).to.be.an.instanceof(Instrument);
				polySynth.dispose();
			});

			it ("can connect the output", function(){
				var polySynth = new PolySynth();
				polySynth.connect(Test);
				polySynth.dispose();
			});

			it("triggerAttackRelease can take an array of durations", function(){
				return OutputAudio(function(){
					var polySynth = new PolySynth(2);
					polySynth.toMaster();
					polySynth.triggerAttackRelease(["C4", "D4"], [0.1, 0.2]);
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

			it ("can be constructed with an options object", function(){
				var polySynth = new PolySynth(4, MonoSynth, {
					"envelope" : {
						"sustain" : 0.3
					}
				});
				expect(polySynth.get().envelope.sustain).to.equal(0.3);
				polySynth.dispose();
			});

			it ("can be set the detune", function(){
				var polySynth = new PolySynth();
				polySynth.detune.value = -1200;
				expect(polySynth.detune.value).to.equal(-1200);
				polySynth.dispose();
			});

			it ("can get/set attributes", function(){
				var polySynth = new PolySynth();
				polySynth.set({
					"envelope.decay" : 0.24
				});
				expect(polySynth.get().envelope.decay).to.equal(0.24);
				polySynth.dispose();
			});

		});
	});
});