define(["Tone/component/Limiter", "helper/Basic", "helper/PassAudio", "helper/PassAudioStereo", "Test"], 
function (Limiter, Basic, PassAudio, PassAudioStereo, Test) {
	describe("Limiter", function(){

		Basic(Limiter);

		context("Limiting", function(){

			it("handles input and output connections", function(){
				var limiter = new Limiter();
				Test.connect(limiter);
				limiter.connect(Test);
				limiter.dispose();
			});

			it("passes the incoming signal through", function(done){
				var limiter;
				PassAudio(function(input, output){
					limiter = new Limiter();
					input.connect(limiter);
					limiter.connect(output);
				}, function(){
					limiter.dispose();
					done();
				});
			});

			it("passes the incoming stereo signal through", function(done){
				var limiter;
				PassAudioStereo(function(input, output){
					limiter = new Limiter();
					input.connect(limiter);
					limiter.connect(output);
				}, function(){
					limiter.dispose();
					done();
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
});