import Instrument from "Tone/instrument/Instrument";
import Basic from "helper/Basic";

describe("Instrument", function(){

	Basic(Instrument);

	context("API", function(){

		it("can be constructed with an options object", function(){
			var instr = new Instrument({
				"volume" : -12
			});
			expect(instr.volume.value).to.be.closeTo(-12, 0.1);
			instr.dispose();
		});

		it("can get/set attributes", function(){
			var instr = new Instrument();
			instr.set({
				"volume" : 2
			});
			expect(instr.get().volume).to.be.closeTo(2, 0.1);
		});

	});
});

