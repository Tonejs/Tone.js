define(["helper/Basic", "Tone/source/FMOscillator", "helper/Offline", "helper/SourceTests", "helper/OscillatorTests", "Test"], 
	function (BasicTests, FMOscillator, Offline, SourceTests, OscillatorTests, Test) {

	describe("FMOscillator", function(){

		//run the common tests
		BasicTests(FMOscillator);
		SourceTests(FMOscillator);
		OscillatorTests(FMOscillator);

		context("Frequency Modulation", function(){

			it("can pass in parameters in the constructor", function(){
				var fmOsc = new FMOscillator({
					"harmonicity" : 3,
					"modulationType" : "square3"
				});
				expect(fmOsc.harmonicity.value).to.be.closeTo(3, 0.001);
				expect(fmOsc.modulationType).to.equal("square3");
				fmOsc.dispose();
			});

			it("can set the harmonicity", function(){
				var fmOsc = new FMOscillator();
				fmOsc.harmonicity.value = 0.2;
				expect(fmOsc.harmonicity.value).to.be.closeTo(0.2, 0.001);
				fmOsc.dispose();
			});

			it("can set the modulationIndex", function(){
				var fmOsc = new FMOscillator({
					"modulationIndex" : 3,
				});
				expect(fmOsc.modulationIndex.value).to.be.closeTo(3, 0.001);
				fmOsc.modulationIndex.value = 0.2;
				expect(fmOsc.modulationIndex.value).to.be.closeTo(0.2, 0.001);
				fmOsc.dispose();
			});

			it("can connect a signal to the harmonicity", function(){
				var fmOsc = new FMOscillator();
				Test.connect(fmOsc.harmonicity);
				fmOsc.dispose();
			});

			it("can set the modulationType", function(){
				var fmOsc = new FMOscillator();
				fmOsc.modulationType = "triangle5";
				expect(fmOsc.modulationType).to.equal("triangle5");
				fmOsc.dispose();
			});


		});
	});

});