define(["Tone/instrument/DuoSynth", "helper/Basic", "helper/InstrumentTests"], function (DuoSynth, Basic, InstrumentTest) {

	describe("DuoSynth", function(){

		Basic(DuoSynth);
		InstrumentTest(DuoSynth, "C4");

		context("API", function(){

			it ("can get and set voice0 attributes", function(){
				var duoSynth = new DuoSynth();
				duoSynth.voice0.oscillator.type = "triangle";
				expect(duoSynth.voice0.oscillator.type).to.equal("triangle");
				duoSynth.dispose();
			});

			it ("can get and set voice1 attributes", function(){
				var duoSynth = new DuoSynth();
				duoSynth.voice1.envelope.attack = 0.24;
				expect(duoSynth.voice1.envelope.attack).to.equal(0.24);
				duoSynth.dispose();
			});

			it ("can get and set harmonicity", function(){
				var duoSynth = new DuoSynth();
				duoSynth.harmonicity.value = 2;
				expect(duoSynth.harmonicity.value).to.equal(2);
				duoSynth.dispose();
			});

			it ("can get and set vibratoRate", function(){
				var duoSynth = new DuoSynth();
				duoSynth.vibratoRate.value = 2;
				expect(duoSynth.vibratoRate.value).to.equal(2);
				duoSynth.dispose();
			});

			it ("can be constructed with an options object", function(){
				var duoSynth = new DuoSynth({
					"voice0" : {
						"filter" : {
							"rolloff" : -24
						}
					}
				});
				expect(duoSynth.voice0.filter.rolloff).to.equal(-24);
				duoSynth.dispose();
			});

			it ("can get/set attributes", function(){
				var duoSynth = new DuoSynth();
				duoSynth.set({
					"harmonicity" : 1.5
				});
				expect(duoSynth.get().harmonicity).to.equal(1.5);
				duoSynth.dispose();
			});

		});
	});
});