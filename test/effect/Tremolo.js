import Tremolo from "Tone/effect/Tremolo";
import Basic from "helper/Basic";
import EffectTests from "helper/EffectTests";
import Offline from "helper/Offline";

describe("Tremolo", function(){
	Basic(Tremolo);
	EffectTests(Tremolo);

	context("API", function(){

		it("can pass in options in the constructor", function(){
			var tremolo = new Tremolo({
				"depth" : 0.2,
				"type" : "sawtooth",
				"spread" : 160,
			});
			expect(tremolo.depth.value).to.be.closeTo(0.2, 0.001);
			expect(tremolo.type).to.equal("sawtooth");
			expect(tremolo.spread).to.equal(160);
			tremolo.dispose();
		});

		it("can be started and stopped", function(){
			var tremolo = new Tremolo();
			tremolo.start().stop("+0.2");
			tremolo.dispose();
		});

		it("can get/set the options", function(){
			var tremolo = new Tremolo();
			tremolo.set({
				"frequency" : 2.4,
				"type" : "triangle"
			});
			expect(tremolo.get().frequency).to.be.closeTo(2.4, 0.01);
			expect(tremolo.get().type).to.equal("triangle");
			tremolo.dispose();
		});

		it("can set the frequency and depth", function(){
			var tremolo = new Tremolo();
			tremolo.depth.value = 0.4;
			tremolo.frequency.value = 0.4;
			expect(tremolo.depth.value).to.be.closeTo(0.4, 0.01);
			expect(tremolo.frequency.value).to.be.closeTo(0.4, 0.01);
			tremolo.dispose();
		});

		it("can sync the frequency to the Transport", function(){

			return Offline(function(Transport){
				var tremolo = new Tremolo(2);
				tremolo.sync();
				tremolo.frequency.toMaster();
				Transport.bpm.setValueAtTime(Transport.bpm.value * 2, 0.05);
				// Transport.start(0)
			}, 0.1).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(2, 0.1);
				expect(buffer.getValueAtTime(0.05)).to.be.closeTo(4, 0.1);
			});
		});

		it("can unsync the frequency to the Transport", function(){

			return Offline(function(Transport){
				var tremolo = new Tremolo(2);
				tremolo.sync();
				tremolo.frequency.toMaster();
				Transport.bpm.setValueAtTime(Transport.bpm.value * 2, 0.05);
				tremolo.unsync();
			}, 0.1).then(function(buffer){
				expect(buffer.getValueAtTime(0)).to.be.closeTo(2, 0.1);
				expect(buffer.getValueAtTime(0.05)).to.be.closeTo(2, 0.1);
			});
		});
	});
});

