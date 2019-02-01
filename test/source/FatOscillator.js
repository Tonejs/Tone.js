import BasicTests from "helper/Basic";
import FatOscillator from "Tone/source/FatOscillator";
import Offline from "helper/Offline";
import SourceTests from "helper/SourceTests";
import OscillatorTests from "helper/OscillatorTests";
import CompareToFile from "helper/CompareToFile";

describe("FatOscillator", function(){

	//run the common tests
	BasicTests(FatOscillator);
	SourceTests(FatOscillator);
	OscillatorTests(FatOscillator);

	it("matches a file", function(){
		return CompareToFile(function(){
			var osc = new FatOscillator().toMaster();
			osc.start(0);
		}, "fatOscillator.wav", 0.2);
	});

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

		it("can set the count after starting", function(){
			var fatOsc = new FatOscillator({
				"count" : 3
			});
			fatOsc.start();
			fatOsc.count = 4;
			expect(fatOsc.count).to.equal(4);
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

		it("can get/set the baseType", function(){
			var osc = new FatOscillator();
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

