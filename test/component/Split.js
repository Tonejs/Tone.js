define(["Tone/component/Merge", "helper/Basic", "helper/PassAudio", "helper/PassAudioStereo",
	"helper/Test", "helper/Offline", "Tone/signal/Signal", "Tone/component/Split",
	"Tone/core/Tone", "helper/ConstantOutput", "helper/StereoSignal"],
function(Merge, Basic, PassAudio, PassAudioStereo, Test, Offline, Signal, Split, Tone, ConstantOutput, StereoSignal){
	describe("Split", function(){

		Basic(Split);

		context("Splitting", function(){

			it("handles input and output connections", function(){
				var split = new Split();
				Test.connect(split);
				split.connect(Test);
				split.dispose();
			});

			it("defaults to two channels", function(){
				var split = new Split();
				expect(split.numberOfOutputs).to.equal(2);
				split.dispose();
			});

			it("can pass in more channels", function(){
				var split = new Split(4);
				expect(split.numberOfOutputs).to.equal(4);
				split.connect(Test, 0, 0);
				split.connect(Test, 1, 0);
				split.connect(Test, 2, 0);
				split.connect(Test, 3, 0);
				split.dispose();
			});

			it("passes the incoming signal through on the left side", function(){
				return ConstantOutput(function(){
					var split = new Split();
					var signal = StereoSignal(1, 2).connect(split);
					split.left.toMaster();
				}, 1);
			});

			it("passes the incoming signal through on the right side", function(){
				return ConstantOutput(function(){
					var split = new Split();
					var signal = StereoSignal(1, 2).connect(split);
					split.right.toMaster();
				}, 2);
			});

			it("merges two signal into one stereo signal and then split them back into two signals on left side", function(){
				return ConstantOutput(function(){
					var split = new Split();
					var signal = StereoSignal(1, 2).connect(split);
					split.connect(Tone.Master, 0, 0);
				}, 1);
			});

			it("merges two signal into one stereo signal and then split them back into two signals on right side", function(){
				return ConstantOutput(function(){
					var split = new Split();
					var signal = StereoSignal(1, 2).connect(split);
					split.connect(Tone.Master, 1, 0);
				}, 2);
			});
		});
	});
});
