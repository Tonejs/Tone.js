define(["Tone/instrument/PolySynth", "helper/Basic", "helper/InstrumentTests", "helper/OutputAudioStereo",
	"Tone/instrument/Instrument", "Test", "helper/OutputAudio", "Tone/instrument/MonoSynth", "helper/Offline",
	"Tone/instrument/Sampler", "Tone/type/Frequency"],
function (PolySynth, Basic, InstrumentTests, OutputAudioStereo, Instrument, Test, OutputAudio, MonoSynth, Offline, Sampler, Frequency) {

	describe("PolySynth", function(){

		Basic(PolySynth);
		InstrumentTests(PolySynth, "C4");

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
});
