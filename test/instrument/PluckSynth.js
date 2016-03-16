define(["Tone/instrument/PluckSynth", "helper/Basic", "helper/InstrumentTests", "helper/Supports"], 
	function (PluckSynth, Basic, InstrumentTest, Supports) {

	describe("PluckSynth", function(){

		Basic(PluckSynth);

		if (Supports.PLUCK_SYNTH){
			InstrumentTest(PluckSynth, "C3");
		}

		context("API", function(){

			it ("can get and set resonance", function(){
				var pluck = new PluckSynth();
				pluck.resonance.value = 0.4;
				expect(pluck.resonance.value).to.be.closeTo(0.4, 0.001);
				pluck.dispose();
			});

			it ("can get and set dampening", function(){
				var pluck = new PluckSynth();
				pluck.dampening.value = 2000;
				expect(pluck.dampening.value).to.be.closeTo(2000, 0.1);
				pluck.dispose();
			});

			it ("can get and set the attackNoise", function(){
				var pluck = new PluckSynth();
				pluck.attackNoise = 0.2;
				expect(pluck.attackNoise).to.be.closeTo(0.2, 0.1);
				pluck.dispose();
			});

			it ("can be constructed with an options object", function(){
				var pluck = new PluckSynth({
					"dampening" : 300
				});
				expect(pluck.dampening.value).to.be.closeTo(300, 0.1);
				pluck.dispose();
			});

			it ("can be constructed with an options object", function(){
				var pluck = new PluckSynth({
					"resonance" : 0.5
				});
				expect(pluck.resonance.value).to.be.closeTo(0.5, 0.001);
				pluck.dispose();
			});

		});
	});
});