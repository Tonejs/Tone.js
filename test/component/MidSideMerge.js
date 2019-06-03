import MidSideMerge from "Tone/component/MidSideMerge";
import Basic from "helper/Basic";
import Signal from "Tone/signal/Signal";
import PassAudioStereo from "helper/PassAudioStereo";
import Test from "helper/Test";

describe("MidSideMerge", function(){

	Basic(MidSideMerge);

	context("Merging", function(){

		it("handles inputs and outputs", function(){
			var merge = new MidSideMerge();
			merge.connect(Test);
			Test.connect(merge.mid);
			Test.connect(merge.side);
			merge.dispose();
		});

		it("passes the mid signal through", function(){
			return PassAudioStereo(function(input){
				var merge = new MidSideMerge().toMaster();
				input.connect(merge.mid);
			});
		});

		it("passes the side signal through", function(){
			return PassAudioStereo(function(input){
				var merge = new MidSideMerge().toMaster();
				input.connect(merge.side);
			});
		});
	});
});

