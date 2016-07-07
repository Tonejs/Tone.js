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

			it("passes the incoming signal through", function(done){
				var merge;
				PassAudio(function(input, output){
					merge = new Merge();
					input.connect(merge);
					merge.connect(output);
				}, function(){
					merge.dispose();
					done();
				});
			});


			it("merge two signal into one stereo signal", function(done){
				var sigL, sigR, merger;
				var offline = new Offline(0.1, 2);
				offline.before(function(dest){
					sigL = new Signal(1);
					sigR = new Signal(2);
					merger = new Merge();
					sigL.connect(merger.left);
					sigR.connect(merger.right);
					merger.connect(dest);
				});
				offline.test(function(samples){
					expect(samples[0]).to.be.closeTo(1, 0.001);
					expect(samples[1]).to.be.closeTo(2, 0.001);
				});  
				offline.after(function(){
					sigL.dispose();
					sigR.dispose();
					merger.dispose();
					done();
				});
				offline.run();
			});
		});
	});
});