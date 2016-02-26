define(["helper/Basic", "Tone/source/PWMOscillator", "helper/Offline", "helper/SourceTests", "helper/OscillatorTests", "Test"], 
	function (BasicTests, PWMOscillator, Offline, SourceTests, OscillatorTests, Test) {

	describe("PWMOscillator", function(){

		//run the common tests
		BasicTests(PWMOscillator);
		SourceTests(PWMOscillator);
		OscillatorTests(PWMOscillator);

		context("Modulation Frequency", function(){

			it("can set the modulation frequency", function(){
				var pwm = new PWMOscillator();
				pwm.modulationFrequency.value = 0.2;
				expect(pwm.modulationFrequency.value).to.be.closeTo(0.2, 0.001);
				pwm.dispose();
			});

			it("can connect a signal to the modulationFrequency", function(){
				var pwm = new PWMOscillator();
				Test.connect(pwm.modulationFrequency);
				pwm.dispose();
			});

		});
	});

});