define(["Tone/component/MidSideMerge", "helper/Basic", 
	"Tone/signal/Signal", "helper/PassAudioStereo", "Test"], 
function (MidSideMerge, Basic, Signal, PassAudioStereo, Test) {

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
});
