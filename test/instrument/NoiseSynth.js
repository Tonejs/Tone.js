define(["Tone/instrument/NoiseSynth", "helper/Basic", "helper/InstrumentTests"], function (NoiseSynth, Basic, InstrumentTest) {

	describe("NoiseSynth", function(){

		Basic(NoiseSynth);
		InstrumentTest(NoiseSynth);

		context("API", function(){

			it ("can get and set noise type", function(){
				var noiseSynth = new NoiseSynth();
				noiseSynth.noise.type = "pink";
				expect(noiseSynth.noise.type).to.equal("pink");
				noiseSynth.dispose();
			});

			it ("can get and set envelope attributes", function(){
				var noiseSynth = new NoiseSynth();
				noiseSynth.envelope.attack = 0.24;
				expect(noiseSynth.envelope.attack).to.equal(0.24);
				noiseSynth.dispose();
			});

			it ("can get and set filter attributes", function(){
				var noiseSynth = new NoiseSynth();
				noiseSynth.filter.Q.value = 0.4;
				expect(noiseSynth.filter.Q.value).to.be.closeTo(0.4, 0.001);
				noiseSynth.dispose();
			});

			it ("can get and set filterEnvelope attributes", function(){
				var noiseSynth = new NoiseSynth();
				noiseSynth.filterEnvelope.baseFrequency = 400;
				expect(noiseSynth.filterEnvelope.baseFrequency).to.equal(400);
				noiseSynth.dispose();
			});

			it ("can be constructed with an options object", function(){
				var noiseSynth = new NoiseSynth({
					"envelope" : {
						"sustain" : 0.3
					}
				});
				expect(noiseSynth.envelope.sustain).to.equal(0.3);
				noiseSynth.dispose();
			});

			it ("can get/set attributes", function(){
				var noiseSynth = new NoiseSynth();
				noiseSynth.set({
					"envelope.decay" : 0.24
				});
				expect(noiseSynth.get().envelope.decay).to.equal(0.24);
				noiseSynth.dispose();
			});

		});
	});
});