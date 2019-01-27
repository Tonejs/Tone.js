import MidSideCompressor from "Tone/component/MidSideCompressor";
import Basic from "helper/Basic";
import PassAudio from "helper/PassAudio";
import PassAudioStereo from "helper/PassAudioStereo";
import Test from "helper/Test";
describe("MidSideCompressor", function(){

	Basic(MidSideCompressor);

	context("Compression", function(){

		it("handles input and output connections", function(){
			var comp = new MidSideCompressor();
			Test.connect(comp);
			comp.connect(Test);
			comp.dispose();
		});

		it("passes the incoming signal through", function(){
			return PassAudio(function(input){
				var comp = new MidSideCompressor().toMaster();
				input.connect(comp);
			});
		});

		it("passes the incoming stereo signal through", function(){
			return PassAudioStereo(function(input){
				var comp = new MidSideCompressor().toMaster();
				input.connect(comp);
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

