define(["Tone/component/Panner", "helper/Basic", "helper/Offline", "Test", 
	"Tone/signal/Signal", "helper/PassAudio", "helper/PassAudioStereo", "Tone/component/Merge"], 
function (Panner, Basic, Offline, Test, Signal, PassAudio, PassAudioStereo, Merge) {
	describe("Panner", function(){

		Basic(Panner);

		context("Panning", function(){

			it("handles input and output connections", function(){
				var panner = new Panner();
				Test.connect(panner);
				panner.connect(Test);
				panner.dispose();
			});

			it("can be constructed with the panning value", function(){
				var panner = new Panner(0.3);
				expect(panner.pan.value).to.be.closeTo(0.3, 0.001);
				panner.dispose();
			});

			it("passes the incoming signal through", function(done){
				var panner;
				PassAudio(function(input, output){
					panner = new Panner();
					input.connect(panner);
					panner.connect(output);
				}, function(){
					panner.dispose();
					done();
				});
			});

			it("passes the incoming stereo signal through", function(done){
				var panner;
				PassAudioStereo(function(input, output){
					panner = new Panner();
					input.connect(panner);
					panner.connect(output);
				}, function(){
					panner.dispose();
					done();
				});
			});

			it("pans hard left when the pan is set to 0", function(done){
				var panner;
				var signal;
				new Offline(0.2, 2)
					.before(function(dest){
						panner = new Panner(0).connect(dest);
						signal = new Signal(1).connect(panner);
					})
					.test(function(samples){
						expect(samples[0]).to.be.closeTo(1, 0.01);
						expect(samples[1]).to.be.closeTo(0, 0.01);
					})
					.after(function(){
						panner.dispose();
						signal.dispose();
						done();
					}).run();
			});

			it("pans hard right when the pan is set to 1", function(done){
				var panner;
				var signal;
				new Offline(0.2, 2)
					.before(function(dest){
						panner = new Panner(1).connect(dest);
						signal = new Signal(1).connect(panner);
					})
					.test(function(samples){
						expect(samples[0]).to.be.closeTo(0, 0.01);
						expect(samples[1]).to.be.closeTo(1, 0.01);
					})
					.after(function(){
						panner.dispose();
						signal.dispose();
						done();
					}).run();
			});

			it("mixes the signal in equal power when panned center", function(done){
				var panner;
				var signal;
				new Offline(0.2, 2)
					.before(function(dest){
						panner = new Panner(0.5).connect(dest);
						signal = new Signal(1).connect(panner);
					})
					.test(function(samples){
						expect(samples[0]).to.be.closeTo(0.707, 0.01);
						expect(samples[1]).to.be.closeTo(0.707, 0.01);
					})
					.after(function(){
						panner.dispose();
						signal.dispose();
						done();
					}).run();
			});
		});
	});
});