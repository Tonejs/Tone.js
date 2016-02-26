define(["Tone/effect/AutoPanner", "helper/Basic", "helper/EffectTests"], function (AutoPanner, Basic, EffectTests) {
	
	describe("AutoPanner", function(){
		Basic(AutoPanner);
		EffectTests(AutoPanner);

		context("API", function(){

			it ("can pass in options in the constructor", function(){
				var autoPanner = new AutoPanner({
					"type" : "sawtooth",
					"depth" : 0.2
				});
				expect(autoPanner.depth.value).to.be.closeTo(0.2, 0.01);
				expect(autoPanner.type).to.equal("sawtooth");
				autoPanner.dispose();
			});

			it ("can be started and stopped", function(){
				var autoPanner = new AutoPanner();
				autoPanner.start().stop("+0.2");
				autoPanner.dispose();
			});

			it ("can get/set the options", function(){
				var autoPanner = new AutoPanner();
				autoPanner.set({
					"frequency" : 2.4,
					"type" : "triangle"
				});
				expect(autoPanner.get().frequency).to.be.closeTo(2.4, 0.01);
				expect(autoPanner.get().type).to.equal("triangle");
				autoPanner.dispose();
			});

			it ("can set the frequency and depth", function(){
				var autoPanner = new AutoPanner();
				autoPanner.depth.value = 0.4;
				autoPanner.frequency.value = 0.4;
				expect(autoPanner.depth.value).to.be.closeTo(0.4, 0.01);
				expect(autoPanner.frequency.value).to.be.closeTo(0.4, 0.01);
				autoPanner.dispose();
			});
		});
	});
});