define(["Tone/effect/Tremolo", "helper/Basic", "helper/EffectTests"], function (Tremolo, Basic, EffectTests) {
	
	describe("Tremolo", function(){
		Basic(Tremolo);
		EffectTests(Tremolo);

		context("API", function(){

			it ("can pass in options in the constructor", function(){
				var tremolo = new Tremolo({
					"depth" : 0.2,
					"type" : "sawtooth",
					"spread" : 160,
				});
				expect(tremolo.depth.value).to.be.closeTo(0.2, 0.001);
				expect(tremolo.type).to.equal("sawtooth");
				expect(tremolo.spread).to.equal(160);
				tremolo.dispose();
			});

			it ("can be started and stopped", function(){
				var tremolo = new Tremolo();
				tremolo.start().stop("+0.2");
				tremolo.dispose();
			});

			it ("can get/set the options", function(){
				var tremolo = new Tremolo();
				tremolo.set({
					"frequency" : 2.4,
					"type" : "triangle"
				});
				expect(tremolo.get().frequency).to.be.closeTo(2.4, 0.01);
				expect(tremolo.get().type).to.equal("triangle");
				tremolo.dispose();
			});

			it ("can set the frequency and depth", function(){
				var tremolo = new Tremolo();
				tremolo.depth.value = 0.4;
				tremolo.frequency.value = 0.4;
				expect(tremolo.depth.value).to.be.closeTo(0.4, 0.01);
				expect(tremolo.frequency.value).to.be.closeTo(0.4, 0.01);
				tremolo.dispose();
			});
		});
	});
});