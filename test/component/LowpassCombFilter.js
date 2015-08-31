define(["Tone/component/LowpassCombFilter", "helper/Basic", "helper/Offline", "Test", 
	"Tone/signal/Signal", "helper/PassAudio", "helper/PassAudioStereo"], 
function (LowpassCombFilter, Basic, Offline, Test, Signal, PassAudio, PassAudioStereo) {
	describe("LowpassCombFilter", function(){

		Basic(LowpassCombFilter);

		context("Comb Filtering", function(){

			it("handles input and output connections", function(){
				var fbcf = new LowpassCombFilter();
				Test.connect(fbcf);
				fbcf.connect(Test);
				fbcf.dispose();
			});

			it("can be constructed with an object", function(){
				var fbcf = new LowpassCombFilter({
					"delayTime" : 0.2,
					"resonance" : 0.3,
					"dampening" : 2400
				});
				expect(fbcf.delayTime.value).to.be.closeTo(0.2, 0.001);
				expect(fbcf.resonance.value).to.be.closeTo(0.3, 0.001);
				expect(fbcf.dampening.value).to.be.closeTo(2400, 0.001);
				fbcf.dispose();
			});

			it("can be get and set through object", function(){
				var fbcf = new LowpassCombFilter();
				fbcf.set({
					"delayTime" : 0.2,
					"resonance" : 0.3,
					"dampening" : 2000
				});
				expect(fbcf.get().delayTime).to.be.closeTo(0.2, 0.001);
				expect(fbcf.get().resonance).to.be.closeTo(0.3, 0.001);
				expect(fbcf.get().dampening).to.be.closeTo(2000, 0.001);
				fbcf.dispose();
			});

			it("passes the incoming signal through", function(done){
				var fbcf;
				PassAudio(function(input, output){
					fbcf = new LowpassCombFilter();
					input.connect(fbcf);
					fbcf.connect(output);
				}, function(){
					fbcf.dispose();
					done();
				});
			});

			it("passes the incoming stereo signal through", function(done){
				var fbcf;
				PassAudioStereo(function(input, output){
					fbcf = new LowpassCombFilter();
					input.connect(fbcf);
					fbcf.connect(output);
				}, function(){
					fbcf.dispose();
					done();
				});
			});
		});
	});
});