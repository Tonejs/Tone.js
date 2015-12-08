define(["Tone/component/PanVol", "helper/Basic", "helper/Offline", "Test", 
	"Tone/signal/Signal", "helper/PassAudio", "helper/PassAudioStereo", "Tone/component/Merge"], 
function (PanVol, Basic, Offline, Test, Signal, PassAudio, PassAudioStereo, Merge) {
	describe("PanVol", function(){

		Basic(PanVol);

		context("Pan and Volume", function(){

			it("handles input and output connections", function(){
				var panVol = new PanVol();
				Test.connect(panVol);
				panVol.connect(Test);
				panVol.dispose();
			});

			it("can be constructed with the panning and volume value", function(){
				var panVol = new PanVol(0.3, -12);
				expect(panVol.pan.value).to.be.closeTo(0.3, 0.001);
				expect(panVol.volume.value).to.be.closeTo(-12, 0.1);
				panVol.dispose();
			});

			it("can be constructed with an options object", function(){
				var panVol = new PanVol({
					"pan" : 0.2
				});
				expect(panVol.pan.value).to.be.closeTo(0.2, 0.001);
				panVol.dispose();
			});

			it("can set/get with an object", function(){
				var panVol = new PanVol();
				panVol.set({
					"volume" : -10
				});
				expect(panVol.get().volume).to.be.closeTo(-10, 0.1);
				panVol.dispose();
			});

			it("passes the incoming signal through", function(done){
				var panVol;
				PassAudio(function(input, output){
					panVol = new PanVol();
					input.connect(panVol);
					panVol.connect(output);
				}, function(){
					panVol.dispose();
					done();
				});
			});

			it("passes the incoming stereo signal through", function(done){
				var panVol;
				PassAudioStereo(function(input, output){
					panVol = new PanVol();
					input.connect(panVol);
					panVol.connect(output);
				}, function(){
					panVol.dispose();
					done();
				});
			});

		});
	});
});