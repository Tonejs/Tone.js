import BasicTests from "helper/Basic";
import OmniOscillator from "Tone/source/OmniOscillator";
import Offline from "helper/Offline";
import SourceTests from "helper/SourceTests";
import OscillatorTests from "helper/OscillatorTests";
import OutputAudio from "helper/OutputAudio";
import CompareToFile from "helper/CompareToFile";

describe("OmniOscillator", function(){

	//run the common tests
	BasicTests(OmniOscillator);
	SourceTests(OmniOscillator);
	OscillatorTests(OmniOscillator);

	it("matches a file", function(){
		return CompareToFile(function(){
			var osc = new OmniOscillator(220, "fmsquare").toMaster();
			osc.start(0.1).stop(0.2);
		}, "omniOscillator.wav", 1.6);
	});

	context("Sound", function(){

		it("makes a sound", function(){
			return OutputAudio(function(){
				var osc = new OmniOscillator();
				osc.toMaster();
				osc.start();
			});
		});

		it("makes a sound when set to square", function(){
			return OutputAudio(function(){
				var osc = new OmniOscillator(440, "square");
				osc.toMaster();
				osc.start();
			});
		});

		it("makes a sound when set to pulse", function(){
			return OutputAudio(function(){
				var osc = new OmniOscillator(440, "pulse");
				osc.toMaster();
				osc.start();
			});
		});

		it("makes a sound when set to pwm", function(){
			return OutputAudio(function(){
				var osc = new OmniOscillator(440, "pwm");
				osc.toMaster();
				osc.start();
			});
		});

		it("makes a sound when set to fm", function(){
			return OutputAudio(function(){
				var osc = new OmniOscillator(440, "fmsquare");
				osc.toMaster();
				osc.start();
			});
		});

		it("makes a sound when set to am", function(){
			return OutputAudio(function(){
				var osc = new OmniOscillator(440, "amsine");
				osc.toMaster();
				osc.start();
			});
		});

		it("makes a sound when set to fat", function(){
			return OutputAudio(function(){
				var osc = new OmniOscillator(440, "fatsawtooth");
				osc.toMaster();
				osc.start();
			});
		});

		it("can switch type after playing", function(){
			return OutputAudio(function(){
				var osc = new OmniOscillator(440, "amsine");
				osc.toMaster();
				osc.start();
				osc.type = "fmsine";
			});
		});

	});

	context("Type", function(){

		it("can get and set the type", function(){
			var osc = new OmniOscillator({
				"type" : "sawtooth",
			});
			expect(osc.type).to.equal("sawtooth");
			osc.dispose();
		});

		it("handles various types", function(){
			var osc = new OmniOscillator();
			var types = ["triangle3", "sine", "pulse", "pwm", "amsine4", "fatsquare2", "fmsawtooth"];
			for (var i = 0; i < types.length; i++){
				osc.type = types[i];
				expect(osc.type).to.equal(types[i]);
			}
			osc.dispose();
		});

		it("throws an error if invalid type is set", function(){
			var osc = new OmniOscillator();
			expect(function(){
				osc.type = "invalid";
			}).to.throw(Error);
			osc.dispose();
		});

		it("can set extended types", function(){
			var osc = new OmniOscillator();
			osc.type = "sine5";
			expect(osc.type).to.equal("sine5");
			osc.type = "triangle2";
			expect(osc.type).to.equal("triangle2");
			osc.dispose();
		});

		it("can set the modulation frequency only when type is pwm", function(){
			var omni = new OmniOscillator();
			omni.type = "pwm";
			expect(function(){
				omni.modulationFrequency.value = 0.2;
			}).to.not.throw(Error);
			omni.type = "pulse";
			expect(function(){
				omni.modulationFrequency.value = 0.2;
			}).to.throw(Error);
			omni.dispose();
		});

		it("can set the modulation width only when type is pulse", function(){
			var omni = new OmniOscillator();
			omni.type = "pulse";
			expect(function(){
				omni.width.value = 0.2;
			}).to.not.throw(Error);
			omni.type = "sine";
			expect(function(){
				omni.width.value = 0.2;
			}).to.throw(Error);
			omni.dispose();
		});

		it("can be set to an FM oscillator", function(){
			var omni = new OmniOscillator();
			omni.set({
				"type" : "fmsquare2",
				"modulationIndex" : 2
			});
			expect(omni.type).to.equal("fmsquare2");
			expect(omni.modulationIndex.value).to.equal(2);
			omni.dispose();
		});

		it("can be set to an AM oscillator", function(){
			var omni = new OmniOscillator();
			omni.set("type", "amsquare");
			omni.modulationType = "sawtooth2";
			expect(omni.type).to.equal("amsquare");
			expect(omni.modulationType).to.equal("sawtooth2");
			omni.dispose();
		});

		it("can be set to an FatOscillator", function(){
			var omni = new OmniOscillator({
				"type" : "fatsquare2",
				"count" : 4,
				"spread" : 25
			});
			expect(omni.type).to.equal("fatsquare2");
			expect(omni.count).to.equal(4);
			expect(omni.spread).to.equal(25);
			omni.dispose();
		});

		it("can get/set the partialCount", function(){
			var omni = new OmniOscillator({
				"type" : "square2",
			});
			expect(omni.partialCount).to.equal(2);
			omni.partialCount = 3;
			expect(omni.partialCount).to.equal(3);
			expect(omni.type).to.equal("square3");
			omni.dispose();
		});

		it("can get/set the sourceType", function(){
			var omni = new OmniOscillator({
				type : "fatsquare3"
			});
			expect(omni.type).to.equal("fatsquare3");
			expect(omni.sourceType).to.equal("fat");
			omni.sourceType = "oscillator";
			expect(omni.sourceType).to.equal("oscillator");
			expect(omni.type).to.equal("square3");
			omni.sourceType = "pulse";
			expect(omni.sourceType).to.equal("pulse");
			expect(omni.type).to.equal("pulse");
			omni.sourceType = "fm";
			expect(omni.sourceType).to.equal("fm");
			expect(omni.type).to.equal("fmsine");
			omni.sourceType = "pwm";
			expect(omni.sourceType).to.equal("pwm");
			expect(omni.type).to.equal("pwm");
			omni.sourceType = "am";
			expect(omni.sourceType).to.equal("am");
			expect(omni.type).to.equal("amsine");
			omni.sourceType = "fat";
			expect(omni.type).to.equal("fatsine");
			omni.dispose();
		});

		it("can get/set the baseType", function(){
			var omni = new OmniOscillator({
				type : "fatsquare3"
			});
			expect(omni.type).to.equal("fatsquare3");
			expect(omni.sourceType).to.equal("fat");
			expect(omni.baseType).to.equal("square");
			expect(omni.partialCount).to.equal(3);
			omni.partialCount = 2;
			expect(omni.type).to.equal("fatsquare2");
			omni.type = "amsine";
			expect(omni.baseType).to.equal("sine");
			omni.baseType = "square";
			expect(omni.type).to.equal("amsquare");
			omni.type = "pwm";
			expect(omni.baseType).to.equal("pwm");
			omni.type = "triangle4";
			expect(omni.baseType).to.equal("triangle");
			omni.baseType = "square";
			expect(omni.type).to.equal("square4");
			omni.dispose();
		});

		it("can set a FM oscillator with partials", function(){
			var omni = new OmniOscillator({
				"detune" : 4,
				"type" : "fmcustom",
				"partials" : [2, 1, 2, 2],
				"phase" : 120,
				"volume" : -2,
				"harmonicity" : 2
			});
			expect(omni.volume.value).to.be.closeTo(-2, 0.01);
			expect(omni.detune.value).to.be.closeTo(4, 0.01);
			expect(omni.phase).to.be.closeTo(120, 0.01);
			expect(omni.type).to.be.equal("fmcustom");
			expect(omni.partials).to.deep.equal([2, 1, 2, 2]);
			expect(omni.harmonicity.value).be.closeTo(2, 0.01);
			omni.dispose();
		});

		it("setting/getting values when the wrong type is set has no effect", function(){
			var omni = new OmniOscillator(440, "sine");
			omni.set({
				"modulationIndex" : 4,
				"harmonicity" : 3,
			});
			omni.spread = 40;
			expect(omni.spread).to.be.undefined;
			omni.count = 5;
			expect(omni.count).to.be.undefined;
			omni.modulationType = "sine";
			expect(omni.modulationType).to.be.undefined;
			expect(omni.modulationIndex).to.be.undefined;
			expect(omni.harmonicity).to.be.undefined;
			omni.dispose();
		});
	});
});

