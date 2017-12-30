define(["Tone/component/Merge", "helper/Basic", "helper/PassAudio", "helper/PassAudioStereo", 
	"Test", "helper/Offline", "Tone/signal/Signal", "Tone/component/Split", 
	"Tone/core/Tone", "helper/ConstantOutput"], 
function (Merge, Basic, PassAudio, PassAudioStereo, Test, Offline, Signal, Split, Tone, ConstantOutput) {
	describe("Split", function(){

		Basic(Split);

		context("Splitting", function(){

			it("handles input and output connections", function(){
				var split = new Split();
				Test.connect(split);
				split.connect(Test);
				split.dispose();
			});

			it("passes the incoming signal through on the left side", function(){
				return ConstantOutput(function(){
					var input = new Signal(1);
					var split = new Split();
					input.connect(split);
					split.left.toMaster();
				}, 1);
			});

			it("passes the incoming signal through on the right side", function(){
				return ConstantOutput(function(){
					var input = new Signal(1);
					var split = new Split();
					input.connect(split);
					split.right.toMaster();
				}, 1);
			});

			it("merges two signal into one stereo signal and then split them back into two signals on left side", function(){
				return ConstantOutput(function(){
					var sigL = new Signal(1);
					var sigR = new Signal(2);
					var merger = new Merge();
					var split = new Split();
					sigL.connect(merger.left);
					sigR.connect(merger.right);
					merger.connect(split);
					split.connect(Tone.Master, 0, 0);
				}, 1);
			});

			it("merges two signal into one stereo signal and then split them back into two signals on right side", function(){
				return ConstantOutput(function(){
					var sigL = new Signal(1);
					var sigR = new Signal(2);
					var merger = new Merge();
					var split = new Split();
					sigL.connect(merger.left);
					sigR.connect(merger.right);
					merger.connect(split);
					split.connect(Tone.Master, 1, 0);
				}, 2);
			});
		});
	});
});
