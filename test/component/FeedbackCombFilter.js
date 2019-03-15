import FeedbackCombFilter from "Tone/component/FeedbackCombFilter";
import Basic from "helper/Basic";
import Offline from "helper/Offline";
import Test from "helper/Test";
import Signal from "Tone/signal/Signal";
import PassAudio from "helper/PassAudio";
import PassAudioStereo from "helper/PassAudioStereo";
describe("FeedbackCombFilter", function(){

	Basic(FeedbackCombFilter);

	context("Comb Filtering", function(){

		it("handles input and output connections", function(){
			var fbcf = new FeedbackCombFilter();
			Test.connect(fbcf);
			fbcf.connect(Test);
			fbcf.dispose();
		});

		it("can be constructed with an object", function(){
			var fbcf = new FeedbackCombFilter({
				"delayTime" : 0.2,
				"resonance" : 0.3
			});
			expect(fbcf.delayTime.value).to.be.closeTo(0.2, 0.001);
			expect(fbcf.resonance.value).to.be.closeTo(0.3, 0.001);
			fbcf.dispose();
		});

		it("can be get and set through object", function(){
			var fbcf = new FeedbackCombFilter();
			fbcf.set({
				"delayTime" : 0.2,
				"resonance" : 0.3
			});
			expect(fbcf.get().delayTime).to.be.closeTo(0.2, 0.001);
			expect(fbcf.get().resonance).to.be.closeTo(0.3, 0.001);
			fbcf.dispose();
		});

		it("passes the incoming signal through", function(){
			return PassAudio(function(input){
				var fbcf = new FeedbackCombFilter(0).toMaster();
				input.connect(fbcf);
			});
		});

		it("passes the incoming stereo signal through", function(){
			return PassAudioStereo(function(input){
				var fbcf = new FeedbackCombFilter(0).toMaster();
				input.connect(fbcf);
			});
		});
	});
});

