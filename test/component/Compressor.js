define(["Tone/component/Compressor", "helper/Basic", "helper/PassAudio", "helper/PassAudioStereo", "Test"], 
function (Compressor, Basic, PassAudio, PassAudioStereo, Test) {
	describe("Compressor", function(){

		Basic(Compressor);

		context("Compression", function(){

			it("handles input and output connections", function(){
				var comp = new Compressor();
				Test.connect(comp);
				comp.connect(Test);
				comp.dispose();
			});

			it("passes the incoming signal through", function(done){
				var comp;
				PassAudio(function(input, output){
					comp = new Compressor();
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
					comp = new Compressor();
					input.connect(comp);
					comp.connect(output);
				}, function(){
					comp.dispose();
					done();
				});
			});

			it("can be get and set through object", function(){
				var comp = new Compressor();
				var values = {
					"ratio" : 12,
					"threshold" : -30,
					"release" : 0.5,
					"attack" : 0.03,
					"knee" : 20
				};
				comp.set(values);
				expect(comp.get()).to.have.keys(["ratio", "threshold", "release", "attack", "ratio"]);
				comp.dispose();
			});

			it("can be get and constructed with an object", function(){
				var comp = new Compressor({
					"ratio" : 12,
					"threshold" : -30,
					"release" : 0.5,
					"attack" : 0.03,
					"knee" : 20
				});
				expect(comp.threshold.value).to.have.be.closeTo(-30, 1);
				comp.dispose();
			});

			it("can get/set all interfaces", function(){
				var comp = new Compressor();
				var values = {
					"ratio" : 12,
					"threshold" : -30,
					"release" : 0.5,
					"attack" : 0.03,
					"knee" : 18
				};
				comp.ratio.value = values.ratio;
				comp.threshold.value = values.threshold;
				comp.release.value = values.release;
				comp.attack.value = values.attack;
				comp.knee.value = values.knee;
				expect(comp.ratio.value).to.equal(values.ratio);
				expect(comp.threshold.value).to.equal(values.threshold);
				expect(comp.release.value).to.equal(values.release);
				expect(comp.attack.value).to.be.closeTo(values.attack, 0.01);
				expect(comp.knee.value).to.equal(values.knee);
				comp.dispose();
			});
		});
	});
});