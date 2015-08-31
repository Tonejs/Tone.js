define(["Tone/component/FeedbackCombFilter", "helper/Basic", "helper/Offline", "Test", 
	"Tone/signal/Signal", "helper/PassAudio", "helper/PassAudioStereo"], 
function (FeedbackCombFilter, Basic, Offline, Test, Signal, PassAudio, PassAudioStereo) {
	describe("FeedbackCombFilter", function(){

		Basic(FeedbackCombFilter);

		context("Comb Filtering", function(){

			it("handles input and output connections", function(){
				var fbcf = new FeedbackCombFilter();
				Test.connect(fbcf);
				fbcf.connect(Test);
				fbcf.dispose();
			});

			it("can be constructed with an object", function(){
				var fbcf = new FeedbackCombFilter({
					"delayTime" : 0.2,
					"resonance" : 0.3
				});
				expect(fbcf.delayTime.value).to.be.closeTo(0.2, 0.001);
				expect(fbcf.resonance.value).to.be.closeTo(0.3, 0.001);
				fbcf.dispose();
			});

			it("can be get and set through object", function(){
				var fbcf = new FeedbackCombFilter();
				fbcf.set({
					"delayTime" : 0.2,
					"resonance" : 0.3
				});
				expect(fbcf.get().delayTime).to.be.closeTo(0.2, 0.001);
				expect(fbcf.get().resonance).to.be.closeTo(0.3, 0.001);
				fbcf.dispose();
			});

			it("passes the incoming signal through", function(done){
				var fbcf;
				PassAudio(function(input, output){
					fbcf = new FeedbackCombFilter();
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
					fbcf = new FeedbackCombFilter();
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