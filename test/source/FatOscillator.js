define(["helper/Basic", "Tone/source/FatOscillator", "helper/Offline", "helper/SourceTests", "helper/OscillatorTests"], 
	function (BasicTests, FatOscillator, Offline, SourceTests, OscillatorTests) {

	describe("FatOscillator", function(){

		//run the common tests
		BasicTests(FatOscillator);
		SourceTests(FatOscillator);
		OscillatorTests(FatOscillator);

		context("Detuned Oscillators", function(){

			it("can pass in parameters in the constructor", function(){
				var fatOsc = new FatOscillator({
					"spread" : 25,
					"count" : 4
				});
				expect(fatOsc.spread).to.be.equal(25);
				expect(fatOsc.count).to.equal(4);
				fatOsc.dispose();
			});

			it("can set the partials and the count", function(){
				var fatOsc = new FatOscillator({
					"count" : 3
				});
				fatOsc.partials = [0, 2, 3, 4];
				expect(fatOsc.partials).to.deep.equal([0, 2, 3, 4]);
				expect(fatOsc.type).to.equal("custom");
				fatOsc.count = 4;
				expect(fatOsc.partials).to.deep.equal([0, 2, 3, 4]);
				expect(fatOsc.type).to.equal("custom");
				fatOsc.dispose();
			});

			it("correctly distributes the detune spread", function(){
				var fatOsc = new FatOscillator({
					"spread" : 20,
					"count" : 2
				});
				expect(fatOsc._oscillators.length).to.equal(2);
				expect(fatOsc._oscillators[0].detune.value).to.equal(-10);
				expect(fatOsc._oscillators[1].detune.value).to.equal(10);
				fatOsc.dispose();
			});

		});
	});

});