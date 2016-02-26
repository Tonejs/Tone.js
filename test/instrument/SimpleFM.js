define(["Tone/instrument/SimpleFM", "helper/Basic", "helper/InstrumentTests"], function (SimpleFM, Basic, InstrumentTest) {

	describe("SimpleFM", function(){

		Basic(SimpleFM);
		InstrumentTest(SimpleFM, "C4");

		context("API", function(){

			it ("can get and set carrier attributes", function(){
				var fmSynth = new SimpleFM();
				fmSynth.carrier.oscillator.type = "triangle";
				expect(fmSynth.carrier.oscillator.type).to.equal("triangle");
				fmSynth.dispose();
			});

			it ("can get and set modulator attributes", function(){
				var fmSynth = new SimpleFM();
				fmSynth.modulator.envelope.attack = 0.24;
				expect(fmSynth.modulator.envelope.attack).to.equal(0.24);
				fmSynth.dispose();
			});

			it ("can get and set harmonicity", function(){
				var fmSynth = new SimpleFM();
				fmSynth.harmonicity.value = 2;
				expect(fmSynth.harmonicity.value).to.equal(2);
				fmSynth.dispose();
			});

			it ("can be constructed with an options object", function(){
				var fmSynth = new SimpleFM({
					"carrier" : {
						"oscillator" : {
							"type" : "square2"
						}
					}
				});
				expect(fmSynth.carrier.oscillator.type).to.equal("square2");
				fmSynth.dispose();
			});

			it ("can get/set attributes", function(){
				var fmSynth = new SimpleFM();
				fmSynth.set({
					"harmonicity" : 1.5
				});
				expect(fmSynth.get().harmonicity).to.equal(1.5);
				fmSynth.dispose();
			});

		});
	});
});