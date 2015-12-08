define(["Tone/effect/PitchShift", "helper/Basic", "helper/EffectTests"], function (PitchShift, Basic, EffectTests) {
	
	describe("PitchShift", function(){

		Basic(PitchShift);
		EffectTests(PitchShift);

		context("API", function(){

			it ("can pass in options in the constructor", function(){
				var pitchShift = new PitchShift({
					"windowSize" : 0.2,
					"pitch" : 2
				});
				expect(pitchShift.windowSize).to.be.closeTo(0.2, 0.01);
				expect(pitchShift.pitch).to.be.closeTo(2, 0.01);
				pitchShift.dispose();
			});

			it ("can set positive and negative pitches", function(){
				var pitchShift = new PitchShift();
				pitchShift.pitch = 2;
				expect(pitchShift.pitch).to.be.equal(2);
				pitchShift.pitch = -2;
				expect(pitchShift.pitch).to.be.equal(-2);
				pitchShift.pitch = -4.5;
				expect(pitchShift.pitch).to.be.equal(-4.5);
				pitchShift.dispose();
			});

			it ("can get/set the options", function(){
				var pitchShift = new PitchShift();
				pitchShift.set({
					"windowSize" : 0.4,
				});
				expect(pitchShift.get().windowSize).to.be.closeTo(0.4, 0.01);
				pitchShift.dispose();
			});

			it ("can set set the feedback and delay times", function(){
				var pitchShift = new PitchShift({
					"delayTime" : "4n",
					"feedback" : 0.3
				});
				expect(pitchShift.delayTime.value).to.be.closeTo(pitchShift.toSeconds("4n"), 0.01);
				expect(pitchShift.feedback.value).to.be.closeTo(0.3, 0.01);
				pitchShift.delayTime.value = 0.2;
				expect(pitchShift.delayTime.value).to.be.closeTo(0.2, 0.01);
				pitchShift.dispose();
			});
		});
	});
});