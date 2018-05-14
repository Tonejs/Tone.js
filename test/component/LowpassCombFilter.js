define(["Tone/component/LowpassCombFilter", "helper/Basic", "helper/Offline", "Test", 
	"Tone/signal/Signal", "helper/PassAudio", "helper/PassAudioStereo"], 
function (LowpassCombFilter, Basic, Offline, Test, Signal, PassAudio, PassAudioStereo) {
	describe("LowpassCombFilter", function(){

		Basic(LowpassCombFilter);

		context("Comb Filtering", function(){

			it("handles input and output connections", function(){
				var lpcf = new LowpassCombFilter();
				Test.connect(lpcf);
				lpcf.connect(Test);
				lpcf.dispose();
			});

			it("can be constructed with an object", function(){
				var lpcf = new LowpassCombFilter({
					"delayTime" : 0.2,
					"resonance" : 0.3,
					"dampening" : 2400
				});
				expect(lpcf.delayTime.value).to.be.closeTo(0.2, 0.001);
				expect(lpcf.resonance.value).to.be.closeTo(0.3, 0.001);
				expect(lpcf.dampening.value).to.be.closeTo(2400, 0.001);
				lpcf.dispose();
			});

			it("can be get and set through object", function(){
				var lpcf = new LowpassCombFilter();
				lpcf.set({
					"delayTime" : 0.2,
					"resonance" : 0.3,
					"dampening" : 2000
				});
				expect(lpcf.get().delayTime).to.be.closeTo(0.2, 0.001);
				expect(lpcf.get().resonance).to.be.closeTo(0.3, 0.001);
				expect(lpcf.get().dampening).to.be.closeTo(2000, 0.001);
				lpcf.dispose();
			});

			it("passes the incoming signal through", function(){
				return PassAudio(function(input){
					var lpcf = new LowpassCombFilter(0).toMaster();
					input.connect(lpcf);
				});
			});

			it("passes the incoming stereo signal through", function(){
				return PassAudioStereo(function(input){
					var lpcf = new LowpassCombFilter(0).toMaster();
					input.connect(lpcf);
				});
			});
		});
	});
});
