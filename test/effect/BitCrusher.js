define(["Tone/effect/BitCrusher", "helper/Basic", "helper/EffectTests"], function (BitCrusher, Basic, EffectTests) {
	
	describe("BitCrusher", function(){

		Basic(BitCrusher);
		EffectTests(BitCrusher);

		context("API", function(){

			it ("can pass in options in the constructor", function(){
				var crusher = new BitCrusher({
					"bits" : 3,
				});
				expect(crusher.bits).to.equal(3);
				crusher.dispose();
			});

			it ("can get/set the options", function(){
				var crusher = new BitCrusher();
				crusher.set({
					"bits" : 5,
				});
				expect(crusher.get().bits).to.equal(5);
				crusher.dispose();
			});
		});
	});
});