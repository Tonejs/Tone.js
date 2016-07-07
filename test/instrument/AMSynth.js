define(["Tone/instrument/AMSynth", "helper/Basic", "helper/InstrumentTests"], function (AMSynth, Basic, InstrumentTest) {

	describe("AMSynth", function(){

		Basic(AMSynth);
		InstrumentTest(AMSynth, "C4");

		context("API", function(){

			it ("can get and set carrier attributes", function(){
				var amSynth = new AMSynth();
				amSynth.oscillator.type = "triangle";
				expect(amSynth.oscillator.type).to.equal("triangle");
				amSynth.dispose();
			});

			it ("can get and set modulator attributes", function(){
				var amSynth = new AMSynth();
				amSynth.envelope.attack = 0.24;
				expect(amSynth.envelope.attack).to.equal(0.24);
				amSynth.dispose();
			});

			it ("can get and set harmonicity", function(){
				var amSynth = new AMSynth();
				amSynth.harmonicity.value = 2;
				expect(amSynth.harmonicity.value).to.equal(2);
				amSynth.dispose();
			});

			it ("can be constructed with an options object", function(){
				var amSynth = new AMSynth({
					"modulationEnvelope" : {
						"attack" : 0.3
					}
				});
				expect(amSynth.modulationEnvelope.attack).to.equal(0.3);
				amSynth.dispose();
			});

			it ("can get/set attributes", function(){
				var amSynth = new AMSynth();
				amSynth.set({
					"harmonicity" : 1.5,
					"detune" : 1200
				});
				expect(amSynth.get().harmonicity).to.equal(1.5);
				expect(amSynth.get().detune).to.be.closeTo(1200, 1);
				amSynth.dispose();
			});

		});
	});
});