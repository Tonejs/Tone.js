define(["Tone/instrument/Synth", "helper/Basic", "helper/InstrumentTests", "helper/APITest"], 
	function (Synth, Basic, InstrumentTest, APITest) {

	describe("Synth", function(){

		Basic(Synth);
		InstrumentTest(Synth, "C4");

		context("API", function(){

			it ("can get and set oscillator attributes", function(){
				var simple = new Synth();
				simple.oscillator.type = "triangle";
				expect(simple.oscillator.type).to.equal("triangle");
				simple.dispose();
			});

			it ("can get and set envelope attributes", function(){
				var simple = new Synth();
				simple.envelope.attack = 0.24;
				expect(simple.envelope.attack).to.equal(0.24);
				simple.dispose();
			});

			it ("can be constructed with an options object", function(){
				var simple = new Synth({
					"envelope" : {
						"sustain" : 0.3
					}
				});
				expect(simple.envelope.sustain).to.equal(0.3);
				simple.dispose();
			});

			it ("can get/set attributes", function(){
				var simple = new Synth();
				simple.set({
					"envelope.decay" : 0.24
				});
				expect(simple.get().envelope.decay).to.equal(0.24);
				simple.dispose();
			});

			APITest.method(Synth, "triggerAttack", ["Frequency", "Time=", "NormalRange="]);
			APITest.method(Synth, "triggerRelease", ["Time="]);
			APITest.method(Synth, "triggerAttackRelease", ["Frequency", "Time=", "Time=", "NormalRange="]);

		});
	});
});