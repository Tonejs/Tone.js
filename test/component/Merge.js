import Merge from "Tone/component/Merge";
import Basic from "helper/Basic";
import PassAudio from "helper/PassAudio";
import PassAudioStereo from "helper/PassAudioStereo";
import Test from "helper/Test";
import Offline from "helper/Offline";
import Signal from "Tone/signal/Signal";
describe("Merge", function(){

	Basic(Merge);

	context("Merging", function(){

		it("handles input and output connections", function(){
			var merge = new Merge();
			Test.connect(merge);
			merge.connect(Test);
			merge.dispose();
		});

		it("defaults to two channels", function(){
			var merge = new Merge();
			expect(merge.numberOfInputs).to.equal(2);
			merge.dispose();
		});

		it("can pass in more channels", function(){
			var merge = new Merge(4);
			expect(merge.numberOfInputs).to.equal(4);
			Test.connect(merge, 0, 0);
			Test.connect(merge, 0, 1);
			Test.connect(merge, 0, 2);
			Test.connect(merge, 0, 3);
			merge.dispose();
		});

		it("passes the incoming signal through", function(){
			return PassAudio(function(input){
				var merge = new Merge().toMaster();
				input.connect(merge);
			});
		});

		it("merge two signal into one stereo signal", function(){
			return Offline(function(){
				var sigL = new Signal(1);
				var sigR = new Signal(2);
				var merger = new Merge();
				sigL.connect(merger.left);
				sigR.connect(merger.right);
				merger.toMaster();
			}, 0.1, 2).then(function(buffer){
				buffer.forEach(function(l, r){
					expect(l).to.be.closeTo(1, 0.001);
					expect(r).to.be.closeTo(2, 0.001);
				});
			});
		});
	});
});

