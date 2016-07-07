define(["Tone/instrument/PolySynth", "helper/Basic", "helper/InstrumentTests", "helper/OutputAudioStereo", 
	"helper/Meter", "Tone/instrument/Instrument", "Test", "helper/OutputAudio", "Tone/instrument/MonoSynth"], 
function (PolySynth, Basic, InstrumentTests, OutputAudioStereo, Meter, Instrument, Test, OutputAudio, MonoSynth) {

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

			it("makes a sound", function(done){
				var polySynth;
				OutputAudio(function(dest){
					polySynth = new PolySynth(2);
					polySynth.connect(dest);
					polySynth.triggerAttack("C4");
				}, function(){
					polySynth.dispose();
					done();
				});
			});	

			it("triggerAttackRelease can take an array of durations", function(done){
				var polySynth;
				OutputAudio(function(dest){
					polySynth = new PolySynth(2);
					polySynth.connect(dest);
					polySynth.triggerAttackRelease(["C4", "D4"], [0.1, 0.2]);
				}, function(){
					polySynth.dispose();
					done();
				});
			});	

			it("is silent before being triggered", function(done){
				var polySynth;
				var meter = new Meter(0.3);
				meter.before(function(dest){
					polySynth = new PolySynth();
					polySynth.connect(dest);
				});
				meter.test(function(level){
					expect(level).to.equal(0);
				});
				meter.after(function(){
					polySynth.dispose();
					done();
				});
				meter.run();
			});	

			it("be scheduled to start in the future", function(done){
				var polySynth;
				var meter = new Meter(0.3);
				meter.before(function(dest){
					polySynth = new PolySynth();
					polySynth.connect(dest);
					polySynth.triggerAttack("C4", 0.1);
				});
				meter.test(function(sample, time){
					if (sample > 0.2){
						expect(time).to.be.at.least(0.1);
					}
				});
				meter.after(function(){
					polySynth.dispose();
					done();
				});
				meter.run();
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