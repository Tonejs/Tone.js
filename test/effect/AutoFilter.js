import AutoFilter from "Tone/effect/AutoFilter";
import Basic from "helper/Basic";
import EffectTests from "helper/EffectTests";
import teoria from "teoria";
import Offline from "helper/Offline";

describe("AutoFilter", function(){
	Basic(AutoFilter);
	EffectTests(AutoFilter);

	context("API", function(){

		it("can pass in options in the constructor", function(){
			var autoFilter = new AutoFilter({
				"baseFrequency" : 2000,
				"octaves" : 2,
				"type" : "sawtooth"
			});
			expect(autoFilter.baseFrequency).to.be.closeTo(2000, 0.1);
			expect(autoFilter.octaves).to.equal(2);
			expect(autoFilter.type).to.equal("sawtooth");
			autoFilter.dispose();
		});

		it("can be started and stopped", function(){
			var autoFilter = new AutoFilter();
			autoFilter.start().stop("+0.2");
			autoFilter.dispose();
		});

		it("can get/set the options", function(){
			var autoFilter = new AutoFilter();
			autoFilter.set({
				"baseFrequency" : 1200,
				"frequency" : 2.4,
				"type" : "triangle"
			});
			expect(autoFilter.get().baseFrequency).to.be.closeTo(1200, 0.01);
			expect(autoFilter.get().frequency).to.be.closeTo(2.4, 0.01);
			expect(autoFilter.get().type).to.equal("triangle");
			autoFilter.dispose();
		});

		it("can set the frequency and depth", function(){
			var autoFilter = new AutoFilter();
			autoFilter.depth.value = 0.4;
			autoFilter.frequency.value = 0.4;
			expect(autoFilter.depth.value).to.be.closeTo(0.4, 0.01);
			expect(autoFilter.frequency.value).to.be.closeTo(0.4, 0.01);
			autoFilter.dispose();
		});

		it("can set the filter options", function(){
			var autoFilter = new AutoFilter();
			autoFilter.filter.Q.value = 2;
			expect(autoFilter.filter.Q.value).to.be.closeTo(2, 0.01);
			autoFilter.dispose();
		});

		it("accepts baseFrequency and octaves as frequency values", function(){
			var autoFilter = new AutoFilter("2n", "C2", 4);
			expect(autoFilter.baseFrequency).to.be.closeTo(teoria.note("C2").fq(), 0.01);
			expect(autoFilter.octaves).to.equal(4);
			autoFilter.dispose();
		});

		it("can sync the frequency to the Transport", function(){

			return Offline(function(Transport){
				var autoFilter = new AutoFilter(2);
				autoFilter.sync();
				autoFilter.frequency.toMaster();
				Transport.bpm.setValueAtTime(Transport.bpm.value * 2, 0.05);
				// Transport.start(0)
			}, 0.1).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(2, 0.1);
				expect(buffer.getValueAtTime(0.05)).to.be.closeTo(4, 0.1);
			});
		});

		it("can unsync the frequency to the Transport", function(){

			return Offline(function(Transport){
				var autoFilter = new AutoFilter(2);
				autoFilter.sync();
				autoFilter.frequency.toMaster();
				Transport.bpm.setValueAtTime(Transport.bpm.value * 2, 0.05);
				autoFilter.unsync();
			}, 0.1).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(2, 0.1);
				expect(buffer.getValueAtTime(0.05)).to.be.closeTo(2, 0.1);
			});
		});
	});
});

