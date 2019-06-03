import BasicTests from "helper/Basic";
import FMOscillator from "Tone/source/FMOscillator";
import Offline from "helper/Offline";
import SourceTests from "helper/SourceTests";
import OscillatorTests from "helper/OscillatorTests";
import Test from "helper/Test";
import CompareToFile from "helper/CompareToFile";

describe("FMOscillator", function(){

	//run the common tests
	BasicTests(FMOscillator);
	SourceTests(FMOscillator);
	OscillatorTests(FMOscillator);

	it("matches a file", function(){
		return CompareToFile(function(){
			var osc = new FMOscillator().toMaster();
			osc.start(0);
		}, "fmOscillator.wav", 0.01);
	});

	context("Frequency Modulation", function(){

		it("can pass in parameters in the constructor", function(){
			var fmOsc = new FMOscillator({
				"type" : "triangle2",
				"harmonicity" : 3,
				"modulationType" : "square3"
			});
			expect(fmOsc.type).to.equal("triangle2");
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

		it("can get/set the baseType", function(){
			var osc = new FMOscillator();
			osc.type = "sine5";
			expect(osc.baseType).to.equal("sine");
			osc.baseType = "triangle";
			expect(osc.type).to.equal("triangle5");
			expect(osc.partialCount).to.equal(5);
			osc.partialCount = 2;
			expect(osc.type).to.equal("triangle2");
			osc.baseType = "custom";
			expect(osc.type).to.equal("custom");
			osc.partials = [1, 2, 3];
			expect(osc.baseType).to.equal("custom");
			osc.baseType = "square";
			expect(osc.type).to.equal("square");
			osc.dispose();
		});

	});
});

