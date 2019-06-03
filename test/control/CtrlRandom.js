import CtrlRandom from "Tone/control/CtrlRandom";
import Basic from "helper/Basic";

describe("CtrlRandom", function(){

	Basic(CtrlRandom);

	context("API", function(){

		it("can be constructed with a min and max", function(){
			var rando = new CtrlRandom(5, 10);
			expect(rando.min).to.equal(5);
			expect(rando.max).to.equal(10);
			rando.dispose();
		});

		it("can be constructed with an options object", function(){
			var rando = new CtrlRandom({
				min : -10,
				max : 100,
				integer : true,
			});
			expect(rando.min).to.equal(-10);
			expect(rando.max).to.equal(100);
			expect(rando.integer).to.be.true;
			rando.dispose();
		});

		it("returns numbers between min and max", function(){
			var rando = new CtrlRandom({
				min : 5,
				max : 100,
			});
			for (var i = 0; i < 1000; i++){
				expect(rando.value).to.be.within(5, 100);
			}
			rando.dispose();
		});

		it("returns integers between min and max", function(){
			var rando = new CtrlRandom({
				min : -10,
				max : -2,
				integer : true,
			});
			for (var i = 0; i < 1000; i++){
				expect(rando.value).to.be.within(-10, -2);
				expect(rando.value % 1).to.equal(0);
			}
			rando.dispose();
		});
	});
});

