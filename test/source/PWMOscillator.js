import BasicTests from "helper/Basic";
import PWMOscillator from "Tone/source/PWMOscillator";
import Offline from "helper/Offline";
import SourceTests from "helper/SourceTests";
import OscillatorTests from "helper/OscillatorTests";
import Test from "helper/Test";
import CompareToFile from "helper/CompareToFile";

describe("PWMOscillator", function(){

	//run the common tests
	BasicTests(PWMOscillator);
	SourceTests(PWMOscillator);
	OscillatorTests(PWMOscillator);

	it("matches a file", function(){
		return CompareToFile(function(){
			var osc = new PWMOscillator().toMaster();
			osc.start(0.1);
		}, "pwmOscillator.wav");
	});

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

	context("Types", function(){
		it("reports it's type", function(){
			var osc = new PWMOscillator();
			expect(osc.type).to.equal("pwm");
			expect(osc.baseType).to.equal("pwm");
			expect(osc.partials).to.deep.equal([]);
			osc.dispose();
		});
	});
});

