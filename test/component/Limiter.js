import Limiter from "Tone/component/Limiter";
import Basic from "helper/Basic";
import PassAudio from "helper/PassAudio";
import PassAudioStereo from "helper/PassAudioStereo";
import Test from "helper/Test";
describe("Limiter", function(){

	Basic(Limiter);

	context("Limiting", function(){

		it("handles input and output connections", function(){
			var limiter = new Limiter();
			Test.connect(limiter);
			limiter.connect(Test);
			limiter.dispose();
		});

		it("passes the incoming signal through", function(){
			return PassAudio(function(input){
				var limiter = new Limiter().toMaster();
				input.connect(limiter);
			});
		});

		it("passes the incoming stereo signal through", function(){
			return PassAudioStereo(function(input){
				var limiter = new Limiter().toMaster();
				input.connect(limiter);
			});
		});

		it("can be get and set through object", function(){
			var limiter = new Limiter();
			var values = {
				"threshold" : -30,
			};
			limiter.set(values);
			expect(limiter.get().threshold).to.be.closeTo(-30, 0.1);
			limiter.dispose();
		});

		it("can set the threshold", function(){
			var limiter = new Limiter();
			limiter.threshold.value = -10;
			expect(limiter.threshold.value).to.be.closeTo(-10, 0.1);
			limiter.dispose();
		});
	});
});

