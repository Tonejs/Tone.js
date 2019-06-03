import LowpassCombFilter from "Tone/component/LowpassCombFilter";
import Basic from "helper/Basic";
import Offline from "helper/Offline";
import Test from "helper/Test";
import Signal from "Tone/signal/Signal";
import PassAudio from "helper/PassAudio";
import PassAudioStereo from "helper/PassAudioStereo";
import Oscillator from "Tone/source/Oscillator";
describe("LowpassCombFilter", function(){

	Basic(LowpassCombFilter);

	context("Comb Filtering", function(){

		it("handles input and output connections", function(){
			var lpcf = new LowpassCombFilter();
			Test.connect(lpcf);
			lpcf.connect(Test);
			lpcf.dispose();
		});

		it("can be constructed with an object", function(){
			var lpcf = new LowpassCombFilter({
				"delayTime" : 0.2,
				"resonance" : 0.3,
				"dampening" : 2400
			});
			expect(lpcf.delayTime.value).to.be.closeTo(0.2, 0.001);
			expect(lpcf.resonance.value).to.be.closeTo(0.3, 0.001);
			expect(lpcf.dampening.value).to.be.closeTo(2400, 0.001);
			lpcf.dispose();
		});

		it("can be get and set through object", function(){
			var lpcf = new LowpassCombFilter();
			lpcf.set({
				"delayTime" : 0.2,
				"resonance" : 0.3,
				"dampening" : 2000
			});
			expect(lpcf.get().delayTime).to.be.closeTo(0.2, 0.001);
			expect(lpcf.get().resonance).to.be.closeTo(0.3, 0.001);
			expect(lpcf.get().dampening).to.be.closeTo(2000, 0.001);
			lpcf.dispose();
		});

		it("passes the incoming signal through", function(){
			return PassAudio(function(input){
				var lpcf = new LowpassCombFilter(0).toMaster();
				input.connect(lpcf);
			});
		});

		it("produces a decay signal at high resonance", function(){
			return Offline(function(){
				var lpcf = new LowpassCombFilter(0.01, 0.9, 5000).toMaster();
				var burst = new Oscillator(440).connect(lpcf);
				burst.start(0);
				burst.stop(0.1);
			}, 0.8).then(function(buffer){
				expect(buffer.getRmsAtTime(0.05)).to.be.within(0.2, 0.6);
				expect(buffer.getRmsAtTime(0.1)).to.be.within(0.2, 0.6);
				expect(buffer.getRmsAtTime(0.15)).to.be.within(0.15, 0.4);
				expect(buffer.getRmsAtTime(0.3)).to.be.within(0.01, 0.15);
				expect(buffer.getRmsAtTime(0.7)).to.be.below(0.01);
			});
		});

		it("produces a decay signal at moderate resonance", function(){
			return Offline(function(){
				var lpcf = new LowpassCombFilter(0.05, 0.5).toMaster();
				var burst = new Oscillator(440).connect(lpcf);
				burst.start(0);
				burst.stop(0.1);
			}, 0.6).then(function(buffer){
				expect(buffer.getRmsAtTime(0.05)).to.be.closeTo(0.7, 0.1);
				expect(buffer.getRmsAtTime(0.1)).to.be.within(0.7, 1.1);
				expect(buffer.getRmsAtTime(0.2)).to.be.closeTo(0.25, 0.1);
				expect(buffer.getRmsAtTime(0.4)).to.be.closeTo(0.015, 0.01);
			});
		});

		it("passes the incoming stereo signal through", function(){
			return PassAudioStereo(function(input){
				var lpcf = new LowpassCombFilter(0).toMaster();
				input.connect(lpcf);
			});
		});
	});
});

