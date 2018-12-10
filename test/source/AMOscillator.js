define(["helper/Basic", "Tone/source/AMOscillator", "helper/Offline",
	"helper/SourceTests", "helper/OscillatorTests", "helper/Test", "helper/CompareToFile"],
function(BasicTests, AMOscillator, Offline, SourceTests, OscillatorTests, Test, CompareToFile){

	describe("AMOscillator", function(){

		//run the common tests
		BasicTests(AMOscillator);
		SourceTests(AMOscillator);
		OscillatorTests(AMOscillator);

		it("matches a file", function(){
			return CompareToFile(function(){
				var osc = new AMOscillator().toMaster();
				osc.start(0.1).stop(0.4);
			}, "amOscillator.wav", 0.01);
		});

		context("Amplitude Modulation", function(){

			it("can pass in parameters in the constructor", function(){
				var amOsc = new AMOscillator({
					"type" : "triangle2",
					"harmonicity" : 3,
					"modulationType" : "square3"
				});
				expect(amOsc.type).to.equal("triangle2");
				expect(amOsc.harmonicity.value).to.be.closeTo(3, 0.001);
				expect(amOsc.modulationType).to.equal("square3");
				amOsc.dispose();
			});

			it("can set the harmonicity", function(){
				var amOsc = new AMOscillator();
				amOsc.harmonicity.value = 0.2;
				expect(amOsc.harmonicity.value).to.be.closeTo(0.2, 0.001);
				amOsc.dispose();
			});

			it("can set the modulationType", function(){
				var amOsc = new AMOscillator();
				amOsc.modulationType = "triangle5";
				expect(amOsc.modulationType).to.equal("triangle5");
				amOsc.dispose();
			});

		});
	});

});
