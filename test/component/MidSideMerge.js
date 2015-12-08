define(["Tone/component/MidSideMerge", "helper/Basic", 
	"Tone/signal/Signal", "helper/PassAudioStereo", "Test"], 
function (MidSideMerge, Basic, Signal, PassAudioStereo, Test) {

	describe("MidSideMerge", function(){

		Basic(MidSideMerge);

		context("Merging", function(){

			it ("handles inputs and outputs", function(){
				var merge = new MidSideMerge();
				merge.connect(Test);
				Test.connect(merge.mid);
				Test.connect(merge.side);
				merge.dispose();
			});

			it("passes the mid signal through", function(done){
				var merge;
				PassAudioStereo(function(input, output){
					merge = new MidSideMerge();
					input.connect(merge.mid);
					merge.connect(output);
				}, function(){
					merge.dispose();
					done();
				});
			});

			it("passes the side signal through", function(done){
				var merge;
				PassAudioStereo(function(input, output){
					merge = new MidSideMerge();
					input.connect(merge.side);
					merge.connect(output);
				}, function(){
					merge.dispose();
					done();
				});
			});
		});
	});
});