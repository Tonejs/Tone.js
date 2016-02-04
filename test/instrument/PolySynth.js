define(["Tone/instrument/PolySynth", "helper/Basic", "helper/InstrumentTests", "helper/OutputAudioStereo", "helper/Meter"], 
function (PolySynth, Basic, InstrumentTests, OutputAudioStereo, Meter) {

	describe("PolySynth", function(){

		Basic(PolySynth);
		InstrumentTests(PolySynth, "C4");

		/*context("Instrument Tests", function(){

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

			it ("can set the volume", function(){
				var polySynth = new PolySynth({
					"volume" : -10
				});
				expect(polySynth.volume.value).to.be.closeTo(-10, 0.1);
				polySynth.dispose();
			});

			it("makes a sound", function(done){
				var polySynth;
				OutputAudio(function(dest){
					polySynth = new PolySynth();
					polySynth.connect(dest);
					polySynth.triggerAttack("C4");
				}, function(){
					polySynth.dispose();
					done();
				});
			});	

			it("produces sound in both channels", function(done){
				var polySynth;
				OutputAudioStereo(function(dest){
					polySynth = new PolySynth();
					polySynth.connect(dest);
					polySynth.triggerAttack("C4");
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

		});*/

		context("API", function(){

			/*it ("can get and set oscillator attributes", function(){
				var polySynth = new PolySynth();
				polySynth.oscillator.type = "triangle";
				expect(polySynth.oscillator.type).to.equal("triangle");
				polySynth.dispose();
			});

			it ("can get and set envelope attributes", function(){
				var polySynth = new PolySynth();
				polySynth.envelope.attack = 0.24;
				expect(polySynth.envelope.attack).to.equal(0.24);
				polySynth.dispose();
			});

			it ("can get and set filter attributes", function(){
				var polySynth = new PolySynth();
				polySynth.filter.Q.value = 0.4;
				expect(polySynth.filter.Q.value).to.be.closeTo(0.4, 0.001);
				polySynth.dispose();
			});

			it ("can get and set filterEnvelope attributes", function(){
				var polySynth = new PolySynth();
				polySynth.filterEnvelope.baseFrequency = 400;
				expect(polySynth.filterEnvelope.baseFrequency).to.equal(400);
				polySynth.dispose();
			});

			it ("can be constructed with an options object", function(){
				var polySynth = new PolySynth({
					"envelope" : {
						"sustain" : 0.3
					}
				});
				expect(polySynth.envelope.sustain).to.equal(0.3);
				polySynth.dispose();
			});

			it ("can get/set attributes", function(){
				var polySynth = new PolySynth();
				polySynth.set({
					"envelope.decay" : 0.24
				});
				expect(polySynth.get().envelope.decay).to.equal(0.24);
				polySynth.dispose();
			});*/

		});
	});
});