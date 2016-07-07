define(["Tone/control/CtrlInterpolate", "helper/Basic"], function (CtrlInterpolate, Basic) {

	describe("CtrlInterpolate", function(){

		Basic(CtrlInterpolate);

		context("API", function(){

			it ("can be constructed with an array and index", function(){
				var terp = new CtrlInterpolate([0, 1, 2, 3], 2);
				expect(terp.values).to.deep.equal([0, 1, 2, 3]);
				expect(terp.index).to.equal(2);
				terp.dispose();
			});

			it ("can be constructed with an object", function(){
				var terp = new CtrlInterpolate({
					values : [1, 2, 3],
					index : 1,
				});
				expect(terp.values).to.deep.equal([1, 2, 3]);
				expect(terp.index).to.equal(1);
				terp.dispose();
			});

			it ("can set the index", function(){
				var terp = new CtrlInterpolate([]);
				terp.index = 4;
				expect(terp.index).to.equal(4);
				terp.index = 0;
				expect(terp.index).to.equal(0);
				terp.dispose();
			});
		});

		context("Interpolation", function(){

			it ("can be done over an array of numbers", function(){
				var terp = new CtrlInterpolate([3, 2, 1, 0], 0);
				expect(terp.value).to.equal(3);
				terp.index = 1;
				expect(terp.value).to.equal(2);
				terp.index = 1.5;
				expect(terp.value).to.equal(1.5);
				terp.index = 2.75;
				expect(terp.value).to.equal(0.25);
				terp.dispose();
			});


			it ("can be done over an array of arrays", function(){
				var terp = new CtrlInterpolate([[1, 2, 3], [4, 4, 4]], 0.25);
				expect(terp.value).to.deep.equal([1.75, 2.5, 3.25]);
				terp.index = 1.5;
				expect(terp.value).to.deep.equal([4, 4, 4]);
				terp.dispose();
			});

			it ("can be done over an array of objects", function(){
				var terp = new CtrlInterpolate([{
					"a" : 4.4,
					"b" : 2.2
				}, {
					"a" : 4.4,
					"b" : 2.2
				}], 0.9);
				expect(terp.value).to.deep.equal({
					a: 4.4, 
					b: 2.2
				});
				terp.dispose();
			});

			it ("can evaluate time", function(){
				var terp = new CtrlInterpolate(["4n", "8n", "16n"], 0.25);
				expect(terp.value).to.equal(0.4375);
				terp.index = 1.5;
				expect(terp.value).to.equal(0.1875);
				terp.dispose();
			});

			it ("mix types", function(){
				var terp = new CtrlInterpolate(["4n", 4], 0.25);
				expect(terp.value).to.equal(1.375);
				terp.dispose();
			});
		});
	});
});