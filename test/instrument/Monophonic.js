define(["Tone/instrument/Monophonic", "helper/Basic"], function (Monophonic, Basic) {

	describe("Monophonic", function(){

		Basic(Monophonic);

		context("API", function(){

			it ("can be constructed with an options object", function(){
				var instr = new Monophonic({
					"portamento" : 0.2
				});
				expect(instr.portamento).to.equal(0.2);
				instr.dispose();
			});

			it ("set the portamento", function(){
				var instr = new Monophonic();
				instr.portamento = 0.4;
				expect(instr.portamento).to.equal(0.4);
				instr.dispose();
			});

		});
	});
});