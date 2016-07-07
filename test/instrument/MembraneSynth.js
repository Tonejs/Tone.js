define(["Tone/instrument/MembraneSynth", "helper/Basic", "helper/InstrumentTests"], function (MembraneSynth, Basic, InstrumentTest) {

	describe("MembraneSynth", function(){

		Basic(MembraneSynth);
		InstrumentTest(MembraneSynth, "C2");

		context("API", function(){

			it ("can get and set oscillator attributes", function(){
				var drumSynth = new MembraneSynth();
				drumSynth.oscillator.type = "triangle";
				expect(drumSynth.oscillator.type).to.equal("triangle");
				drumSynth.dispose();
			});

			it ("can get and set envelope attributes", function(){
				var drumSynth = new MembraneSynth();
				drumSynth.envelope.attack = 0.24;
				expect(drumSynth.envelope.attack).to.equal(0.24);
				drumSynth.dispose();
			});

			it ("can get and set the octaves and pitch decay", function(){
				var drumSynth = new MembraneSynth();
				drumSynth.octaves = 12;
				drumSynth.pitchDecay = 0.2;
				expect(drumSynth.pitchDecay).to.equal(0.2);
				expect(drumSynth.octaves).to.equal(12);
				drumSynth.dispose();
			});

			it ("can be constructed with an options object", function(){
				var drumSynth = new MembraneSynth({
					"envelope" : {
						"sustain" : 0.3
					}
				});
				expect(drumSynth.envelope.sustain).to.equal(0.3);
				drumSynth.dispose();
			});

			it ("can get/set attributes", function(){
				var drumSynth = new MembraneSynth();
				drumSynth.set({
					"envelope.decay" : 0.24
				});
				expect(drumSynth.get().envelope.decay).to.equal(0.24);
				drumSynth.dispose();
			});

		});
	});
});