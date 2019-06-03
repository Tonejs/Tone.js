import MidSideSplit from "Tone/component/MidSideSplit";
import MidSideMerge from "Tone/component/MidSideMerge";
import Basic from "helper/Basic";
import Signal from "Tone/signal/Signal";
import PassAudioStereo from "helper/PassAudioStereo";
import Test from "helper/Test";
import Offline from "helper/Offline";
import Merge from "Tone/component/Merge";

describe("MidSideSplit", function(){

	Basic(MidSideSplit);

	context("Splitting", function(){

		it("handles inputs and outputs", function(){
			var split = new MidSideSplit();
			Test.connect(split);
			split.mid.connect(Test);
			split.side.connect(Test);
			split.dispose();
		});

		it("mid is if both L and R are the same", function(){
			return Offline(function(){
				var split = new MidSideSplit();
				split.mid.toMaster();
				var merge = new Merge().connect(split);
				new Signal(0.5).connect(merge.left);
				new Signal(0.5).connect(merge.right);
			}).then(function(buffer){
				expect(buffer.min()).to.be.closeTo(0.707, 0.01);
				expect(buffer.max()).to.be.closeTo(0.707, 0.01);
			});
		});

		it("side is 0 if both L and R are the same", function(){
			return Offline(function(){
				var split = new MidSideSplit();
				split.side.toMaster();
				var merge = new Merge().connect(split);
				new Signal(0.5).connect(merge.left);
				new Signal(0.5).connect(merge.right);
			}).then(function(buffer){
				expect(buffer.min()).to.be.closeTo(0, 0.01);
				expect(buffer.max()).to.be.closeTo(0, 0.01);
			});
		});

		it("mid is 0 if both L and R opposites", function(){
			return Offline(function(){
				var split = new MidSideSplit();
				split.mid.toMaster();
				var merge = new Merge().connect(split);
				new Signal(-1).connect(merge.left);
				new Signal(1).connect(merge.right);
			}).then(function(buffer){
				expect(buffer.min()).to.be.closeTo(0, 0.01);
				expect(buffer.max()).to.be.closeTo(0, 0.01);
			});
		});

		it("can decompose and reconstruct a signal", function(){
			return Offline(function(){
				var midSideMerge = new MidSideMerge().toMaster();
				var split = new MidSideSplit();
				split.mid.connect(midSideMerge.mid);
				split.side.connect(midSideMerge.side);
				var merge = new Merge().connect(split);
				new Signal(0.2).connect(merge.left);
				new Signal(0.4).connect(merge.right);
			}, 0.1, 2).then(function(buffer){
				buffer.forEach(function(l, r){
					expect(l).to.be.closeTo(0.2, 0.01);
					expect(r).to.be.closeTo(0.4, 0.01);
				});
			});
		});
	});
});

