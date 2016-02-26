define(["Tone/component/Merge", "helper/Basic", "helper/PassAudio", "helper/PassAudioStereo", 
	"Test", "helper/Offline", "Tone/signal/Signal", "Tone/component/Split"], 
function (Merge, Basic, PassAudio, PassAudioStereo, Test, Offline, Signal, Split) {
	describe("Split", function(){

		Basic(Split);

		context("Splitting", function(){

			it("handles input and output connections", function(){
				var split = new Split();
				Test.connect(split);
				split.connect(Test);
				split.dispose();
			});

			it("passes the incoming signal through on the left side", function(done){
				var split;
				PassAudioStereo(function(input, output){
					split = new Split();
					input.connect(split);
					split.left.connect(output);
				}, function(){
					split.dispose();
					done();
				});
			});

			it("passes the incoming signal through on the right side", function(done){
				var split;
				PassAudioStereo(function(input, output){
					split = new Split();
					input.connect(split);
					split.right.connect(output);
				}, function(){
					split.dispose();
					done();
				});
			});

			it("merges two signal into one stereo signal and then split them back into two signals on left side", function(done){
				var sigL, sigR, merger, split;			
				var offline = new Offline(0.1)
					.before(function(dest){
						sigL = new Signal(1);
						sigR = new Signal(2);
						merger = new Merge();
						split = new Split();
						sigL.connect(merger.left);
						sigR.connect(merger.right);
						merger.connect(split);
						split.connect(dest, 0, 0);
					})
					.test(function(sample){
						expect(sample).to.equal(1);
					})
					.after(function(){
						sigL.dispose();
						sigR.dispose();
						merger.dispose();
						split.dispose();
						done();
					})
					.run();
			});

			it("merges two signal into one stereo signal and then split them back into two signals on right side", function(done){
				var sigL, sigR, merger, split;			
				var offline = new Offline(0.1)
					.before(function(dest){
						sigL = new Signal(1);
						sigR = new Signal(2);
						merger = new Merge();
						split = new Split();
						sigL.connect(merger.left);
						sigR.connect(merger.right);
						merger.connect(split);
						split.connect(dest, 1, 0);
					})
					.test(function(sample){
						expect(sample).to.equal(2);
					})
					.after(function(){
						sigL.dispose();
						sigR.dispose();
						merger.dispose();
						split.dispose();
						done();
					})
					.run();
			});
		});
	});
});