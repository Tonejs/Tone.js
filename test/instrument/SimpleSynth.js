define(["Tone/instrument/SimpleSynth", "helper/Basic", "helper/InstrumentTests"], function (SimpleSynth, Basic, InstrumentTest) {

	describe("SimpleSynth", function(){

		Basic(SimpleSynth);
		InstrumentTest(SimpleSynth, "C4");

		context("API", function(){

			it ("can get and set oscillator attributes", function(){
				var simple = new SimpleSynth();
				simple.oscillator.type = "triangle";
				expect(simple.oscillator.type).to.equal("triangle");
				simple.dispose();
			});

			it ("can get and set envelope attributes", function(){
				var simple = new SimpleSynth();
				simple.envelope.attack = 0.24;
				expect(simple.envelope.attack).to.equal(0.24);
				simple.dispose();
			});

			it ("can be constructed with an options object", function(){
				var simple = new SimpleSynth({
					"envelope" : {
						"sustain" : 0.3
					}
				});
				expect(simple.envelope.sustain).to.equal(0.3);
				simple.dispose();
			});

			it ("can get/set attributes", function(){
				var simple = new SimpleSynth();
				simple.set({
					"envelope.decay" : 0.24
				});
				expect(simple.get().envelope.decay).to.equal(0.24);
				simple.dispose();
			});

		});
	});
});