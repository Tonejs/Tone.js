define(["Tone/instrument/CymbalSynth", "helper/Basic", "helper/InstrumentTests"], function (CymbalSynth, Basic, InstrumentTest) {

	describe("CymbalSynth", function(){

		Basic(CymbalSynth);
		InstrumentTest(CymbalSynth);

		context("API", function(){

			it ("can be constructed with octave and harmonicity values", function(){
				var cymbal = new CymbalSynth({
					"octaves" : 0.4,
					"resonance" : 2300,
					"harmonicity" : 3.1
				});
				expect(cymbal.harmonicity).to.be.closeTo(3.1, 0.01);
				expect(cymbal.resonance).to.be.closeTo(2300, 0.01);
				expect(cymbal.octaves).to.be.closeTo(0.4, 0.01);
				cymbal.dispose();
			});

			it ("can get and set envelope attributes", function(){
				var cymbal = new CymbalSynth();
				cymbal.envelope.attack = 0.024;
				cymbal.envelope.decay = 0.9;
				expect(cymbal.envelope.attack).to.equal(0.024);
				expect(cymbal.envelope.decay).to.equal(0.9);
				cymbal.dispose();
			});

			it ("can set the modulationIndex", function(){
				var cymbal = new CymbalSynth();
				cymbal.modulationIndex = 82;
				expect(cymbal.modulationIndex).to.be.closeTo(82, 0.01);
				cymbal.dispose();
			});

			it ("can get/set attributes", function(){
				var cymbal = new CymbalSynth();
				cymbal.set({
					"frequency" : 120
				});
				expect(cymbal.get().frequency).to.be.closeTo(120, 0.01);
				cymbal.dispose();
			});

		});
	});
});