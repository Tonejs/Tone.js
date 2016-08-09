define(["Tone/component/MidSideCompressor", "helper/Basic", "helper/PassAudio", "helper/PassAudioStereo", "Test"], 
function (MidSideCompressor, Basic, PassAudio, PassAudioStereo, Test) {
	describe("MidSideCompressor", function(){

		Basic(MidSideCompressor);

		context("Compression", function(){

			it("handles input and output connections", function(){
				var comp = new MidSideCompressor();
				Test.connect(comp);
				comp.connect(Test);
				comp.dispose();
			});

			it("passes the incoming signal through", function(done){
				var comp;
				PassAudio(function(input, output){
					comp = new MidSideCompressor();
					input.connect(comp);
					comp.connect(output);
				}, function(){
					comp.dispose();
					done();
				});
			});

			it("passes the incoming stereo signal through", function(done){
				var comp;
				PassAudioStereo(function(input, output){
					comp = new MidSideCompressor();
					input.connect(comp);
					comp.connect(output);
				}, function(){
					comp.dispose();
					done();
				});
			});

			it("can be get and set through object", function(){
				var comp = new MidSideCompressor();
				var values = {
					"mid" : {
						"ratio" : 16,
						"threshold" : -30,
					},
					"side" : {
						"release" : 0.5,
						"attack" : 0.03,
						"knee" : 20
					}
				};
				comp.set(values);
				expect(comp.get()).to.have.keys(["mid", "side"]);
				expect(comp.get().mid.ratio).be.closeTo(16, 0.01);
				expect(comp.get().side.release).be.closeTo(0.5, 0.01);
				comp.dispose();
			});

			it("can be constructed with an options object", function(){
				var comp = new MidSideCompressor({
					"mid" : {
						"ratio" : 16,
						"threshold" : -30,
					},
					"side" : {
						"release" : 0.5,
						"attack" : 0.03,
						"knee" : 20
					}
				});
				expect(comp.mid.ratio.value).be.closeTo(16, 0.01);
				expect(comp.mid.threshold.value).be.closeTo(-30, 0.01);
				expect(comp.side.release.value).be.closeTo(0.5, 0.01);
				expect(comp.side.attack.value).be.closeTo(0.03, 0.01);
				comp.dispose();
			});
		});
	});
});