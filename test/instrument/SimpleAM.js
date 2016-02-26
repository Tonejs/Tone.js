define(["Tone/instrument/SimpleAM", "helper/Basic", "helper/InstrumentTests"], function (SimpleAM, Basic, InstrumentTest) {

	describe("SimpleAM", function(){

		Basic(SimpleAM);
		InstrumentTest(SimpleAM, "C4");

		context("API", function(){

			it ("can get and set carrier attributes", function(){
				var amSynth = new SimpleAM();
				amSynth.carrier.oscillator.type = "triangle";
				expect(amSynth.carrier.oscillator.type).to.equal("triangle");
				amSynth.dispose();
			});

			it ("can get and set modulator attributes", function(){
				var amSynth = new SimpleAM();
				amSynth.modulator.envelope.attack = 0.24;
				expect(amSynth.modulator.envelope.attack).to.equal(0.24);
				amSynth.dispose();
			});

			it ("can get and set harmonicity", function(){
				var amSynth = new SimpleAM();
				amSynth.harmonicity.value = 2;
				expect(amSynth.harmonicity.value).to.equal(2);
				amSynth.dispose();
			});

			it ("can be constructed with an options object", function(){
				var amSynth = new SimpleAM({
					"carrier" : {
						"oscillator" : {
							"type" : "square2"
						}
					}
				});
				expect(amSynth.carrier.oscillator.type).to.equal("square2");
				amSynth.dispose();
			});

			it ("can get/set attributes", function(){
				var amSynth = new SimpleAM();
				amSynth.set({
					"harmonicity" : 1.5
				});
				expect(amSynth.get().harmonicity).to.equal(1.5);
				amSynth.dispose();
			});

		});
	});
});