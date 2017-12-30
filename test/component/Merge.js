define(["Tone/component/Merge", "helper/Basic", "helper/PassAudio", "helper/PassAudioStereo", 
	"Test", "helper/Offline", "Tone/signal/Signal"], 
function (Merge, Basic, PassAudio, PassAudioStereo, Test, Offline, Signal) {
	describe("Merge", function(){

		Basic(Merge);

		context("Merging", function(){

			it("handles input and output connections", function(){
				var merge = new Merge();
				Test.connect(merge);
				merge.connect(Test);
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
});
