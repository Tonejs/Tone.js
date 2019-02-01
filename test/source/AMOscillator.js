import BasicTests from "helper/Basic";
import AMOscillator from "Tone/source/AMOscillator";
import Offline from "helper/Offline";
import SourceTests from "helper/SourceTests";
import OscillatorTests from "helper/OscillatorTests";
import Test from "helper/Test";
import CompareToFile from "helper/CompareToFile";

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

		it("can get/set the baseType", function(){
			var osc = new AMOscillator();
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
			expect(osc.partials).to.deep.equal([1, 2, 3]);
			osc.baseType = "square";
			expect(osc.type).to.equal("square");
			osc.dispose();
		});

	});
});

