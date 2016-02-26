define(["Tone/component/EQ3", "helper/Basic", "helper/Offline", "Test", 
	"Tone/signal/Signal", "helper/PassAudio", "helper/PassAudioStereo"], 
function (EQ3, Basic, Offline, Test, Signal, PassAudio, PassAudioStereo) {
	describe("EQ3", function(){

		Basic(EQ3);

		context("EQing", function(){

			it("handles input and output connections", function(){
				var eq3 = new EQ3();
				Test.connect(eq3);
				eq3.connect(Test);
				eq3.dispose();
			});

			it("can be constructed with an object", function(){
				var eq3 = new EQ3({
					"low" : -8,
					"mid" : -9,
					"high" : -10,
					"lowFrequency" : 500,
					"highFrequency" : 2700
				});
				expect(eq3.low.value).to.be.closeTo(-8, 0.1);
				expect(eq3.mid.value).to.be.closeTo(-9, 0.1);
				expect(eq3.high.value).to.be.closeTo(-10, 0.1);
				expect(eq3.lowFrequency.value).to.be.closeTo(500, 0.01);
				expect(eq3.highFrequency.value).to.be.closeTo(2700, 0.01);
				eq3.dispose();
			});

			it("can be get and set through object", function(){
				var eq3 = new EQ3();
				eq3.set({
					"high" : -4,
					"lowFrequency" : 250,
				});
				expect(eq3.get().high).to.be.closeTo(-4, 0.1);
				expect(eq3.get().lowFrequency).to.be.closeTo(250, 0.01);
				eq3.dispose();
			});

			it("passes the incoming signal through", function(done){
				var eq3;
				PassAudio(function(input, output){
					eq3 = new EQ3({
						"low" : -20,
						"high" : 12
					});
					input.connect(eq3);
					eq3.connect(output);
				}, function(){
					eq3.dispose();
					done();
				});
			});

			it("passes the incoming stereo signal through", function(done){
				var eq3;
				PassAudioStereo(function(input, output){
					eq3 = new EQ3({
						"mid" : -2,
						"high" : 2
					});
					input.connect(eq3);
					eq3.connect(output);
				}, function(){
					eq3.dispose();
					done();
				});
			});
		});
	});
});