define(["helper/Basic", "Tone/source/AMOscillator", "helper/Offline", "helper/SourceTests", "helper/OscillatorTests", "Test"], 
	function (BasicTests, AMOscillator, Offline, SourceTests, OscillatorTests, Test) {

	describe("AMOscillator", function(){

		//run the common tests
		BasicTests(AMOscillator);
		SourceTests(AMOscillator);
		OscillatorTests(AMOscillator);

		context("Amplitude Modulation", function(){

			it("can pass in parameters in the constructor", function(){
				var fmOsc = new AMOscillator({
					"harmonicity" : 3,
					"modulationType" : "square3"
				});
				expect(fmOsc.harmonicity.value).to.be.closeTo(3, 0.001);
				expect(fmOsc.modulationType).to.equal("square3");
				fmOsc.dispose();
			});

			it("can set the harmonicity", function(){
				var fmOsc = new AMOscillator();
				fmOsc.harmonicity.value = 0.2;
				expect(fmOsc.harmonicity.value).to.be.closeTo(0.2, 0.001);
				fmOsc.dispose();
			});

			it("can set the modulationType", function(){
				var fmOsc = new AMOscillator();
				fmOsc.modulationType = "triangle5";
				expect(fmOsc.modulationType).to.equal("triangle5");
				fmOsc.dispose();
			});


		});
	});

});