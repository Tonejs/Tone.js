define(["Tone/effect/Chebyshev", "helper/Basic", "helper/EffectTests"], function (Chebyshev, Basic, EffectTests) {
	
	describe("Chebyshev", function(){

		Basic(Chebyshev);
		EffectTests(Chebyshev, 51);

		context("API", function(){

			it ("can pass in options in the constructor", function(){
				var cheby = new Chebyshev({
					"order" : 2,
				});
				expect(cheby.order).to.equal(2);
				cheby.dispose();
			});

			it ("can get/set the options", function(){
				var cheby = new Chebyshev();
				cheby.set({
					"order" : 40,
				});
				expect(cheby.get().order).to.equal(40);
				cheby.dispose();
			});
		});
	});
});